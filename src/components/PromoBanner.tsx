import { Rocket, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PromoBannerProps {
  onLaunch: () => void;
  onLearnMore?: () => void;
}

const PromoBanner = ({ onLaunch, onLearnMore }: PromoBannerProps) => {
  return (
    <section className="py-6">
      <div className="container px-4">
        <div className="bg-gradient-to-br from-muted to-muted/50 rounded-2xl p-6 space-y-4">
          <h2 className="text-2xl font-bold text-foreground">
            Boom with us
          </h2>
          
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="gap-2 bg-background hover:bg-background/80"
              onClick={onLaunch}
            >
              <Rocket className="h-4 w-4" />
              Launch now
            </Button>
            
            {onLearnMore && (
              <Button
                variant="ghost"
                className="gap-2"
                onClick={onLearnMore}
              >
                Learn more
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
