import { ChevronRight } from "lucide-react";
import TokenCard, { Token } from "./TokenCard";

interface TrendingBoomersProps {
  tokens: Token[];
  onBuy: (token: Token) => void;
  onTokenClick: (token: Token) => void;
  onViewAll?: () => void;
}

const TrendingBoomers = ({ tokens, onBuy, onTokenClick, onViewAll }: TrendingBoomersProps) => {
  return (
    <section className="py-6">
      <div className="container px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Trending Boomers</h2>
          {onViewAll && (
            <button 
              onClick={onViewAll}
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              Stargazers <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex gap-4 overflow-x-auto scroll-hide pb-2 -mx-4 px-4">
          {tokens.map((token) => (
            <TokenCard
              key={token.id}
              token={token}
              variant="compact"
              onBuy={onBuy}
              onClick={onTokenClick}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingBoomers;
