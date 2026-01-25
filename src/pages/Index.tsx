import { useState } from "react";
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

// Mock data with more details
const mockTrendingTokens: Token[] = [
  { id: "1", name: "BOOM", symbol: "BOOM", price: 8.39, priceChange: 2.1, pair: "wCELO", volume: "0.291k", creator: "0x1234567890abcdef1234567890abcdef12345678", contractAddress: "0x80B8...4b07", marketCap: 36100 },
  { id: "2", name: "CLANK", symbol: "CLANK", price: 6.9, priceChange: -0.3, pair: "wCELO", volume: "7.623k", creator: "0x2345678901abcdef2345678901abcdef23456789", contractAddress: "0x91C9...5c18", marketCap: 547600 },
  { id: "3", name: "THRYVE", symbol: "THRYVE", price: 0.8, priceChange: 5.2, pair: "wCELO", volume: "7.44k", creator: "0x3456789012abcdef3456789012abcdef34567890", contractAddress: "0xA2DA...6d29", marketCap: 125000 },
];

const mockRecentTokens: Token[] = [
  { id: "4", name: "SCRT", symbol: "SCRT", price: 42.3, priceChange: 4.07, pair: "wCELO", volume: "38.39k", poolPercent: 100, vaultPercent: 0, creator: "0x1234567890abcdef1234567890abcdef12345678", contractAddress: "0xB3EB...7e3a", marketCap: 25000000 },
  { id: "5", name: "BUZZ", symbol: "BUZZ", price: 82.8, priceChange: -0.8, pair: "wCELO", volume: "74.401k", poolPercent: 70, vaultPercent: 30, creator: "0x4567890123abcdef4567890123abcdef45678901", contractAddress: "0xC4FC...8f4b", marketCap: 22500000 },
  { id: "6", name: "RPL", symbol: "RPL", price: 12.5, priceChange: 1.2, pair: "wCELO", volume: "15.2k", poolPercent: 85, vaultPercent: 15, creator: "0x5678901234abcdef5678901234abcdef56789012", contractAddress: "0xD5GD...9g5c", marketCap: 15300000 },
  { id: "7", name: "NOVA", symbol: "NOVA", price: 5.8, priceChange: -1.8, pair: "wCELO", volume: "12.4k", poolPercent: 90, vaultPercent: 10, creator: "0x6789012345abcdef6789012345abcdef67890123", contractAddress: "0xE6HE...0h6d", marketCap: 4200000 },
  { id: "8", name: "PULSE", symbol: "PULSE", price: 3.2, priceChange: 0.7, pair: "wCELO", volume: "41.9k", poolPercent: 75, vaultPercent: 25, creator: "0x7890123456abcdef7890123456abcdef78901234", contractAddress: "0xF7IF...1i7e", marketCap: 5200000 },
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
          tokens={mockTrendingTokens}
          onBuy={handleBuy}
          onTokenClick={handleTokenClick}
        />

        {/* Token Table with Tabs */}
        <TokenTableSection
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
