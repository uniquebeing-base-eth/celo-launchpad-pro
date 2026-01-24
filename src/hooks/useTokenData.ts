import { useReadContract, useReadContracts } from 'wagmi';
import { formatUnits, isAddress } from 'viem';
import { ERC20_ABI } from '@/lib/wagmi';
import { celo } from 'wagmi/chains';

interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  formattedTotalSupply: string;
}

export function useTokenInfo(tokenAddress?: string) {
  const validAddress = tokenAddress && isAddress(tokenAddress) ? tokenAddress as `0x${string}` : undefined;
  
  const { data, isLoading, error } = useReadContracts({
    contracts: validAddress ? [
      {
        address: validAddress,
        abi: ERC20_ABI,
        functionName: 'name',
        chainId: celo.id,
      },
      {
        address: validAddress,
        abi: ERC20_ABI,
        functionName: 'symbol',
        chainId: celo.id,
      },
      {
        address: validAddress,
        abi: ERC20_ABI,
        functionName: 'decimals',
        chainId: celo.id,
      },
      {
        address: validAddress,
        abi: ERC20_ABI,
        functionName: 'totalSupply',
        chainId: celo.id,
      },
    ] : [],
    query: {
      enabled: !!validAddress,
    },
  });

  const tokenInfo: TokenInfo | null = data && data[0]?.result && data[1]?.result ? {
    name: data[0].result as string,
    symbol: data[1].result as string,
    decimals: (data[2]?.result as number) || 18,
    totalSupply: data[3]?.result?.toString() || '0',
    formattedTotalSupply: data[3]?.result 
      ? formatUnits(data[3].result as bigint, (data[2]?.result as number) || 18)
      : '0',
  } : null;

  return {
    tokenInfo,
    isLoading,
    error,
  };
}

export function useTokenBalance(tokenAddress?: string, walletAddress?: string) {
  const validTokenAddress = tokenAddress && isAddress(tokenAddress) ? tokenAddress as `0x${string}` : undefined;
  const validWalletAddress = walletAddress && isAddress(walletAddress) ? walletAddress as `0x${string}` : undefined;

  const { data, isLoading, error } = useReadContract({
    address: validTokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: validWalletAddress ? [validWalletAddress] : undefined,
    chainId: celo.id,
    query: {
      enabled: !!validTokenAddress && !!validWalletAddress,
    },
  });

  return {
    balance: data ? (data as bigint).toString() : '0',
    formattedBalance: data ? formatUnits(data as bigint, 18) : '0',
    isLoading,
    error,
  };
}
