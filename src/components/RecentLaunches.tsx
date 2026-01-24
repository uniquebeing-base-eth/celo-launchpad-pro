import { ChevronRight } from "lucide-react";
import TokenCard, { Token } from "./TokenCard";

interface RecentLaunchesProps {
  tokens: Token[];
  onBuy: (token: Token) => void;
  onTokenClick: (token: Token) => void;
  onViewAll?: () => void;
}

const RecentLaunches = ({ tokens, onBuy, onTokenClick, onViewAll }: RecentLaunchesProps) => {
  return (
    <section className="py-6">
      <div className="container px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Recent Launches</h2>
          {onViewAll && (
            <button 
              onClick={onViewAll}
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              Flashspots <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="space-y-3">
          {tokens.map((token) => (
            <TokenCard
              key={token.id}
              token={token}
              variant="detailed"
              onBuy={onBuy}
              onClick={onTokenClick}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentLaunches;
