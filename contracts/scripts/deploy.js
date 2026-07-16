const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with:', deployer.address);

  const NETWORK = process.env.NETWORK || 'alfajores';

  const ADDRESSES = {
    celo: {
      wCELO: '0x471EcE3750Da237f93B8E339c536989b8978a438',
    },
    alfajores: {
      wCELO: '0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9',
    },
  };

  const networkAddresses = ADDRESSES[NETWORK];
  if (!networkAddresses) {
    throw new Error(`Unknown network: ${NETWORK}`);
  }

  const platformWallet = process.env.PLATFORM_WALLET || deployer.address;

  console.log('\n📦 Deploying KaboomFeeVault...');
  const KaboomFeeVault = await ethers.getContractFactory('KaboomFeeVault');
  const feeVault = await KaboomFeeVault.deploy(
    networkAddresses.wCELO,
    platformWallet,
    deployer.address
  );
  await feeVault.waitForDeployment();
  const feeVaultAddress = await feeVault.getAddress();
  console.log('✅ KaboomFeeVault deployed to:', feeVaultAddress);

  console.log('\n📦 Deploying KaboomFactory...');
  const KaboomFactory = await ethers.getContractFactory('KaboomFactory');
  const factory = await KaboomFactory.deploy(
    networkAddresses.wCELO,
    feeVaultAddress,
    platformWallet,
    process.env.USDC_ADDRESS || "0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B"
  );
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log('✅ KaboomFactory deployed to:', factoryAddress);

  console.log('\n📦 Deploying KaboomRouter...');
  const KaboomRouter = await ethers.getContractFactory('KaboomRouter');
  const router = await KaboomRouter.deploy(
    factoryAddress,
    feeVaultAddress,
    networkAddresses.wCELO,
    process.env.USDC_ADDRESS || "0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B"
  );
  await router.waitForDeployment();
  const routerAddress = await router.getAddress();
  console.log('✅ KaboomRouter deployed to:', routerAddress);

  console.log('\n' + '='.repeat(50));
  console.log('🚀 KABOOM DEPLOYMENT COMPLETE');
  console.log('='.repeat(50));
  console.log('\nNetwork:', NETWORK);
  console.log('\nContract Addresses:');
  console.log('  KaboomFeeVault:', feeVaultAddress);
  console.log('  KaboomFactory: ', factoryAddress);
  console.log('  KaboomRouter:  ', routerAddress);
  console.log('\nConfiguration:');
  console.log('  wCELO:         ', networkAddresses.wCELO);
  console.log('  Platform Wallet:', platformWallet);
  console.log('\n' + '='.repeat(50));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
