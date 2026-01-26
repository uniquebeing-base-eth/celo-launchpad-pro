# Kaboom Smart Contracts 💥

Non-custodial, rug-proof token launchpad on Celo.

## Overview

Kaboom allows anyone to launch tokens with:
- **Fixed supply**: 50B tokens
- **70% locked in LP**: Permanent liquidity lock
- **30% creator vault**: Optional vesting (7d, 30d, 180d, 365d)
- **Fee collection**: Platform 0.4% + Creator 1-3% in wCELO
- **Virtual pricing**: $0.0000005 starting price, $25k FDV

## Contracts

| Contract | Description |
|----------|-------------|
| `KaboomFactory.sol` | Main entry point for launching tokens |
| `KaboomToken.sol` | Standard ERC-20 with fixed supply |
| `KaboomLPVault.sol` | Permanent LP lock (no withdrawals ever) |
| `KaboomCreatorVault.sol` | Vesting vault for creator's 30% |
| `KaboomFeeVault.sol` | Fee collection in wCELO |
| `KaboomRouter.sol` | Trade router with fee deduction |

## Setup

```bash
# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to testnet
PRIVATE_KEY=0x... npx hardhat run scripts/deploy.ts --network alfajores

# Deploy to mainnet
PRIVATE_KEY=0x... npx hardhat run scripts/deploy.ts --network celo
```

## Environment Variables

Create a `.env` file:

```env
PRIVATE_KEY=your_deployer_private_key
PLATFORM_WALLET=address_to_receive_platform_fees
CELOSCAN_API_KEY=optional_for_verification
```

## Token Economics

### Supply Distribution
- **Total Supply**: 50,000,000,000 (50B)
- **LP Allocation**: 35,000,000,000 (70%)
- **Creator Allocation**: 15,000,000,000 (30%)

### Virtual Pricing
- **Starting Price**: $0.0000005
- **Virtual Market Cap**: $25,000
- **Virtual Liquidity**: $17,500 (70% of FDV)

### Fees (in wCELO)
- **Platform Fee**: 0.4% (fixed)
- **Creator Fee**: 1-3% (set at launch)

## Vesting Options

Creator's 30% allocation can be vested:

| Duration | Lock Period | Vesting |
|----------|-------------|---------|
| Instant | 0 | Immediately available |
| 7 Days | 7 days | Linear over 7 days |
| 30 Days | 30 days | Linear over 30 days |
| 180 Days | 180 days | Linear over 180 days |
| 365 Days | 365 days | Linear over 365 days |

## Security

- ✅ No upgradeable proxies
- ✅ No owner mint/burn functions
- ✅ LP permanently locked
- ✅ Custom errors for gas efficiency
- ✅ Checks-Effects-Interactions pattern
- ✅ ReentrancyGuard on router

## Events for Indexing

```solidity
// Factory events
event TokenLaunched(address token, address creator, ...);
event TokenMetadataSet(address token, string twitter, ...);

// Router events (for charts)
event Trade(address token, address trader, bool isBuy, uint256 amountIn, uint256 amountOut, uint256 price, uint256 timestamp);
event PoolInitialized(address token, address pool, uint256 liquidity, uint256 timestamp);

// Fee events
event FeesCollected(address token, uint256 platformFee, uint256 creatorFee);
event PlatformFeesClaimed(address to, uint256 amount);
event CreatorFeesClaimed(address token, address to, uint256 amount);
```

## Frontend Integration

After deployment, update `src/lib/wagmi.ts`:

```typescript
export const CONTRACTS = {
  tokenFactory: '0x...deployed_factory_address',
  router: '0x...deployed_router_address',
  feeVault: '0x...deployed_fee_vault_address',
  wCELO: '0x471EcE3750Da237f93B8E339c536989b8978a438',
} as const;
```

## License

MIT
