import { http, createConfig } from 'wagmi';
import { celo, celoAlfajores } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

// WalletConnect project ID - for production, get one from https://cloud.walletconnect.com
const projectId = 'a4c23e4c46e9f41b72d19af4e3b36bc1';

// Custom connector metadata
const metadata = {
  name: 'Kaboom',
  description: 'Token Launchpad on Celo',
  url: 'https://kaboom.app',
  icons: ['/favicon.png'],
};

export const config = createConfig({
  chains: [celo, celoAlfajores],
  connectors: [
    // Injected wallets (MetaMask, Valora, Celo Extension Wallet, etc.)
    injected({
      target: 'metaMask',
    }),
    // WalletConnect for mobile wallets
    walletConnect({
      projectId,
      metadata,
      showQrModal: true,
    }),
    // Generic injected connector for other wallets
    injected(),
  ],
  transports: {
    [celo.id]: http('https://forno.celo.org'),
    [celoAlfajores.id]: http('https://alfajores-forno.celo-testnet.org'),
  },
});

// Export chain info for easy access
export const CELO_CHAIN = celo;
export const CELO_TESTNET = celoAlfajores;

// Contract addresses (placeholder - replace with actual deployed contracts)
export const CONTRACTS = {
  tokenFactory: '0x0000000000000000000000000000000000000000',
  router: '0x0000000000000000000000000000000000000000',
  wCELO: '0x471EcE3750Da237f93B8E339c536989b8978a438', // Official CELO address
} as const;

// ERC20 ABI for reading token data
export const ERC20_ABI = [
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
] as const;
