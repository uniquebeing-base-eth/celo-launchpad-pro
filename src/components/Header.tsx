import { useState } from "react";
import { Search, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import kaboomLogo from "@/assets/kaboom-logo.png";
import WalletModal from "./WalletModal";

interface HeaderProps {
  walletAddress?: string;
  onConnect: () => void;
  onCreateToken: () => void;
}

const Header = ({ walletAddress, onConnect, onCreateToken }: HeaderProps) => {
  const [showSearch, setShowSearch] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur-md border-b border-border">
        <div className="container flex h-16 items-center justify-between gap-2 px-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src={kaboomLogo} alt="Kaboom" className="h-10 w-10" />
            <span className="text-xl font-bold text-gradient-kaboom hidden sm:inline">
              Kaboom
            </span>
          </div>

          {/* Search - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tokens..."
                className="pl-10 bg-muted border-none"
              />
            </div>
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
              <Search className="h-5 w-5" />
            </Button>

            {/* Wallet Button */}
            {walletAddress ? (
              <Button
                variant="outline"
                size="sm"
                className="font-mono text-sm"
                onClick={() => setShowWalletModal(true)}
              >
                <Wallet className="h-4 w-4 mr-2" />
                {formatAddress(walletAddress)}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowWalletModal(true)}
              >
                <Wallet className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Connect Wallet</span>
                <span className="sm:hidden">Connect</span>
              </Button>
            )}

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
          <div className="md:hidden px-4 pb-3 animate-fade-in-scale">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tokens..."
                className="pl-10 bg-muted border-none"
                autoFocus
              />
            </div>
          </div>
        )}
      </header>

      <WalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onConnect={(wallet) => {
          onConnect();
          setShowWalletModal(false);
        }}
        connectedAddress={walletAddress}
      />
    </>
  );
};

export default Header;
