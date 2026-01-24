import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, ExternalLink, Copy, Check, TrendingUp } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import TradeModal from "@/components/TradeModal";
import { Token } from "@/components/TokenCard";

// Mock token data
const mockTokenDetail = {
  id: "1",
  name: "BOOM Coin",
  symbol: "BOCM",
  logo: null,
  price: 3.3,
  priceChange: 6.5,
  pair: "TOKEN/wCELO",
  contractAddress: "0x12c...6d36",
  totalSupply: "1,000,000,000",
  poolPercent: 72.3,
  vaultPercent: 27.7,
  vaultLocked: "277,000,000",
  vaultDuration: "6 months",
  vestingDaily: true,
  lpLocked: true,
  liquidityType: "AMM" as const,
  feesCollected: 1.25,
  platformFee: 0.15,
  isCreator: true,
};

const TokenDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState<string>("0x12c...6d36");
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const token = mockTokenDetail; // In real app, fetch by id

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(token.contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tradeToken: Token = {
    id: token.id,
    name: token.name,
    symbol: token.symbol,
    price: token.price,
    priceChange: token.priceChange,
    pair: token.pair,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        walletAddress={walletAddress}
        onConnect={() => setWalletAddress("0x12c...6d36")}
        onCreateToken={() => navigate("/")}
      />

      <main className="container px-4 py-6">
        {/* Back Button & Title */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{token.name}</h1>
            <p className="text-sm text-muted-foreground">{token.symbol}</p>
          </div>
        </div>

        {/* Token Card */}
        <div className="bg-card rounded-2xl p-5 shadow-card mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl font-bold">
              {token.symbol.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{token.name}</h2>
              <p className="text-muted-foreground">{token.symbol}</p>
            </div>
          </div>

          {/* Contract Address */}
          <button
            onClick={handleCopyAddress}
            className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 text-sm w-full mb-4"
          >
            <span className="font-mono flex-1 text-left">{token.contractAddress}</span>
            {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
          </button>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Vault %</p>
              <p className="text-lg font-bold flex items-center gap-1">
                <span className="text-muted-foreground text-sm">4LDS -6%</span>
                <span>{token.vaultPercent}%</span>
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Price</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">${token.price.toFixed(2)}</span>
                <span className={cn(
                  "text-sm font-medium flex items-center gap-0.5",
                  token.priceChange >= 0 ? "text-success" : "text-destructive"
                )}>
                  <TrendingUp className="h-3 w-3" />
                  {token.priceChange > 0 ? "+" : ""}{token.priceChange}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pool Info */}
        <div className="bg-card rounded-2xl p-5 shadow-card mb-6">
          <h3 className="font-bold mb-4">Liquidity</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Type</span>
              <span className="font-medium">{token.liquidityType}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Pool %</span>
              <span className="font-medium">{token.poolPercent}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">LP Locked</span>
              <span className="flex items-center gap-1">
                <span className={cn(
                  "h-2 w-2 rounded-full",
                  token.lpLocked ? "bg-success" : "bg-destructive"
                )} />
                <span className="font-medium">{token.lpLocked ? "Yes" : "No"}</span>
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Pair</span>
              <span className="font-medium">POOZ /wCELO /</span>
            </div>
          </div>
        </div>

        {/* Vault Info */}
        <div className="bg-card rounded-2xl p-5 shadow-card mb-6">
          <h3 className="font-bold mb-4">Vault</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Locked</span>
              <span className="font-medium">{token.vaultPercent}% ({token.vaultLocked})</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-medium">{token.vaultDuration}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Vesting</span>
              <span className="font-medium">Daily unlock</span>
            </div>
            
            {/* Unlock Chart */}
            <div className="pt-4">
              <div className="flex gap-1 h-20">
                {Array.from({ length: 12 }, (_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-kaboom-orange/60 rounded-t"
                    style={{ height: `${30 + (i * 6)}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Now</span>
                <span>6mo</span>
              </div>
            </div>

            {token.isCreator && (
              <Button variant="kaboom" className="w-full mt-4">
                Claim Available
              </Button>
            )}
          </div>
        </div>

        {/* Fees */}
        <div className="bg-card rounded-2xl p-5 shadow-card mb-6">
          <h3 className="font-bold mb-4">Fees</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-kaboom-gold flex items-center justify-center text-xs">
                  C
                </div>
                <span>wCELO</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold">{token.feesCollected.toFixed(3)}</span>
                {token.isCreator && (
                  <Button variant="kaboom" size="sm">Claim</Button>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Platform Fees</span>
              <span>{token.platformFee.toFixed(3)} wCELO</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {token.isCreator && (
          <div className="bg-card rounded-2xl p-5 shadow-card mb-6">
            <h3 className="font-bold mb-4">Actions</h3>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1">
                <TrendingUp className="h-4 w-4 mr-2" />
                Dev Buys
              </Button>
              <Button variant="outline" className="flex-1">
                ✨ Airdrops
              </Button>
            </div>
          </div>
        )}

        {/* Buy Button - Sticky */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
          <div className="container">
            <Button
              variant="kaboom"
              size="lg"
              className="w-full"
              onClick={() => setShowTradeModal(true)}
            >
              Buy {token.symbol}
            </Button>
          </div>
        </div>

        {/* Extra padding for sticky button */}
        <div className="h-24" />
      </main>

      <TradeModal
        isOpen={showTradeModal}
        onClose={() => setShowTradeModal(false)}
        token={tradeToken}
        walletConnected={!!walletAddress}
        onConnectWallet={() => setWalletAddress("0x12c...6d36")}
      />
    </div>
  );
};

export default TokenDetail;
