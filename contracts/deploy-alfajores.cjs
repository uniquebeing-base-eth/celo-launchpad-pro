process.chdir('/workspaces/celo-launchpad-pro/contracts');

const hardhat = require('hardhat');
const { ethers } = hardhat;

async function main() {
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log('Deploying contracts with:', deployer.address);
  console.log('Deployer balance (wei):', balance.toString());

  const feeToken = process.env.FEE_TOKEN || '0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9';
  const platformWallet = process.env.PLATFORM_WALLET || deployer.address;

  console.log('Using fee token:', feeToken);
  console.log('Using platform wallet:', platformWallet);

  const KaboomFeeVault = await ethers.getContractFactory('KaboomFeeVault');
  const feeVault = await KaboomFeeVault.deploy(feeToken, platformWallet, deployer.address, {
    gasPrice: 20000000000n,
    gasLimit: 8_000_000,
  });
  await feeVault.waitForDeployment();
  const feeVaultAddress = await feeVault.getAddress();
  console.log('FeeVault:', feeVaultAddress);

  const KaboomFactory = await ethers.getContractFactory('KaboomFactory');
  const factory = await KaboomFactory.deploy(feeToken, feeVaultAddress, platformWallet, {
    gasPrice: 20000000000n,
    gasLimit: 8_000_000,
  });
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log('Factory:', factoryAddress);

  const feeVaultContract = await ethers.getContractAt('KaboomFeeVault', feeVaultAddress);
  await feeVaultContract.setFactory(factoryAddress, {
    gasPrice: 20000000000n,
    gasLimit: 3_000_000,
  });
  console.log('Factory linked to fee vault.');

  const KaboomRouter = await ethers.getContractFactory('KaboomRouter');
  const nonce = await ethers.provider.getTransactionCount(deployer.address, 'pending');
  const router = await KaboomRouter.deploy(factoryAddress, feeVaultAddress, feeToken, {
    gasPrice: 25000000000n,
    gasLimit: 8_000_000,
    nonce,
  });
  await router.waitForDeployment();
  const routerAddress = await router.getAddress();
  console.log('Router:', routerAddress);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
