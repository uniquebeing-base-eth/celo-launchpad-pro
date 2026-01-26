import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { celo, celoAlfajores } from 'wagmi/chains';

// WalletConnect project ID - for production, get one from https://cloud.walletconnect.com
const projectId = 'a4c23e4c46e9f41b72d19af4e3b36bc1';

export const config = getDefaultConfig({
  appName: 'Kaboom',
  projectId,
  chains: [celo, celoAlfajores],
  transports: {
    [celo.id]: http('https://forno.celo.org'),
    [celoAlfajores.id]: http('https://alfajores-forno.celo-testnet.org'),
  },
});

// Export chain info for easy access
export const CELO_CHAIN = celo;
export const CELO_TESTNET = celoAlfajores;

// Contract addresses - UPDATE AFTER DEPLOYMENT
export const CONTRACTS = {
  tokenFactory: '0x0000000000000000000000000000000000000000', // Replace after deploy
  router: '0x0000000000000000000000000000000000000000', // Replace after deploy
  feeVault: '0x0000000000000000000000000000000000000000', // Replace after deploy
  wCELO: '0x471EcE3750Da237f93B8E339c536989b8978a438', // Official CELO address
} as const;

// Token constants
export const TOKEN_CONSTANTS = {
  TOTAL_SUPPLY: 50_000_000_000n * 10n ** 18n, // 50B with 18 decimals
  LP_ALLOCATION_PERCENT: 70,
  CREATOR_ALLOCATION_PERCENT: 30,
  VIRTUAL_PRICE: 5n * 10n ** 11n, // $0.0000005
  VIRTUAL_MARKET_CAP: 25_000n * 10n ** 18n, // $25,000
  PLATFORM_FEE_BPS: 40, // 0.4%
  MAX_CREATOR_FEE_BPS: 300, // 3%
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
  {
    constant: false,
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function',
  },
] as const;

// Kaboom Factory ABI
export const KABOOM_FACTORY_ABI = [
  {
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'symbol', type: 'string' },
      { name: 'creatorFee', type: 'uint256' },
      { name: 'vaultDuration', type: 'uint256' },
      { name: 'twitterLink', type: 'string' },
      { name: 'telegramLink', type: 'string' },
      { name: 'websiteLink', type: 'string' },
      { name: 'farcasterLink', type: 'string' },
    ],
    name: 'launchToken',
    outputs: [{ name: 'token', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'creator', type: 'address' }],
    name: 'getTokensByCreator',
    outputs: [{ name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAllTokens',
    outputs: [{ name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'token', type: 'address' }],
    name: 'isKaboomToken',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'token', type: 'address' }],
    name: 'getTokenInfo',
    outputs: [
      { name: 'creator', type: 'address' },
      { name: 'lpVault', type: 'address' },
      { name: 'feeVaultAddr', type: 'address' },
      { name: 'virtualPrice', type: 'uint256' },
      { name: 'virtualMarketCap', type: 'uint256' },
      { name: 'creatorFee', type: 'uint256' },
      { name: 'launchTime', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'token', type: 'address' }],
    name: 'getTokenSocials',
    outputs: [
      { name: 'twitterLink', type: 'string' },
      { name: 'telegramLink', type: 'string' },
      { name: 'websiteLink', type: 'string' },
      { name: 'farcasterLink', type: 'string' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getTokenCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'token', type: 'address' },
      { indexed: true, name: 'creator', type: 'address' },
      { indexed: false, name: 'lpVault', type: 'address' },
      { indexed: false, name: 'creatorVault', type: 'address' },
      { indexed: false, name: 'totalSupply', type: 'uint256' },
      { indexed: false, name: 'virtualPrice', type: 'uint256' },
      { indexed: false, name: 'virtualMarketCap', type: 'uint256' },
      { indexed: false, name: 'timestamp', type: 'uint256' },
    ],
    name: 'TokenLaunched',
    type: 'event',
  },
] as const;

// Kaboom Router ABI
export const KABOOM_ROUTER_ABI = [
  {
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'amountIn', type: 'uint256' },
      { name: 'minAmountOut', type: 'uint256' },
    ],
    name: 'buy',
    outputs: [{ name: 'amountOut', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'amountIn', type: 'uint256' },
      { name: 'minAmountOut', type: 'uint256' },
    ],
    name: 'sell',
    outputs: [{ name: 'amountOut', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'amountIn', type: 'uint256' },
    ],
    name: 'getBuyQuote',
    outputs: [
      { name: 'amountOut', type: 'uint256' },
      { name: 'priceImpact', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'amountIn', type: 'uint256' },
    ],
    name: 'getSellQuote',
    outputs: [
      { name: 'amountOut', type: 'uint256' },
      { name: 'priceImpact', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'token', type: 'address' },
      { indexed: true, name: 'trader', type: 'address' },
      { indexed: false, name: 'isBuy', type: 'bool' },
      { indexed: false, name: 'amountIn', type: 'uint256' },
      { indexed: false, name: 'amountOut', type: 'uint256' },
      { indexed: false, name: 'price', type: 'uint256' },
      { indexed: false, name: 'timestamp', type: 'uint256' },
    ],
    name: 'Trade',
    type: 'event',
  },
] as const;

// Fee Vault ABI
export const KABOOM_FEE_VAULT_ABI = [
  {
    inputs: [{ name: 'to', type: 'address' }],
    name: 'claimPlatformFees',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'to', type: 'address' },
    ],
    name: 'claimCreatorFees',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pendingPlatformFees',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'token', type: 'address' }],
    name: 'pendingCreatorFees',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Vault duration options (in seconds)
export const VAULT_DURATIONS = {
  INSTANT: 0,
  DAYS_7: 7 * 24 * 60 * 60,
  DAYS_30: 30 * 24 * 60 * 60,
  DAYS_180: 180 * 24 * 60 * 60,
  DAYS_365: 365 * 24 * 60 * 60,
} as const;
