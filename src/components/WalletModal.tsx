import { X, Check, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface WalletOption {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const walletOptions: WalletOption[] = [
  { id: "valora", name: "Valora", icon: "✓", color: "bg-green-500" },
  { id: "celo", name: "Celo Wallet", icon: "🟡", color: "bg-yellow-500" },
  { id: "metamask", name: "MetaMask", icon: "🦊", color: "bg-orange-500" },
  { id: "ledger", name: "Ledger", icon: "🔐", color: "bg-gray-700" },
  { id: "walletconnect", name: "WalletConnect", icon: "🔗", color: "bg-blue-500" },
];

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (walletId: string) => void;
  connectedAddress?: string;
}

const WalletModal = ({ isOpen, onClose, onConnect, connectedAddress }: WalletModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-secondary text-secondary-foreground border-none">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            {connectedAddress ? "Your Wallet" : "Choose your wallet"}
          </DialogTitle>
        </DialogHeader>

        {connectedAddress ? (
          <div className="py-4 space-y-4">
            <div className="bg-secondary/50 rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Connected Address</p>
              <p className="font-mono text-sm break-all">{connectedAddress}</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 bg-card/10 border-card/20 text-secondary-foreground hover:bg-card/20"
                onClick={() => window.open(`https://celoscan.io/address/${connectedAddress}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Explorer
              </Button>
              <Button
                variant="outline"
                className="flex-1 bg-destructive/20 border-destructive/30 text-destructive hover:bg-destructive/30"
                onClick={onClose}
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
                onClick={() => onConnect(wallet.id)}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-card/10 hover:bg-card/20 transition-colors text-left"
              >
                <span className="text-2xl">{wallet.icon}</span>
                <span className="font-semibold flex-1">{wallet.name}</span>
              </button>
            ))}
            
            <p className="text-center text-sm text-muted-foreground pt-4">
              <a href="#" className="text-primary hover:underline">Learn More</a>
              {" "}about Celo wallets
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WalletModal;
