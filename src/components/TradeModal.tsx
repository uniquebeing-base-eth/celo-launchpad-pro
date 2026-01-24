import { useState } from "react";
import { ArrowDownUp, Loader2, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Token } from "./TokenCard";

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: Token | null;
  walletConnected: boolean;
  onConnectWallet: () => void;
}

const TradeModal = ({ isOpen, onClose, token, walletConnected, onConnectWallet }: TradeModalProps) => {
  const [amount, setAmount] = useState("");
  const [isBuying, setIsBuying] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  if (!token) return null;

  const numAmount = parseFloat(amount) || 0;
  const estimatedOutput = isBuying 
    ? numAmount / token.price 
    : numAmount * token.price;
  
  const priceImpact = numAmount > 0 ? Math.min(numAmount * 0.001, 5) : 0;
  const fee = numAmount * 0.014; // 1% creator + 0.4% platform

  const handleSwap = async () => {
    if (!walletConnected) {
      onConnectWallet();
      return;
    }
    setIsLoading(true);
    // Simulate transaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm font-bold">
              {token.symbol.charAt(0)}
            </div>
            {isBuying ? "Buy" : "Sell"} {token.symbol}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Input Token */}
          <div className="bg-muted rounded-xl p-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>You {isBuying ? "pay" : "sell"}</span>
              <span>Balance: 0.00</span>
            </div>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="border-none bg-transparent text-2xl font-bold p-0 h-auto focus-visible:ring-0"
              />
              <div className="bg-card rounded-lg px-3 py-2 font-semibold text-sm flex items-center gap-2">
                {isBuying ? "wCELO" : token.symbol}
              </div>
            </div>
          </div>

          {/* Swap Direction */}
          <div className="flex justify-center">
            <button
              onClick={() => setIsBuying(!isBuying)}
              className="bg-card border border-border rounded-full p-2 hover:bg-muted transition-colors"
            >
              <ArrowDownUp className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {/* Output Token */}
          <div className="bg-muted rounded-xl p-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>You receive</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold flex-1">
                {estimatedOutput > 0 ? estimatedOutput.toFixed(4) : "0.00"}
              </span>
              <div className="bg-card rounded-lg px-3 py-2 font-semibold text-sm flex items-center gap-2">
                {isBuying ? token.symbol : "wCELO"}
              </div>
            </div>
          </div>

          {/* Trade Info */}
          {numAmount > 0 && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price</span>
                <span className="font-medium">1 {token.symbol} = {token.price.toFixed(4)} wCELO</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fee (1.4%)</span>
                <span className="font-medium">{fee.toFixed(4)} wCELO</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  Price Impact
                  {priceImpact > 1 && <AlertTriangle className="h-3 w-3 text-kaboom-orange" />}
                </span>
                <span className={priceImpact > 1 ? "text-kaboom-orange font-medium" : "font-medium"}>
                  ~{priceImpact.toFixed(2)}%
                </span>
              </div>
            </div>
          )}

          {/* Action Button */}
          <Button
            variant="kaboom"
            size="lg"
            className="w-full"
            onClick={handleSwap}
            disabled={isLoading || numAmount <= 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Confirming...
              </>
            ) : !walletConnected ? (
              "Connect Wallet"
            ) : (
              `${isBuying ? "Buy" : "Sell"} ${token.symbol}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TradeModal;
