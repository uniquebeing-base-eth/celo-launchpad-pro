import { TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface Token {
  id: string;
  name: string;
  symbol: string;
  logo?: string;
  price: number;
  priceChange: number;
  poolPercent?: number;
  vaultPercent?: number;
  volume?: string;
  pair: string;
  creator?: string;
  contractAddress?: string;
  marketCap?: number;
  totalSupply?: string;
  holders?: number;
}

interface TokenCardProps {
  token: Token;
  variant?: "compact" | "detailed";
  onBuy: (token: Token) => void;
  onClick?: (token: Token) => void;
}

const TokenCard = ({ token, variant = "detailed", onBuy, onClick }: TokenCardProps) => {
  const isPositive = token.priceChange >= 0;

  if (variant === "compact") {
    return (
      <div
        className="flex-shrink-0 w-72 bg-card rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-all cursor-pointer"
        onClick={() => onClick?.(token)}
      >
        <div className="flex items-center gap-3">
          {/* Token Logo */}
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xl font-bold overflow-hidden">
            {token.logo ? (
              <img src={token.logo} alt={token.name} className="h-full w-full object-cover" />
            ) : (
              token.symbol.charAt(0)
            )}
          </div>

          {/* Token Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-foreground truncate">{token.name}</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {token.pair}
            </p>
          </div>

          {/* Price & Change */}
          <div className="text-right">
            <p className="font-bold text-foreground">{token.price.toFixed(2)}</p>
            <div className={cn(
              "flex items-center justify-end gap-1 text-sm font-medium",
              isPositive ? "text-success" : "text-destructive"
            )}>
              {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {isPositive ? "+" : ""}{token.priceChange.toFixed(1)}%
            </div>
          </div>

          {/* Buy Button */}
          <Button
            variant="kaboom"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onBuy(token);
            }}
          >
            Buy
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-card rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-all cursor-pointer"
      onClick={() => onClick?.(token)}
    >
      <div className="flex items-center gap-3">
        {/* Token Logo */}
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xl font-bold overflow-hidden flex-shrink-0">
          {token.logo ? (
            <img src={token.logo} alt={token.name} className="h-full w-full object-cover" />
          ) : (
            token.symbol.charAt(0)
          )}
        </div>

        {/* Token Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-foreground">{token.symbol}</h3>
            <span className={cn(
              "flex items-center gap-1 text-sm font-semibold",
              isPositive ? "text-success" : "text-destructive"
            )}>
              {isPositive ? "+" : ""}{token.priceChange.toFixed(1)}%
            </span>
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {token.pair} • {token.volume}
          </p>
        </div>

        {/* Stats */}
        {(token.poolPercent !== undefined || token.vaultPercent !== undefined) && (
          <div className="text-right text-xs text-muted-foreground hidden sm:block">
            {token.poolPercent !== undefined && <p>Pool: {token.poolPercent}%</p>}
            {token.vaultPercent !== undefined && <p>Vault: {token.vaultPercent}%</p>}
          </div>
        )}

        {/* Price */}
        <div className="text-right flex-shrink-0">
          <p className="font-bold text-foreground">{token.price.toFixed(2)}</p>
        </div>

        {/* Buy Button */}
        <Button
          variant="kaboom"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onBuy(token);
          }}
          className="flex-shrink-0"
        >
          Buy
        </Button>
      </div>
    </div>
  );
};

export default TokenCard;
