import kaboomLogo from "@/assets/kaboom-logo.png";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface HeroBannerProps {
  onConnectWallet: () => void;
  walletConnected: boolean;
}

const HeroBanner = ({ onConnectWallet, walletConnected }: HeroBannerProps) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-secondary to-primary/80 text-secondary-foreground">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-kaboom-orange rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="container relative px-4 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
          {/* Logo Animation */}
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-kaboom-orange/30 rounded-full blur-xl animate-pulse" />
            <img 
              src={kaboomLogo} 
              alt="Kaboom" 
              className="h-32 w-32 sm:h-40 sm:w-40 relative z-10 animate-bounce-subtle" 
            />
          </div>

          {/* Content */}
          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              <span className="text-kaboom-orange">Kaboom</span>
            </h1>
            <p className="text-lg sm:text-xl text-secondary-foreground/80 mb-4">
              Launch tokens on Celo. No code. No trust.
            </p>
            
            {!walletConnected && (
              <Button
                variant="kaboom"
                size="lg"
                onClick={onConnectWallet}
                className="gap-2"
              >
                <Sparkles className="h-5 w-5" />
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
