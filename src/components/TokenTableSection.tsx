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

type TabType = "top" | "champagne" | "new";
type SortType = "mcap" | "tx";

const TokenTableSection = ({ tokens, onBuy, onTokenClick }: TokenTableSectionProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("top");
  const [sortType, setSortType] = useState<SortType>("mcap");
  const [sortColumn, setSortColumn] = useState<string>("mcap");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const tabs = [
    { id: "top" as TabType, label: "Top Boomers" },
    { id: "champagne" as TabType, label: "Champagne Boomers" },
    { id: "new" as TabType, label: "New" },
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

  // Extended mock data for the table
  const tableData = tokens.map((token, index) => ({
    ...token,
    change1h: (Math.random() * 10 - 5).toFixed(1),
    change6h: (Math.random() * 15 - 7.5).toFixed(1),
    change24h: token.priceChange.toFixed(1),
    volume24h: `$${(Math.random() * 600 + 10).toFixed(1)}k`,
    mcap: `$${(Math.random() * 25 + 1).toFixed(1)}M`,
    creator: `@user${index + 1}`,
  }));

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

        {/* Table */}
        <div className="bg-card rounded-2xl overflow-hidden shadow-card">
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
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm font-bold overflow-hidden relative">
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
                    <p className="font-semibold text-sm">{token.name}</p>
                    <p className="text-xs text-muted-foreground">{token.symbol}</p>
                  </div>
                </div>

                {/* Creator */}
                <div className="col-span-2 flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs">
                    👤
                  </div>
                  <span className="text-sm text-muted-foreground">{token.creator}</span>
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
      </div>
    </section>
  );
};

export default TokenTableSection;
