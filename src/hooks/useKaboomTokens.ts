import { useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';
import { celoAlfajores } from 'wagmi/chains';
import { CONTRACTS, KABOOM_FACTORY_ABI } from '@/lib/wagmi';
import { formatUnits } from 'viem';

export interface KaboomTokenData {
  id: string;
  address: string;
  name: string;
  symbol: string;
  creator: string;
  lpVault: string;
  creatorVault: string;
  creatorFee: number;
  virtualPrice: string;
  virtualMarketCap: string;
  launchTime: number;
  price: number;
  priceChange: number;
  volume: string;
  marketCap: number;
  pair: string;
  contractAddress: string;
  twitterLink: string;
  telegramLink: string;
  websiteLink: string;
  farcasterLink: string;
}

export function useKaboomTokens() {
  const [tokens, setTokens] = useState<KaboomTokenData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const publicClient = usePublicClient({ chainId: celoAlfajores.id });

  useEffect(() => {
    if (!publicClient) return;

    const fetchTokens = async () => {
      try {
        setIsLoading(true);
        
        // Get all tokens from factory
        const allTokens = await publicClient.readContract({
          address: CONTRACTS.tokenFactory as `0x${string}`,
          abi: KABOOM_FACTORY_ABI,
          functionName: 'getAllTokens',
        }) as string[];

        if (!allTokens || allTokens.length === 0) {
          setTokens([]);
          return;
        }

        // Fetch info for each token
        const tokenDataPromises = allTokens.map(async (tokenAddress) => {
          try {
            const info = await publicClient.readContract({
              address: CONTRACTS.tokenFactory as `0x${string}`,
              abi: KABOOM_FACTORY_ABI,
              functionName: 'getTokenInfo',
              args: [tokenAddress as `0x${string}`],
            }) as any[];

            const socialLinks = await publicClient.readContract({
              address: CONTRACTS.tokenFactory as `0x${string}`,
              abi: KABOOM_FACTORY_ABI,
              functionName: 'getTokenSocials',
              args: [tokenAddress as `0x${string}`],
            }) as string[];

            const virtualPrice = Number(formatUnits(BigInt(info[3]), 18));
            const launchTime = Number(info[6]);
            const timeSinceLaunch = Date.now() / 1000 - launchTime;
            
            // Mock price change based on time (in real app, fetch from price oracle)
            const priceChange = Math.sin(timeSinceLaunch / 1000) * 5;

            return {
              id: tokenAddress.slice(0, 10),
              address: tokenAddress,
              name: 'Token', // Will need to fetch from token contract
              symbol: 'TKN', // Will need to fetch from token contract
              creator: info[0],
              lpVault: info[1],
              creatorVault: info[2],
              creatorFee: Number(info[5]),
              virtualPrice: formatUnits(BigInt(info[3]), 18),
              virtualMarketCap: formatUnits(BigInt(info[4]), 18),
              launchTime: launchTime,
              price: virtualPrice,
              priceChange: priceChange,
              volume: '0k',
              marketCap: 25000,
              pair: 'USDC',
              contractAddress: tokenAddress.slice(0, 6) + '...' + tokenAddress.slice(-4),
              twitterLink: socialLinks[0],
              telegramLink: socialLinks[1],
              websiteLink: socialLinks[2],
              farcasterLink: socialLinks[3],
            } as KaboomTokenData;
          } catch (e) {
            console.error('Error fetching token info:', e);
            return null;
          }
        });

        const fetchedTokens = await Promise.all(tokenDataPromises);
        setTokens(fetchedTokens.filter((t) => t !== null) as KaboomTokenData[]);
      } catch (e) {
        console.error('Error fetching tokens:', e);
        setError(e instanceof Error ? e.message : 'Failed to fetch tokens');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokens();
  }, [publicClient]);

  return { tokens, isLoading, error };
}
