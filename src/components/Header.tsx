import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import kaboomLogo from "@/assets/kaboom-logo.png";
import { cn } from "@/lib/utils";
import { Token } from "./TokenCard";
import { ConnectButton } from "@rainbow-me/rainbowkit";

// Mock tokens for search - in production, this would come from an API/blockchain
const allTokens: Token[] = [
  { id: "1", name: "BOOM", symbol: "BOOM", price: 8.39, priceChange: 2.1, pair: "wCELO", creator: "0x1234...5678" },
  { id: "2", name: "CLANK", symbol: "CLANK", price: 6.9, priceChange: -0.3, pair: "wCELO", creator: "0x2345...6789" },
  { id: "3", name: "THRYVE", symbol: "THRYVE", price: 0.8, priceChange: 5.2, pair: "wCELO", creator: "0x3456...7890" },
  { id: "4", name: "SCRT", symbol: "SCRT", price: 42.3, priceChange: 4.07, pair: "wCELO", creator: "0x1234...5678" },
  { id: "5", name: "BUZZ", symbol: "BUZZ", price: 82.8, priceChange: -0.8, pair: "wCELO", creator: "0x4567...8901" },
  { id: "6", name: "RPL", symbol: "RPL", price: 12.5, priceChange: 1.2, pair: "wCELO", creator: "0x5678...9012" },
];

interface HeaderProps {
  onCreateToken: () => void;
}

const Header = ({ onCreateToken }: HeaderProps) => {
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  // Search filtering - by token name, symbol, or creator wallet
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    const isWalletSearch = query.startsWith("0x") && query.length > 10;
    
    return allTokens.filter((token) => {
      if (isWalletSearch) {
        return token.creator?.toLowerCase().includes(query);
      }
      return (
        token.name.toLowerCase().includes(query) ||
        token.symbol.toLowerCase().includes(query)
      );
    });
  }, [searchQuery]);

  const handleSearchFocus = () => setShowResults(true);
  const handleSearchBlur = () => {
    // Delay to allow clicking on results
    setTimeout(() => setShowResults(false), 200);
  };

  const handleTokenSelect = (token: Token) => {
    navigate(`/token/${token.id}`);
    setSearchQuery("");
    setShowResults(false);
    setShowSearch(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur-md border-b border-border">
        <div className="container flex h-16 items-center justify-between gap-2 px-4">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => navigate("/")}
          >
            <img src={kaboomLogo} alt="Kaboom" className="h-10 w-10" />
            <span className="text-xl font-bold text-gradient-kaboom hidden sm:inline">
              Kaboom
            </span>
          </div>

          {/* Search - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tokens or wallet address..."
                className="pl-10 bg-muted border-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
              />
            </div>
            
            {/* Search Results Dropdown */}
            {showResults && searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card rounded-xl shadow-lg border border-border overflow-hidden z-50">
                {searchResults.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto">
                    {searchResults.map((token) => (
                      <button
                        key={token.id}
                        onClick={() => handleTokenSelect(token)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors text-left"
                      >
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm font-bold">
                          {token.symbol.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{token.name}</p>
                          <p className="text-xs text-muted-foreground">{token.symbol}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${token.price.toFixed(2)}</p>
                          <p className={cn(
                            "text-xs",
                            token.priceChange >= 0 ? "text-success" : "text-destructive"
                          )}>
                            {token.priceChange > 0 ? "+" : ""}{token.priceChange}%
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    No tokens found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Search Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setShowSearch(!showSearch)}
            >
              {showSearch ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </Button>

            {/* Wallet Button - RainbowKit */}
            <ConnectButton 
              chainStatus="icon"
              showBalance={false}
              accountStatus={{
                smallScreen: 'avatar',
                largeScreen: 'full',
              }}
            />

            {/* Create Token Button */}
            <Button
              variant="kaboom"
              size="sm"
              onClick={onCreateToken}
              className="font-semibold"
            >
              <span className="hidden sm:inline">Create Token</span>
              <span className="sm:hidden">Create</span>
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {showSearch && (
          <div className="md:hidden px-4 pb-3 animate-fade-in-scale relative">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tokens or wallet..."
                className="pl-10 bg-muted border-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                autoFocus
              />
            </div>
            
            {/* Mobile Search Results */}
            {showResults && searchQuery && (
              <div className="absolute left-4 right-4 top-full mt-1 bg-card rounded-xl shadow-lg border border-border overflow-hidden z-50">
                {searchResults.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto">
                    {searchResults.map((token) => (
                      <button
                        key={token.id}
                        onClick={() => handleTokenSelect(token)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors text-left"
                      >
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm font-bold">
                          {token.symbol.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{token.name}</p>
                          <p className="text-xs text-muted-foreground">{token.symbol}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${token.price.toFixed(2)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    No tokens found
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </header>

    </>
  );
};

export default Header;
