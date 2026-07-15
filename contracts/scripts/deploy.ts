import { ethers } from "hardhat";

/**
 * Kaboom Deployment Script
 * 
 * Deploys:
 * 1. KaboomFeeVault
 * 2. KaboomFactory
 * 3. KaboomRouter
 * 
 * Prerequisites:
 * - wCELO address for target network
 * - Platform wallet address
 */

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);

  // Network-specific addresses
  const NETWORK = process.env.NETWORK || "alfajores";
  
  const ADDRESSES = {
    // Celo Mainnet
    celo: {
      wCELO: "0x471EcE3750Da237f93B8E339c536989b8978a438",
    },
    // Alfajores Testnet
    alfajores: {
      wCELO: "0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9", // CELO on testnet
    },
  };

  const networkAddresses = ADDRESSES[NETWORK as keyof typeof ADDRESSES];
  if (!networkAddresses) {
    throw new Error(`Unknown network: ${NETWORK}`);
  }

  const platformWallet = process.env.PLATFORM_WALLET || deployer.address;
  const feeToken = process.env.FEE_TOKEN || networkAddresses.wCELO;

  console.log("\n📦 Deploying KaboomFeeVault...");
  const KaboomFeeVault = await ethers.getContractFactory("KaboomFeeVault");
  const feeVault = await KaboomFeeVault.deploy(
    feeToken,
    platformWallet,
    deployer.address // Factory address placeholder, will be updated
  );
  await feeVault.waitForDeployment();
  const feeVaultAddress = await feeVault.getAddress();
  console.log("✅ KaboomFeeVault deployed to:", feeVaultAddress);

  console.log("\n📦 Deploying KaboomFactory...");
  const KaboomFactory = await ethers.getContractFactory("KaboomFactory");
  const factory = await KaboomFactory.deploy(
    feeToken,
    feeVaultAddress,
    platformWallet
  );
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("✅ KaboomFactory deployed to:", factoryAddress);

  console.log("\n� Linking fee vault to factory...");
  const feeVaultContract = await ethers.getContractAt("KaboomFeeVault", feeVaultAddress);
  await feeVaultContract.setFactory(factoryAddress);
  console.log("✅ Fee vault linked to factory.");

  console.log("\n�📦 Deploying KaboomRouter...");
  const KaboomRouter = await ethers.getContractFactory("KaboomRouter");
  const router = await KaboomRouter.deploy(
    factoryAddress,
    feeVaultAddress,
    feeToken
  );
  await router.waitForDeployment();
  const routerAddress = await router.getAddress();
  console.log("✅ KaboomRouter deployed to:", routerAddress);

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("🚀 KABOOM DEPLOYMENT COMPLETE");
  console.log("=".repeat(50));
  console.log("\nNetwork:", NETWORK);
  console.log("\nContract Addresses:");
  console.log("  KaboomFeeVault:", feeVaultAddress);
  console.log("  KaboomFactory: ", factoryAddress);
  console.log("  KaboomRouter:  ", routerAddress);
  console.log("\nConfiguration:");
  console.log("  Fee Token:     ", feeToken);
  console.log("  Default wCELO: ", networkAddresses.wCELO);
  console.log("  Platform Wallet:", platformWallet);
  console.log("\n" + "=".repeat(50));

  // Return addresses for verification
  return {
    feeVault: feeVaultAddress,
    factory: factoryAddress,
    router: routerAddress,
  };
}

main()
  .then((addresses) => {
    console.log("\n📝 Update src/lib/wagmi.ts with these addresses:");
    console.log(`
export const CONTRACTS = {
  tokenFactory: '${addresses.factory}',
  router: '${addresses.router}',
  feeVault: '${addresses.feeVault}',
  wCELO: '0x471EcE3750Da237f93B8E339c536989b8978a438',
} as const;
    `);
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
