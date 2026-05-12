export type StrategyRisk = "low" | "medium" | "high";

export interface AgentStrategy {
  id: string;
  name: string;
  description: string;
  tagline: string;
  risk: StrategyRisk;
  category: string;
  priceUsd: number;
  priceLabel: string;
  /** True if bundled free with certain skills */
  bundled: boolean;
}

export const AGENT_STRATEGIES: AgentStrategy[] = [
  {
    id: "auto-compound",
    name: "Auto-Compound",
    description: "Automatically claim and reinvest yield rewards on a schedule.",
    tagline: "Compound yields automatically",
    risk: "low",
    category: "Yield",
    priceUsd: 0.5,
    priceLabel: "0.001 USDC",
    bundled: true,
  },
  {
    id: "rebalance",
    name: "Rebalance",
    description: "Monitor and rebalance portfolio allocations when drift exceeds threshold.",
    tagline: "Keep your portfolio balanced",
    risk: "medium",
    category: "Management",
    priceUsd: 0.001,
    priceLabel: "0.001 USDC",
    bundled: true,
  },
  {
    id: "stop-loss",
    name: "Stop-Loss",
    description: "Automatically exit positions when price drops below configured threshold.",
    tagline: "Protect against downside",
    risk: "medium",
    category: "Risk",
    priceUsd: 0.5,
    priceLabel: "0.001 USDC",
    bundled: true,
  },
  {
    id: "take-profit",
    name: "Take-Profit",
    description: "Automatically sell when price targets are hit.",
    tagline: "Lock in gains automatically",
    risk: "low",
    category: "Risk",
    priceUsd: 0.5,
    priceLabel: "0.001 USDC",
    bundled: true,
  },
  {
    id: "dca",
    name: "DCA",
    description: "Dollar-cost average into assets on a configured schedule.",
    tagline: "Buy the dip automatically",
    risk: "low",
    category: "Trading",
    priceUsd: 0.001,
    priceLabel: "0.001 USDC",
    bundled: true,
  },
  {
    id: "arbitrage",
    name: "Arbitrage",
    description: "Monitor DEX prices across protocols and execute arbitrage opportunities.",
    tagline: "Find and execute arbitrage",
    risk: "high",
    category: "Trading",
    priceUsd: 2.0,
    priceLabel: "0.001 USDC",
    bundled: false,
  },
];

export type StrategyId = (typeof AGENT_STRATEGIES)[number]["id"];

export function getStrategy(id: string): AgentStrategy | undefined {
  return AGENT_STRATEGIES.find((s) => s.id === id);
}

export function riskLabel(r: StrategyRisk): string {
  switch (r) {
    case "low":
      return "Lower risk";
    case "medium":
      return "Medium risk";
    case "high":
      return "Higher risk";
  }
}
