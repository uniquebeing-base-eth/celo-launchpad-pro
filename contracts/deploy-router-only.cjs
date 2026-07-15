process.chdir('/workspaces/celo-launchpad-pro/contracts');

const hardhat = require('hardhat');
const { ethers } = hardhat;

async function main() {
  const [deployer] = await ethers.getSigners();
  const feeVaultAddress = '0x40d83104aB41DDe890d656d08F3D3e4B67c8dA5d';
  const factoryAddress = '0x09cBf6bFf7e00DB5f25EC1aB3a9b3D5EaAfCCD21';
  const feeToken = process.env.FEE_TOKEN || '0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9';

  const KaboomRouter = await ethers.getContractFactory('KaboomRouter');
  const nonce = await ethers.provider.getTransactionCount(deployer.address, 'pending');
  const router = await KaboomRouter.deploy(factoryAddress, feeVaultAddress, feeToken, {
    gasPrice: 50000000000n,
    gasLimit: 8_000_000,
    nonce,
  });

  await router.waitForDeployment();
  console.log('Router:', await router.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
