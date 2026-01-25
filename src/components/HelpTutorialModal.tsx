import { useState } from "react";
import { Wallet, Rocket, TrendingUp, ArrowRight, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import kaboomLogo from "@/assets/kaboom-logo.png";

interface HelpTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  {
    id: 1,
    title: "Connect Your Wallet",
    description: "Connect with MetaMask, Valora, or sign in with Farcaster Warplet. Make sure you're on the Celo network.",
    icon: Wallet,
  },
  {
    id: 2,
    title: "Create Your Token",
    description: "Click 'Create Token' to launch your own token on Celo. Set your token name, symbol, vault percentage, and fees.",
    icon: Rocket,
  },
  {
    id: 3,
    title: "Trade & Earn",
    description: "Buy and sell tokens instantly. Track trending tokens, view live charts, and claim your vault rewards.",
    icon: TrendingUp,
  },
];

const HelpTutorialModal = ({ isOpen, onClose }: HelpTutorialModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
      setCurrentStep(0);
    }
  };

  const handleClose = () => {
    onClose();
    setCurrentStep(0);
  };

  const CurrentIcon = steps[currentStep]?.icon || Wallet;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <img src={kaboomLogo} alt="Kaboom" className="h-6 w-6" />
            How to use Kaboom
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(index)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  index === currentStep
                    ? "w-8 bg-primary"
                    : index < currentStep
                    ? "w-2 bg-success"
                    : "w-2 bg-muted"
                )}
              />
            ))}
          </div>

          {/* Step Content */}
          <div className="text-center space-y-4 animate-fade-in-scale">
            <div className="h-20 w-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <CurrentIcon className="h-10 w-10 text-primary" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Step {currentStep + 1} of {steps.length}
                </span>
              </div>
              <h3 className="text-xl font-bold">
                {steps[currentStep]?.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed px-4">
                {steps[currentStep]?.description}
              </p>
            </div>
          </div>

          {/* All Steps Overview */}
          <div className="mt-6 space-y-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl transition-colors",
                  index === currentStep
                    ? "bg-primary/10 border border-primary/20"
                    : index < currentStep
                    ? "bg-success/10"
                    : "bg-muted/50"
                )}
              >
                <div
                  className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold",
                    index === currentStep
                      ? "bg-primary text-primary-foreground"
                      : index < currentStep
                      ? "bg-success text-success-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {index < currentStep ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    "font-medium text-sm",
                    index === currentStep
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={handleClose}>
            Skip
          </Button>
          <Button variant="kaboom" className="flex-1 gap-2" onClick={handleNext}>
            {currentStep === steps.length - 1 ? (
              <>
                Get Started
                <Rocket className="h-4 w-4" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HelpTutorialModal;
