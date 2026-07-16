import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Token } from "./TokenCard";
import kaboomLogo from "@/assets/kaboom-logo.png";

interface TokenTableSectionProps {
  tokens: Token[];
  onBuy: (token: Token) => void;
  onTokenClick: (token: Token) => void;
}

type TabType = "top" | "new";
type SortType = "mcap" | "tx";

const TokenTableSection = ({ tokens, onBuy, onTokenClick }: TokenTableSectionProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("top");
  const [sortType, setSortType] = useState<SortType>("mcap");
  const [sortColumn, setSortColumn] = useState<string>("mcap");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const tabs = [
    { id: "top" as TabType, label: "Top Boomers" },
    { id: "new" as TabType, label: "New Boomers" },
  ];

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortColumn !== column) return <ChevronUp className="h-3 w-3 opacity-30" />;
    return sortDirection === "desc" 
      ? <ChevronDown className="h-3 w-3" /> 
      : <ChevronUp className="h-3 w-3" />;
  };

  // Build table rows from real on-chain token data.
  const formatCreator = (addr?: string) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "—";
  const formatMcap = (mc?: number) => {
    if (!mc || mc <= 0) return "—";
    if (mc >= 1_000_000) return `$${(mc / 1_000_000).toFixed(2)}M`;
    if (mc >= 1_000) return `$${(mc / 1_000).toFixed(1)}K`;
    return `$${mc.toFixed(0)}`;
  };
  const tableData = tokens.map((token) => ({
    ...token,
    change1h: "0.0",
    change6h: "0.0",
    change24h: (token.priceChange ?? 0).toFixed(1),
    volume24h: token.volume ? `$${token.volume}` : "$0",
    mcap: formatMcap(token.marketCap),
    creator: formatCreator(token.creator),
  }));

  const sortedData = [...tableData];
  if (activeTab === "new") {
    // New Boomers: newest first by launchTime if present, otherwise reverse insertion.
    sortedData.sort((a: any, b: any) => (b.launchTime ?? 0) - (a.launchTime ?? 0));
  }

  return (
    <section className="py-6">
      <div className="container px-4">
        {/* Tabs */}
        <div className="flex items-center gap-6 mb-4 overflow-x-auto scroll-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "text-lg font-semibold whitespace-nowrap pb-2 border-b-2 transition-colors",
                activeTab === tab.id
                  ? "text-foreground border-foreground"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters Row */}
        <div className="flex items-center gap-3 mb-4 overflow-x-auto scroll-hide pb-2">
          {/* Sort Type Toggle */}
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => setSortType("mcap")}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                sortType === "mcap"
                  ? "bg-accent/20 text-accent"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              MCap
            </button>
            <button
              onClick={() => setSortType("tx")}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                sortType === "tx"
                  ? "bg-accent/20 text-accent"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              TX
            </button>
          </div>

          {/* Chain Filter */}
          <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
            <button className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium bg-accent/20 text-accent"
            )}>
              All
            </button>
            <button className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-muted-foreground/10">
              <img src={kaboomLogo} alt="Celo" className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-card rounded-2xl overflow-hidden shadow-card">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-border text-xs font-medium text-muted-foreground">
            <div className="col-span-4">Token</div>
            <div className="col-span-2">Creator</div>
            <button
              className="col-span-1 flex items-center gap-1 hover:text-foreground"
              onClick={() => handleSort("1h")}
            >
              1h <SortIcon column="1h" />
            </button>
            <button
              className="col-span-1 flex items-center gap-1 hover:text-foreground"
              onClick={() => handleSort("6h")}
            >
              6h <SortIcon column="6h" />
            </button>
            <button
              className="col-span-1 flex items-center gap-1 hover:text-foreground"
              onClick={() => handleSort("24h")}
            >
              24h <SortIcon column="24h" />
            </button>
            <button
              className="col-span-1 flex items-center gap-1 hover:text-foreground"
              onClick={() => handleSort("volume")}
            >
              Volume <SortIcon column="volume" />
            </button>
            <button
              className="col-span-2 flex items-center gap-1 hover:text-foreground"
              onClick={() => handleSort("mcap")}
            >
              MCap <SortIcon column="mcap" />
            </button>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-border">
            {tableData.map((token) => (
              <div
                key={token.id}
                className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => onTokenClick(token)}
              >
                {/* Token */}
                <div className="col-span-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm font-bold overflow-hidden relative flex-shrink-0">
                    {token.logo ? (
                      <img src={token.logo} alt={token.name} className="h-full w-full object-cover" />
                    ) : (
                      token.symbol.charAt(0)
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3">
                      <img src={kaboomLogo} alt="" className="h-full w-full" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{token.name}</p>
                    <p className="text-xs text-muted-foreground">{token.symbol}</p>
                  </div>
                </div>

                {/* Creator */}
                <div className="col-span-2 flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs flex-shrink-0">
                    👤
                  </div>
                  <span className="text-sm text-muted-foreground truncate">{token.creator}</span>
                </div>

                {/* 1h Change */}
                <div className={cn(
                  "col-span-1 text-sm font-medium",
                  parseFloat(token.change1h) >= 0 ? "text-success" : "text-destructive"
                )}>
                  {parseFloat(token.change1h) >= 0 ? "+" : ""}{token.change1h}%
                </div>

                {/* 6h Change */}
                <div className={cn(
                  "col-span-1 text-sm font-medium",
                  parseFloat(token.change6h) >= 0 ? "text-success" : "text-destructive"
                )}>
                  {parseFloat(token.change6h) >= 0 ? "+" : ""}{token.change6h}%
                </div>

                {/* 24h Change */}
                <div className={cn(
                  "col-span-1 text-sm font-medium",
                  parseFloat(token.change24h) >= 0 ? "text-success" : "text-destructive"
                )}>
                  {parseFloat(token.change24h) >= 0 ? "+" : ""}{token.change24h}%
                </div>

                {/* Volume */}
                <div className="col-span-1 text-sm font-medium">
                  {token.volume24h}
                </div>

                {/* MCap */}
                <div className="col-span-2 text-sm font-medium">
                  {token.mcap}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {tableData.map((token) => (
            <div
              key={token.id}
              className="bg-card rounded-xl p-4 shadow-card cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => onTokenClick(token)}
            >
              {/* Token Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm font-bold overflow-hidden relative flex-shrink-0">
                    {token.logo ? (
                      <img src={token.logo} alt={token.name} className="h-full w-full object-cover" />
                    ) : (
                      token.symbol.charAt(0)
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3">
                      <img src={kaboomLogo} alt="" className="h-full w-full" />
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold">{token.name}</p>
                    <p className="text-xs text-muted-foreground">{token.symbol}</p>
                  </div>
                </div>
                <div className={cn(
                  "text-sm font-bold",
                  parseFloat(token.change24h) >= 0 ? "text-success" : "text-destructive"
                )}>
                  {parseFloat(token.change24h) >= 0 ? "+" : ""}{token.change24h}%
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">MCap</p>
                  <p className="font-medium">{token.mcap}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Volume</p>
                  <p className="font-medium">{token.volume24h}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">1h</p>
                  <p className={cn(
                    "font-medium",
                    parseFloat(token.change1h) >= 0 ? "text-success" : "text-destructive"
                  )}>
                    {parseFloat(token.change1h) >= 0 ? "+" : ""}{token.change1h}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TokenTableSection;
