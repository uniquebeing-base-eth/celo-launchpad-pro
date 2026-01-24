import { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

interface PriceChartProps {
  tokenSymbol: string;
  className?: string;
}

type TimeFrame = "24h" | "7d" | "1m";

// Generate mock price data
const generateMockData = (timeframe: TimeFrame) => {
  const points = timeframe === "24h" ? 24 : timeframe === "7d" ? 7 : 30;
  const basePrice = 3.3;
  const data = [];
  
  for (let i = 0; i < points; i++) {
    const variance = (Math.random() - 0.5) * 0.5;
    const trend = (i / points) * 0.3; // Slight upward trend
    data.push({
      time: i,
      price: basePrice + variance + trend,
      volume: Math.random() * 10000 + 5000,
    });
  }
  
  return data;
};

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: { volume: number } }> }) => {
  if (active && payload && payload.length) {
    const price = payload[0].value;
    const volume = payload[0].payload.volume;
    return (
      <div className="bg-secondary/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-border">
        <p className="font-bold">${price.toFixed(4)}</p>
        <p className="text-xs text-muted-foreground">
          Vol: {(volume / 1000).toFixed(1)}k
        </p>
      </div>
    );
  }
  return null;
};

const PriceChart = ({ tokenSymbol, className }: PriceChartProps) => {
  const [timeframe, setTimeframe] = useState<TimeFrame>("24h");
  
  const chartData = useMemo(() => generateMockData(timeframe), [timeframe]);
  
  const priceChange = useMemo(() => {
    if (chartData.length < 2) return 0;
    const first = chartData[0].price;
    const last = chartData[chartData.length - 1].price;
    return ((last - first) / first) * 100;
  }, [chartData]);
  
  const isPositive = priceChange >= 0;
  
  const timeLabels: Record<TimeFrame, string[]> = {
    "24h": ["12h ago", "Now"],
    "7d": ["7d ago", "Now"],
    "1m": ["30d ago", "Now"],
  };

  return (
    <div className={cn("bg-card rounded-2xl p-4 shadow-card", className)}>
      {/* Timeframe Selector */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg">{tokenSymbol} / wCELO</h3>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {(["24h", "7d", "1m"] as TimeFrame[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={cn(
                "px-3 py-1 rounded-md text-sm font-medium transition-colors",
                timeframe === tf
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Current Price */}
      <div className="mb-4">
        <p className="text-3xl font-bold">
          ${chartData[chartData.length - 1]?.price.toFixed(4)}
        </p>
        <p className={cn(
          "text-sm font-medium",
          isPositive ? "text-success" : "text-destructive"
        )}>
          {isPositive ? "+" : ""}{priceChange.toFixed(2)}% ({timeframe})
        </p>
      </div>

      {/* Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop 
                  offset="0%" 
                  stopColor={isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"} 
                  stopOpacity={0.3} 
                />
                <stop 
                  offset="100%" 
                  stopColor={isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"} 
                  stopOpacity={0} 
                />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false}
              tick={false}
            />
            <YAxis 
              domain={['dataMin - 0.1', 'dataMax + 0.1']} 
              axisLine={false} 
              tickLine={false}
              tick={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke={isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"}
              strokeWidth={2}
              fill="url(#priceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Time Labels */}
      <div className="flex justify-between text-xs text-muted-foreground mt-2">
        <span>{timeLabels[timeframe][0]}</span>
        <span>{timeLabels[timeframe][1]}</span>
      </div>
    </div>
  );
};

export default PriceChart;
