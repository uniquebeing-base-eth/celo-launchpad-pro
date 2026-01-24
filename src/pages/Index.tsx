import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import TrendingBoomers from "@/components/TrendingBoomers";
import RecentLaunches from "@/components/RecentLaunches";
import TradeModal from "@/components/TradeModal";
import CreateTokenModal from "@/components/CreateTokenModal";
import { Token } from "@/components/TokenCard";

// Mock data
const mockTrendingTokens: Token[] = [
  { id: "1", name: "BOOM", symbol: "BOOM", price: 8.39, priceChange: 2.1, pair: "wCELO / wCELO", volume: "0.291k 2.1%" },
  { id: "2", name: "CLANK", symbol: "CLANK", price: 6.9, priceChange: -0.3, pair: "wCELO / wCELO", volume: "7.623k" },
  { id: "3", name: "THRYVE", symbol: "THRYVE", price: 0.8, priceChange: 5.2, pair: "wCELO / wCELO", volume: "7.44k" },
];

const mockRecentTokens: Token[] = [
  { id: "4", name: "SCRT", symbol: "SCRT", price: 42.3, priceChange: 4.07, pair: "wCELO P.CS%", volume: "38.39k", poolPercent: 100, vaultPercent: 0 },
  { id: "5", name: "BUZZ", symbol: "BUZZ", price: 82.8, priceChange: -0.8, pair: "P.lafi5.88c", volume: "74.401k", poolPercent: 70, vaultPercent: 30 },
  { id: "6", name: "RPL", symbol: "RPL", price: 12.5, priceChange: 1.2, pair: "wCELO / wCELO", volume: "15.2k", poolPercent: 85, vaultPercent: 15 },
];

const Index = () => {
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState<string | undefined>();
  const [tradeToken, setTradeToken] = useState<Token | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showWalletPrompt, setShowWalletPrompt] = useState(false);

  const handleConnect = () => {
    // Simulate wallet connection
    setWalletAddress("0x12c...6d36");
  };

  const handleBuy = (token: Token) => {
    setTradeToken(token);
  };

  const handleTokenClick = (token: Token) => {
    navigate(`/token/${token.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        walletAddress={walletAddress}
        onConnect={handleConnect}
        onCreateToken={() => setShowCreateModal(true)}
      />

      <main>
        {/* Hero Banner - only show if not connected */}
        {!walletAddress && (
          <HeroBanner
            onConnectWallet={handleConnect}
            walletConnected={!!walletAddress}
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
        walletConnected={!!walletAddress}
        onConnectWallet={handleConnect}
      />

      {/* Create Token Modal */}
      <CreateTokenModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        walletConnected={!!walletAddress}
        onConnectWallet={handleConnect}
      />
    </div>
  );
};

export default Index;
