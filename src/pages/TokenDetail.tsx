import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, Copy, Check, Users, Coins } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import TradeModal from "@/components/TradeModal";
import PriceChart from "@/components/PriceChart";
import { Token } from "@/components/TokenCard";
import { useWallet } from "@/hooks/useWallet";
import { useKaboomTokens } from "@/hooks/useKaboomTokens";
import kaboomLogo from "@/assets/kaboom-logo.png";

const TokenDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isConnected, address } = useWallet();
  const { tokens, isLoading } = useKaboomTokens();
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Match by id (short prefix) or full address
  const real = tokens.find(
    (t) => t.id === id || t.address?.toLowerCase() === id?.toLowerCase()
  );

  if (isLoading && !real) {
    return (
      <div className="min-h-screen bg-background">
        <Header onCreateToken={() => navigate("/")} />
        <div className="container px-4 py-10 text-center text-muted-foreground">
          Loading token…
        </div>
      </div>
    );
  }

  if (!real) {
    return (
      <div className="min-h-screen bg-background">
        <Header onCreateToken={() => navigate("/")} />
        <div className="container px-4 py-10 text-center text-muted-foreground">
          Token not found on-chain.
        </div>
      </div>
    );
  }

  const totalSupplyNum = 50_000_000_000;
  const lockedNum = totalSupplyNum * 0.7;
  const token = {
    id: real.id,
    name: real.name,
    symbol: real.symbol,
    logo: null as string | null,
    price: real.price,
    priceChange: real.priceChange,
    pair: "wCELO",
    contractAddress: real.address,
    totalSupply: totalSupplyNum.toLocaleString(),
    marketCap: Number(real.virtualMarketCap) || real.marketCap,
    poolPercent: 70,
    vaultPercent: 30,
    vaultLocked: (totalSupplyNum * 0.3).toLocaleString(),
    amountLocked: lockedNum,
    holders: 0,
    creator: real.creator,
    lpLocked: true,
    liquidityType: "AMM" as const,
  };
  const isCreator = address?.toLowerCase() === token.creator.toLowerCase();

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

  const formatNumber = (num: number) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(2)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
    return num.toString();
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="min-h-screen bg-background">
      <Header onCreateToken={() => navigate("/")} />

      <main className="container px-4 py-6">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        {/* Token Header with Logo */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-3xl font-bold overflow-hidden">
              {token.logo ? (
                <img src={token.logo} alt={token.name} className="h-full w-full object-cover" />
              ) : (
                token.symbol.charAt(0)
              )}
            </div>
            {/* Kaboom overlay */}
            <img 
              src={kaboomLogo} 
              alt="" 
              className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full border-2 border-background" 
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{token.name}</h1>
            <p className="text-muted-foreground">{token.symbol}</p>
          </div>
        </div>

        {/* Live Price Chart */}
        <PriceChart tokenSymbol={token.symbol} className="mb-6" />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-card rounded-xl p-4 shadow-card">
            <p className="text-sm text-muted-foreground mb-1">Market Cap</p>
            <p className="text-xl font-bold">${formatNumber(token.marketCap)}</p>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card">
            <p className="text-sm text-muted-foreground mb-1">Total Supply</p>
            <p className="text-xl font-bold">{token.totalSupply}</p>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card">
            <p className="text-sm text-muted-foreground mb-1">Amount Locked</p>
            <p className="text-xl font-bold">{formatNumber(token.amountLocked)}</p>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card">
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
              <Users className="h-3 w-3" />
              <span>Holders</span>
            </div>
            <p className="text-xl font-bold">{formatNumber(token.holders)}</p>
          </div>
        </div>

        {/* Creator Wallet */}
        <div className="bg-card rounded-xl p-4 shadow-card mb-6">
          <p className="text-sm text-muted-foreground mb-2">Creator Wallet</p>
          <button
            onClick={() => window.open(`https://celoscan.io/address/${token.creator}`, '_blank')}
            className="flex items-center gap-2 hover:text-primary transition-colors"
          >
            <span className="font-mono text-sm">{formatAddress(token.creator)}</span>
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>

        {/* Contract Address */}
        <div className="bg-card rounded-xl p-4 shadow-card mb-6">
          <p className="text-sm text-muted-foreground mb-2">Contract Address</p>
          <button
            onClick={handleCopyAddress}
            className="flex items-center gap-2 w-full"
          >
            <span className="font-mono text-sm flex-1 text-left truncate">{token.contractAddress}</span>
            {copied ? (
              <Check className="h-4 w-4 text-success flex-shrink-0" />
            ) : (
              <Copy className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
          </button>
        </div>

        {/* Pool/Vault Info (compact) */}
        <div className="bg-card rounded-xl p-4 shadow-card mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Pool</span>
            </div>
            <span className="font-medium">{token.poolPercent}%</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-muted-foreground">Vault</span>
            <span className="font-medium">{token.vaultPercent}%</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-muted-foreground">LP Locked</span>
            <span className={cn(
              "font-medium",
              token.lpLocked ? "text-success" : "text-destructive"
            )}>
              {token.lpLocked ? "Yes" : "No"}
            </span>
          </div>
        </div>

        {/* Buy Button - Sticky */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border">
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
        walletConnected={isConnected}
        onConnectWallet={() => {}}
      />
    </div>
  );
};

export default TokenDetail;
