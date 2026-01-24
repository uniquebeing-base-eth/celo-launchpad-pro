import { useAccount, useConnect, useDisconnect, useBalance, useChainId, useSwitchChain } from 'wagmi';
import { celo } from 'wagmi/chains';
import { useCallback } from 'react';

export type WalletType = 'metamask' | 'valora' | 'celo' | 'walletconnect' | 'farcaster' | 'ledger';

export function useWallet() {
  const { address, isConnected, isConnecting, connector } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  
  const { data: balance } = useBalance({
    address,
  });

  // Find specific connectors
  const injectedConnector = connectors.find(c => c.id === 'injected');
  const walletConnectConnector = connectors.find(c => c.id === 'walletConnect');
  const metaMaskConnector = connectors.find(c => c.id === 'io.metamask' || c.name === 'MetaMask');

  const connectWallet = useCallback(async (walletType: WalletType) => {
    try {
      let connector;
      
      switch (walletType) {
        case 'metamask':
          // Try MetaMask specific first, then injected
          connector = metaMaskConnector || injectedConnector;
          break;
        case 'valora':
        case 'celo':
        case 'farcaster':
          // These use WalletConnect
          connector = walletConnectConnector;
          break;
        case 'walletconnect':
          connector = walletConnectConnector;
          break;
        case 'ledger':
          // Ledger also uses WalletConnect for web
          connector = walletConnectConnector;
          break;
        default:
          connector = injectedConnector || walletConnectConnector;
      }

      if (connector) {
        connect({ connector, chainId: celo.id });
      } else {
        console.error('No suitable connector found for', walletType);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }, [connect, injectedConnector, walletConnectConnector, metaMaskConnector]);

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
    isConnecting: isConnecting || isPending,
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
