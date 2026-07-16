import { useAccount, useDisconnect, useBalance, useChainId, useSwitchChain } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { celo } from 'wagmi/chains';
import { celoSepolia } from '@/lib/wagmi';
import { useCallback } from 'react';

export function useWallet() {
  const { address, isConnected, isConnecting, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  
  const { data: balance } = useBalance({
    address,
  });

  const connectWallet = useCallback(() => {
    if (openConnectModal) {
      openConnectModal();
    }
  }, [openConnectModal]);

  const ensureCeloNetwork = useCallback(async () => {
    if (chainId !== celo.id && switchChain) {
      try {
        switchChain({ chainId: celo.id });
      } catch (error) {
        console.error('Failed to switch to Celo:', error);
      }
    }
  }, [chainId, switchChain]);

  const formatAddress = useCallback((addr?: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }, []);

  // Format balance properly - viem returns value directly
  const formattedBalance = balance?.value 
    ? (Number(balance.value) / 10 ** (balance.decimals || 18)).toFixed(4)
    : undefined;

  return {
    address,
    isConnected,
    isConnecting,
    balance: formattedBalance,
    balanceSymbol: balance?.symbol,
    chainId,
    connector,
    connectWallet,
    disconnect,
    ensureCeloNetwork,
    formatAddress,
    isOnCelo: chainId === celo.id,
  };
}