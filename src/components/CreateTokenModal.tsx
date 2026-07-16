import { useState } from "react";
import { useToast } from '@/hooks/use-toast';
import { useSimulateContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { CONTRACTS, KABOOM_FACTORY_ABI } from '@/lib/wagmi';
import { ArrowLeft, ArrowRight, Upload, AlertTriangle, Check, Info, ChevronDown, ChevronUp, Globe, Send, Twitter } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  // Social Links
  twitterLink: string;
  telegramLink: string;
  websiteLink: string;
  farcasterLink: string;
  // Vault & Fees
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
  const [showMetadata, setShowMetadata] = useState(false);
  const [tokenData, setTokenData] = useState<TokenData>({
    name: "",
    symbol: "",
    logo: null,
    description: "",
    twitterLink: "",
    telegramLink: "",
    websiteLink: "",
    farcasterLink: "",
    vaultPercent: 0,
    lockDuration: "1month",
    creatorFee: 1,
    liquidityType: "amm",
  });
  const [isLaunching, setIsLaunching] = useState(false);
  const { toast } = useToast();
  const { address: account } = useAccount();

  const updateField = <K extends keyof TokenData>(field: K, value: TokenData[K]) => {
    setTokenData(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    if (step === 1) {
      return tokenData.name.trim().length > 0 && tokenData.symbol.trim().length > 0;
    }
    return true;
  };

  const vaultDurationToSeconds = (d: TokenData['lockDuration']) => {
    switch (d) {
      case '7days': return 7 * 24 * 60 * 60;
      case '1month': return 30 * 24 * 60 * 60;
      case '6months': return 180 * 24 * 60 * 60;
      case '1year': return 365 * 24 * 60 * 60;
      default: return 0;
    }
  };

  // Prepare contract write for launchToken
  const creatorFeeBps = Math.floor(tokenData.creatorFee * 100);
  const vaultDurationSeconds = vaultDurationToSeconds(tokenData.lockDuration);

  const { data: simulation } = useSimulateContract({
    address: CONTRACTS.tokenFactory as `0x${string}`,
    abi: KABOOM_FACTORY_ABI,
    functionName: 'launchToken',
    args: [
      tokenData.name,
      tokenData.symbol,
      BigInt(creatorFeeBps),
      BigInt(vaultDurationSeconds),
      tokenData.twitterLink || '',
      tokenData.telegramLink || '',
      tokenData.websiteLink || '',
      tokenData.farcasterLink || '',
    ],
    query: {
      enabled: walletConnected && !!account && tokenData.name.length > 0 && tokenData.symbol.length > 0,
    },
  });

  const { writeContractAsync } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const { data: receipt } = useWaitForTransactionReceipt({ hash: txHash });

  const handleLaunch = async () => {
    if (!walletConnected) {
      onConnectWallet();
      return;
    }

    try {
      setIsLaunching(true);
      const request = simulation?.request ?? {
        address: CONTRACTS.tokenFactory as `0x${string}`,
        abi: KABOOM_FACTORY_ABI,
        functionName: 'launchToken' as const,
        args: [
          tokenData.name,
          tokenData.symbol,
          BigInt(creatorFeeBps),
          BigInt(vaultDurationSeconds),
          tokenData.twitterLink || '',
          tokenData.telegramLink || '',
          tokenData.websiteLink || '',
          tokenData.farcasterLink || '',
        ] as const,
      };

      const hash = await writeContractAsync(request as any);
      setTxHash(hash);
      toast({ title: 'Transaction sent', description: hash });
    } catch (e: any) {
      console.error('Launch error', e);
      toast({ title: 'Launch error', description: e?.shortMessage || e?.message || 'Unknown error', variant: 'destructive' });
    } finally {
      setIsLaunching(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-5">
      <div className="space-y-4">
        {/* Required Fields */}
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1">
            Name <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder="Enter token name"
            value={tokenData.name}
            onChange={(e) => updateField("name", e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1">
            Symbol <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              placeholder="Enter token symbol"
              value={tokenData.symbol}
              onChange={(e) => updateField("symbol", e.target.value.toUpperCase().slice(0, 4))}
              maxLength={4}
              className="pl-7"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1">
            Image <span className="text-destructive">*</span>
          </label>
          <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
            <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-medium">SELECT FILE (JPEG / PNG, 1MB MAX)</p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Token Metadata Collapsible */}
        <Collapsible open={showMetadata} onOpenChange={setShowMetadata}>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">Token Metadata (optional)</span>
              <Info className="h-4 w-4 text-muted-foreground" />
            </div>
            {showMetadata ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-4 pt-2">
            {/* Description */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Description
              </label>
              <Textarea
                placeholder="Enter token description"
                value={tokenData.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={3}
              />
            </div>

            {/* Social Links */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Telegram Link
              </label>
              <div className="relative">
                <Send className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="https://t.me/..."
                  value={tokenData.telegramLink}
                  onChange={(e) => updateField("telegramLink", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Website Link
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="https://..."
                  value={tokenData.websiteLink}
                  onChange={(e) => updateField("websiteLink", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                X (Twitter) Link
              </label>
              <div className="relative">
                <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="https://x.com/..."
                  value={tokenData.twitterLink}
                  onChange={(e) => updateField("twitterLink", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Farcaster Link
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">🟣</span>
                <Input
                  placeholder="https://warpcast.com/..."
                  value={tokenData.farcasterLink}
                  onChange={(e) => updateField("farcasterLink", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

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
                        ? "bg-accent/20 text-accent"
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
                    ? "bg-accent/20 text-accent"
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
      <div className="space-y-4">
        {/* AMM / Bonding Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl">
          <button
            onClick={() => updateField("liquidityType", "amm")}
            className={cn(
              "py-3 rounded-lg font-semibold transition-colors",
              tokenData.liquidityType === "amm"
                ? "bg-accent/20 text-accent shadow-sm"
                : "text-muted-foreground"
            )}
          >
            Static
          </button>
          <button
            onClick={() => updateField("liquidityType", "bonding")}
            className={cn(
              "py-3 rounded-lg font-semibold transition-colors",
              tokenData.liquidityType === "bonding"
                ? "bg-accent/20 text-accent shadow-sm"
                : "text-muted-foreground"
            )}
          >
            Dynamic 3%
          </button>
        </div>

        {/* Fee Tier */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <label className="text-sm font-medium">Fee Tier</label>
            <Info className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((tier) => (
              <button
                key={tier}
                className={cn(
                  "py-3 rounded-lg font-semibold transition-colors",
                  tokenData.creatorFee === tier
                    ? "bg-accent/20 text-accent"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
                onClick={() => updateField("creatorFee", tier)}
              >
                {tier}%
              </button>
            ))}
          </div>
        </div>

        {/* Sniper Tax Duration */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <label className="text-sm font-medium">Sniper Tax Duration</label>
            <Info className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            type="number"
            placeholder="15"
            defaultValue={15}
            className="mb-1"
          />
          <p className="text-xs text-muted-foreground">
            Seconds for sniper tax to decay from starting fee (80%) to ending fee (5%)
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-kaboom-orange/10 border border-kaboom-orange/30 rounded-xl p-3 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-kaboom-orange flex-shrink-0 mt-0.5" />
          <p className="text-xs text-foreground">
            Static gives immediate DEX visibility. Dynamic allows fee adjustments post-launch.
          </p>
        </div>

        {/* Finalize Section */}
        <div className="border-t border-border pt-4">
          <h4 className="text-lg font-bold mb-4">Summary</h4>
          
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold">
                {tokenData.symbol?.charAt(0) || "?"}
              </div>
              <div>
                <h5 className="font-bold">${tokenData.symbol || "TOKEN"}</h5>
                <p className="text-sm text-muted-foreground">{tokenData.name || "Token Name"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm pt-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vault</span>
                <span className="font-medium">{tokenData.vaultPercent}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pool</span>
                <span className="font-medium">{100 - tokenData.vaultPercent}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fee</span>
                <span className="font-medium">{tokenData.creatorFee}% + 0.4%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium">{tokenData.liquidityType === "amm" ? "Static" : "Dynamic"}</span>
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
              Step {step} of 3: {step === 1 ? "Token Info" : step === 2 ? "Vault & Fees" : "Fee Config"}
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
