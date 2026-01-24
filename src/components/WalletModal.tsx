import { ExternalLink, Wallet, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWallet, WalletType } from "@/hooks/useWallet";
import { cn } from "@/lib/utils";

interface WalletOption {
  id: WalletType;
  name: string;
  icon: string;
  description: string;
}

const walletOptions: WalletOption[] = [
  { id: "valora", name: "Valora", icon: "🟢", description: "Mobile wallet for Celo" },
  { id: "farcaster", name: "Farcaster Warplet", icon: "🟣", description: "Warplet supports Celo" },
  { id: "metamask", name: "MetaMask", icon: "🦊", description: "Browser extension" },
  { id: "celo", name: "Celo Wallet", icon: "🟡", description: "Official Celo wallet" },
  { id: "walletconnect", name: "WalletConnect", icon: "🔗", description: "Connect any wallet" },
  { id: "ledger", name: "Ledger", icon: "🔐", description: "Hardware wallet" },
];

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletModal = ({ isOpen, onClose }: WalletModalProps) => {
  const { 
    address, 
    isConnected, 
    isConnecting, 
    balance, 
    balanceSymbol,
    connectWallet, 
    disconnect, 
    formatAddress,
    isOnCelo,
    ensureCeloNetwork,
  } = useWallet();

  const handleConnect = async (walletId: WalletType) => {
    try {
      await connectWallet(walletId);
      // Don't close immediately - wait for connection
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-secondary text-secondary-foreground border-none">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            {isConnected ? "Your Wallet" : "Connect Wallet"}
          </DialogTitle>
        </DialogHeader>

        {isConnected && address ? (
          <div className="py-4 space-y-4">
            {/* Network Status */}
            {!isOnCelo && (
              <div className="bg-destructive/20 rounded-xl p-3 text-center">
                <p className="text-sm text-destructive mb-2">Wrong network detected</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={ensureCeloNetwork}
                  className="border-destructive text-destructive hover:bg-destructive/20"
                >
                  Switch to Celo
                </Button>
              </div>
            )}

            {/* Connected Address */}
            <div className="bg-muted rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Connected Address</p>
              <p className="font-mono text-sm break-all">{address}</p>
            </div>

            {/* Balance */}
            {balance && (
              <div className="bg-muted rounded-xl p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Balance</p>
                <p className="text-xl font-bold">
                  {parseFloat(balance).toFixed(4)} {balanceSymbol}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 bg-card/10 border-card/20 text-secondary-foreground hover:bg-card/20"
                onClick={() => window.open(`https://celoscan.io/address/${address}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Explorer
              </Button>
              <Button
                variant="outline"
                className="flex-1 bg-destructive/20 border-destructive/30 text-destructive hover:bg-destructive/30"
                onClick={handleDisconnect}
              >
                Disconnect
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-2 space-y-2">
            {walletOptions.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => handleConnect(wallet.id)}
                disabled={isConnecting}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-xl bg-card/10 hover:bg-card/20 transition-colors text-left",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <span className="text-2xl">{wallet.icon}</span>
                <div className="flex-1">
                  <span className="font-semibold block">{wallet.name}</span>
                  <span className="text-xs text-muted-foreground">{wallet.description}</span>
                </div>
                {isConnecting && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </button>
            ))}
            
            <p className="text-center text-sm text-muted-foreground pt-4">
              <a 
                href="https://docs.celo.org/wallet" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Learn More
              </a>
              {" "}about Celo wallets
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WalletModal;
