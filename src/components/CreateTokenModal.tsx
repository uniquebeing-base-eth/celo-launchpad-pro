import { useState } from "react";
import { ArrowLeft, ArrowRight, Upload, AlertTriangle, Check, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface CreateTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletConnected: boolean;
  onConnectWallet: () => void;
}

type Step = 1 | 2 | 3;

interface TokenData {
  name: string;
  symbol: string;
  logo: string | null;
  description: string;
  vaultPercent: number;
  lockDuration: "7days" | "1month" | "6months" | "1year";
  creatorFee: number;
  liquidityType: "amm" | "bonding";
}

const lockDurations = [
  { id: "7days", label: "7 Days" },
  { id: "1month", label: "1 Month" },
  { id: "6months", label: "6 Months" },
  { id: "1year", label: "1 Year" },
];

const creatorFees = [1, 2, 3];

const CreateTokenModal = ({ isOpen, onClose, walletConnected, onConnectWallet }: CreateTokenModalProps) => {
  const [step, setStep] = useState<Step>(1);
  const [tokenData, setTokenData] = useState<TokenData>({
    name: "",
    symbol: "",
    logo: null,
    description: "",
    vaultPercent: 0,
    lockDuration: "1month",
    creatorFee: 1,
    liquidityType: "amm",
  });
  const [isLaunching, setIsLaunching] = useState(false);

  const updateField = <K extends keyof TokenData>(field: K, value: TokenData[K]) => {
    setTokenData(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    if (step === 1) {
      return tokenData.name.trim().length > 0 && tokenData.symbol.trim().length > 0;
    }
    return true;
  };

  const handleLaunch = async () => {
    if (!walletConnected) {
      onConnectWallet();
      return;
    }
    setIsLaunching(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsLaunching(false);
    onClose();
  };

  const renderStep1 = () => (
    <div className="space-y-5">
      <h3 className="text-lg font-bold">Step 1 of 3: Token Info</h3>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Token Name</label>
          <Input
            placeholder="Enter token name"
            value={tokenData.name}
            onChange={(e) => updateField("name", e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 flex items-center justify-between">
            Symbol
            <span className="text-muted-foreground font-normal">4 chars max</span>
          </label>
          <Input
            placeholder="Enter symbol"
            value={tokenData.symbol}
            onChange={(e) => updateField("symbol", e.target.value.toUpperCase().slice(0, 4))}
            maxLength={4}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Logo</label>
          <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-medium">Upload Token Logo</p>
            <p className="text-xs text-muted-foreground">Max 500kb, PNG</p>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">*No description provided (default)</p>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">
            Description <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <Textarea
            placeholder="Tell the world about your token."
            value={tokenData.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={3}
          />
          <p className="text-xs text-muted-foreground mt-1.5">No description provided (default)</p>
        </div>

        <div className="bg-kaboom-orange/10 border border-kaboom-orange/30 rounded-xl p-3 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-kaboom-orange flex-shrink-0 mt-0.5" />
          <p className="text-xs text-foreground">
            Note: You cannot change this information after launch.
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-5">
      <h3 className="text-lg font-bold">Step 2 of 3: Vault & Fees</h3>
      
      <div className="space-y-6">
        {/* Vault Slider */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium">Vault To Claim</label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Creator fee:</span>
              <div className="flex gap-1">
                {creatorFees.map((fee) => (
                  <button
                    key={fee}
                    onClick={() => updateField("creatorFee", fee)}
                    className={cn(
                      "w-8 h-6 rounded text-xs font-medium transition-colors",
                      tokenData.creatorFee === fee
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {fee}%
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="bg-muted rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold">{tokenData.vaultPercent}%</span>
              <span className="text-sm text-muted-foreground">max 30%</span>
            </div>
            <Slider
              value={[tokenData.vaultPercent]}
              onValueChange={(value) => updateField("vaultPercent", value[0])}
              max={30}
              step={1}
              className="mb-2"
            />
            {/* Visual bar chart */}
            <div className="flex gap-1 mt-4 h-16">
              {Array.from({ length: 30 }, (_, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex-1 rounded-t transition-colors",
                    i < tokenData.vaultPercent ? "bg-kaboom-orange" : "bg-border"
                  )}
                  style={{ height: `${Math.max(20, (i + 1) * 3)}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Lock Duration */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium">Vault Lock Duration</label>
            <span className="text-xs text-muted-foreground">Platform fee: 0.4%</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {lockDurations.map((duration) => (
              <button
                key={duration.id}
                onClick={() => updateField("lockDuration", duration.id as TokenData["lockDuration"])}
                className={cn(
                  "py-2 px-3 rounded-lg text-sm font-medium transition-colors",
                  tokenData.lockDuration === duration.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {duration.label}
              </button>
            ))}
          </div>
        </div>

        {/* Fee Summary */}
        <div className="bg-muted rounded-xl p-4">
          <h4 className="text-sm font-medium mb-2">Fee Summary</h4>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Creator</span>
            <span className="font-medium">{tokenData.creatorFee}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Platform</span>
            <span className="font-medium">0.4%</span>
          </div>
          <div className="border-t border-border mt-2 pt-2 flex justify-between text-sm font-semibold">
            <span>Total</span>
            <span>{(tokenData.creatorFee + 0.4).toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-5">
      <h3 className="text-lg font-bold">Step 3 of 3: Liquidity Type</h3>
      
      <div className="space-y-4">
        {/* AMM / Bonding Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl">
          <button
            onClick={() => updateField("liquidityType", "amm")}
            className={cn(
              "py-3 rounded-lg font-semibold transition-colors",
              tokenData.liquidityType === "amm"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground"
            )}
          >
            AMM
          </button>
          <button
            onClick={() => updateField("liquidityType", "bonding")}
            className={cn(
              "py-3 rounded-lg font-semibold transition-colors",
              tokenData.liquidityType === "bonding"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground"
            )}
          >
            Bonding
          </button>
        </div>

        {/* Price Chart Preview */}
        <div className="bg-muted rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl font-bold">$3.30</span>
            <span className="text-sm text-muted-foreground">TOKEN/wCELO</span>
          </div>
          {/* Placeholder chart */}
          <div className="h-32 bg-gradient-to-t from-primary/10 to-transparent rounded-lg relative overflow-hidden">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 40">
              <path
                d="M0 35 Q 20 30, 30 25 T 50 20 T 70 15 T 100 5"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
              />
              <path
                d="M0 35 Q 20 30, 30 25 T 50 20 T 70 15 T 100 5 L 100 40 L 0 40 Z"
                fill="url(#chartGradient)"
                opacity="0.3"
              />
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-kaboom-orange/10 border border-kaboom-orange/30 rounded-xl p-3 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-kaboom-orange flex-shrink-0 mt-0.5" />
          <p className="text-xs text-foreground">
            AMM gives immediate DEX visibility. Bonding curve is optional and internal until migration.
          </p>
        </div>

        {/* Finalize Section */}
        <div className="border-t border-border pt-4">
          <h4 className="text-lg font-bold mb-4">Finalize & Launch</h4>
          
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold">
                {tokenData.symbol?.charAt(0) || "?"}
              </div>
              <div>
                <h5 className="font-bold">{tokenData.symbol || "TOKEN"}</h5>
                <p className="text-sm text-muted-foreground">{tokenData.name || "Token Name"}</p>
              </div>
              <Button variant="outline" size="sm" className="ml-auto">
                <Check className="h-4 w-4 mr-1" /> Claim
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm pt-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vault</span>
                <span className="font-medium">{tokenData.vaultPercent}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground"></span>
                <span className="font-medium">{100 - tokenData.vaultPercent}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fee</span>
                <span className="font-medium">Creator {tokenData.creatorFee}% + Platform 0.4%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Liquidity</span>
                <span className="font-medium">{tokenData.liquidityType.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <button 
              onClick={() => step > 1 && setStep((step - 1) as Step)}
              className={cn("p-1", step === 1 && "invisible")}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-muted-foreground">
              Step {step} of 3: {step === 1 ? "Token Info" : step === 2 ? "Vault & Fees" : "Liquidity Type"}
            </span>
            <button 
              onClick={() => step < 3 && canProceed() && setStep((step + 1) as Step)}
              className={cn("p-1", (step === 3 || !canProceed()) && "invisible")}
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </DialogTitle>
        </DialogHeader>

        <div className="py-2">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        {/* Sticky Action Button */}
        <div className="sticky bottom-0 pt-4 bg-popover">
          {step < 3 ? (
            <Button
              variant="kaboom"
              size="lg"
              className="w-full"
              onClick={() => setStep((step + 1) as Step)}
              disabled={!canProceed()}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="kaboom"
              size="lg"
              className="w-full"
              onClick={handleLaunch}
              disabled={isLaunching}
            >
              {isLaunching ? "Launching..." : "Launch Token"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTokenModal;
