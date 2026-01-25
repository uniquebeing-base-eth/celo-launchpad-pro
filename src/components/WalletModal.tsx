import { ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { ConnectButton } from "@rainbow-me/rainbowkit";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletModal = ({ isOpen, onClose }: WalletModalProps) => {
  const { 
    address, 
    isConnected, 
    balance, 
    balanceSymbol,
    disconnect, 
    isOnCelo,
    ensureCeloNetwork,
  } = useWallet();

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
          <div className="py-4 flex flex-col items-center gap-4">
            <p className="text-muted-foreground text-sm text-center mb-2">
              Connect with MetaMask, Valora, Farcaster Warplet, or any WalletConnect-compatible wallet.
            </p>
            
            {/* RainbowKit Connect Button */}
            <ConnectButton.Custom>
              {({ openConnectModal, mounted }) => {
                const ready = mounted;
                
                return (
                  <div
                    {...(!ready && {
                      'aria-hidden': true,
                      style: {
                        opacity: 0,
                        pointerEvents: 'none',
                        userSelect: 'none',
                      },
                    })}
                    className="w-full"
                  >
                    <Button 
                      onClick={openConnectModal} 
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg"
                    >
                      Connect Wallet
                    </Button>
                  </div>
                );
              }}
            </ConnectButton.Custom>
            
            <p className="text-center text-sm text-muted-foreground pt-2">
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