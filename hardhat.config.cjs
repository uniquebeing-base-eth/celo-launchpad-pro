const path = require('path');
const dotenv = require(path.resolve(__dirname, 'contracts/node_modules/dotenv'));
const { config: dotenvConfig } = dotenv;

const contractsRoot = path.resolve(__dirname, 'contracts');
dotenvConfig({ path: path.resolve(contractsRoot, '.env') });

const PRIVATE_KEY = process.env.PRIVATE_KEY || '0x0000000000000000000000000000000000000000000000000000000000000001';

module.exports = {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    alfajores: {
      url: 'https://alfajores-forno.celo-testnet.org',
      accounts: [PRIVATE_KEY],
      chainId: 44787,
    },
    celo: {
      url: 'https://forno.celo.org',
      accounts: [PRIVATE_KEY],
      chainId: 42220,
    },
  },
  etherscan: {
    apiKey: {
      celo: process.env.CELOSCAN_API_KEY || '',
      alfajores: process.env.CELOSCAN_API_KEY || '',
    },
    customChains: [
      {
        network: 'celo',
        chainId: 42220,
        urls: {
          apiURL: 'https://api.celoscan.io/api',
          browserURL: 'https://celoscan.io',
        },
      },
      {
        network: 'alfajores',
        chainId: 44787,
        urls: {
          apiURL: 'https://api-alfajores.celoscan.io/api',
          browserURL: 'https://alfajores.celoscan.io',
        },
      },
    ],
  },
  paths: {
    sources: path.resolve(contractsRoot, 'src'),
    tests: path.resolve(contractsRoot, 'test'),
    cache: path.resolve(contractsRoot, 'cache'),
    artifacts: path.resolve(contractsRoot, 'artifacts'),
  },
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
};
