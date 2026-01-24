import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import TrendingBoomers from "@/components/TrendingBoomers";
import RecentLaunches from "@/components/RecentLaunches";
import TradeModal from "@/components/TradeModal";
import CreateTokenModal from "@/components/CreateTokenModal";
import { Token } from "@/components/TokenCard";
import { useWallet } from "@/hooks/useWallet";

// Mock data
const mockTrendingTokens: Token[] = [
  { id: "1", name: "BOOM", symbol: "BOOM", price: 8.39, priceChange: 2.1, pair: "wCELO", volume: "0.291k 2.1%", creator: "0x1234567890abcdef1234567890abcdef12345678" },
  { id: "2", name: "CLANK", symbol: "CLANK", price: 6.9, priceChange: -0.3, pair: "wCELO", volume: "7.623k", creator: "0x2345678901abcdef2345678901abcdef23456789" },
  { id: "3", name: "THRYVE", symbol: "THRYVE", price: 0.8, priceChange: 5.2, pair: "wCELO", volume: "7.44k", creator: "0x3456789012abcdef3456789012abcdef34567890" },
];

const mockRecentTokens: Token[] = [
  { id: "4", name: "SCRT", symbol: "SCRT", price: 42.3, priceChange: 4.07, pair: "wCELO", volume: "38.39k", poolPercent: 100, vaultPercent: 0, creator: "0x1234567890abcdef1234567890abcdef12345678" },
  { id: "5", name: "BUZZ", symbol: "BUZZ", price: 82.8, priceChange: -0.8, pair: "wCELO", volume: "74.401k", poolPercent: 70, vaultPercent: 30, creator: "0x4567890123abcdef4567890123abcdef45678901" },
  { id: "6", name: "RPL", symbol: "RPL", price: 12.5, priceChange: 1.2, pair: "wCELO", volume: "15.2k", poolPercent: 85, vaultPercent: 15, creator: "0x5678901234abcdef5678901234abcdef56789012" },
];

const Index = () => {
  const navigate = useNavigate();
  const { isConnected } = useWallet();
  const [tradeToken, setTradeToken] = useState<Token | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleBuy = (token: Token) => {
    setTradeToken(token);
  };

  const handleTokenClick = (token: Token) => {
    navigate(`/token/${token.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onCreateToken={() => setShowCreateModal(true)} />

      <main>
        {/* Hero Banner - only show if not connected */}
        {!isConnected && (
          <HeroBanner
            onConnectWallet={() => {}}
            walletConnected={isConnected}
          />
        )}

        {/* Trending Boomers */}
        <TrendingBoomers
          tokens={mockTrendingTokens}
          onBuy={handleBuy}
          onTokenClick={handleTokenClick}
        />

        {/* Recent Launches */}
        <RecentLaunches
          tokens={mockRecentTokens}
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
