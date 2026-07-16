import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import PromoBanner from "@/components/PromoBanner";
import TopVolumeSection from "@/components/TopVolumeSection";
import TokenTableSection from "@/components/TokenTableSection";
import TrendingBoomers from "@/components/TrendingBoomers";
import RecentLaunches from "@/components/RecentLaunches";
import TradeModal from "@/components/TradeModal";
import CreateTokenModal from "@/components/CreateTokenModal";
import { Token } from "@/components/TokenCard";
import { useWallet } from "@/hooks/useWallet";
import { useKaboomTokens } from "@/hooks/useKaboomTokens";

// Fallback mock data for when no tokens are deployed
const fallbackMockTokens: Token[] = [
  { id: "1", name: "No Tokens Yet", symbol: "---", price: 0, priceChange: 0, pair: "USDC", volume: "0k", creator: "0x0000000000000000000000000000000000000000", contractAddress: "---", marketCap: 0 },
];

const Index = () => {
  const navigate = useNavigate();
  const { isConnected } = useWallet();
  const { tokens, isLoading: tokensLoading } = useKaboomTokens();
  const [tradeToken, setTradeToken] = useState<Token | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleBuy = (token: Token) => {
    setTradeToken(token);
  };

  const handleTokenClick = (token: Token) => {
    navigate(`/token/${token.id}`);
  };

  const handleLearnMore = () => {
    // Could open help modal or navigate to docs
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onCreateToken={() => setShowCreateModal(true)} />

      <main>
        {/* Promo Banner - Boom with us */}
        <PromoBanner 
          onLaunch={() => setShowCreateModal(true)} 
          onLearnMore={handleLearnMore}
        />

        {/* Top 24 Hour Volume - Carousel */}
        <TopVolumeSection
          tokens={tokens && tokens.length > 0 ? tokens as any : fallbackMockTokens}
          onBuy={handleBuy}
          onTokenClick={handleTokenClick}
        />

        {/* Token Table with Tabs */}
        <TokenTableSection
          tokens={tokens && tokens.length > 0 ? tokens as any : fallbackMockTokens}
          onBuy={handleBuy}
          onTokenClick={handleTokenClick}
        />

        {/* Bottom padding for mobile */}
        <div className="h-20" />
      </main>

      {/* Trade Modal */}
      <TradeModal
        isOpen={!!tradeToken}
        onClose={() => setTradeToken(null)}
        token={tradeToken}
        walletConnected={isConnected}
        onConnectWallet={() => {}}
      />

      {/* Create Token Modal */}
      <CreateTokenModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        walletConnected={isConnected}
        onConnectWallet={() => {}}
      />
    </div>
  );
};

export default Index;
