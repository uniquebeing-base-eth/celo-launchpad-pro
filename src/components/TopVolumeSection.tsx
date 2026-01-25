import { useState } from "react";
import { ChevronLeft, ChevronRight, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Token } from "./TokenCard";
import { toast } from "sonner";
import kaboomLogo from "@/assets/kaboom-logo.png";

interface TopVolumeSectionProps {
  tokens: Token[];
  onBuy: (token: Token) => void;
  onTokenClick: (token: Token) => void;
}

const TopVolumeSection = ({ tokens, onBuy, onTokenClick }: TopVolumeSectionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : tokens.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev < tokens.length - 1 ? prev + 1 : 0));
  };

  const copyAddress = (address: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    toast.success("Address copied!");
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <section className="py-6">
      <div className="container px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Top 24 Hour Volume</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={handlePrev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={handleNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Token Cards Carousel */}
        <div className="flex gap-4 overflow-x-auto scroll-hide pb-2 -mx-4 px-4">
          {tokens.map((token, index) => (
            <div
              key={token.id}
              className={cn(
                "flex-shrink-0 w-[280px] bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all cursor-pointer",
                index === currentIndex && "ring-2 ring-primary"
              )}
              onClick={() => onTokenClick(token)}
            >
              {/* Token Image */}
              <div className="relative h-48 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                {token.logo ? (
                  <img
                    src={token.logo}
                    alt={token.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-6xl font-bold text-muted-foreground/30">
                    {token.symbol.charAt(0)}
                  </div>
                )}
                
                {/* Kaboom badge */}
                <div className="absolute top-3 left-3">
                  <img src={kaboomLogo} alt="Kaboom" className="h-6 w-6" />
                </div>

                {/* Contract address */}
                {token.contractAddress && (
                  <div className="absolute bottom-3 left-3 right-3">
                    <button
                      onClick={(e) => copyAddress(token.contractAddress!, e)}
                      className="flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-background transition-colors"
                    >
                      <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-[8px] text-primary-foreground">C</span>
                      </div>
                      {truncateAddress(token.contractAddress)}
                      <Copy className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>
                )}
              </div>

              {/* Token Info */}
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg">{token.name}</h3>
                  <span className="text-sm text-muted-foreground">{token.symbol}</span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">MCAP</p>
                    <p className="text-sm font-semibold">
                      {token.marketCap ? `$${(token.marketCap / 1000).toFixed(1)}k` : "36.1k"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">24h</p>
                    <p className="text-sm font-semibold">{token.volume || "26.3k"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">24h Δ</p>
                    <p className={cn(
                      "text-sm font-semibold",
                      token.priceChange >= 0 ? "text-success" : "text-destructive"
                    )}>
                      {token.priceChange >= 0 ? "+" : ""}{token.priceChange.toFixed(2)}%
                    </p>
                  </div>
                </div>

                {/* Trade Button */}
                <Button
                  variant="outline"
                  className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    onBuy(token);
                  }}
                >
                  Trade
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopVolumeSection;
