export type SkillRisk = "low" | "medium" | "high";

export interface AgentSkill {
  id: string;
  protocol: string;
  name: string;
  tagline: string;
  description: string;
  risk: SkillRisk;
  category: string;
  priceUsd: number;
  priceLabel: string;
  icon: string;
  /** Strategies included for free with this skill */
  bundledStrategies: string[];
  /** Tools included for free with this skill */
  bundledTools: string[];
}

export const AGENT_SKILLS: AgentSkill[] = [
  {
    id: "polymarket",
    protocol: "Polymarket",
    name: "Prediction mark",
    tagline: "Trade probability markets within guardrails.",
    description: "Agent places sized positions on liquid prediction markets.",
    risk: "high",
    category: "Trading",
    priceUsd: 0.001,
    priceLabel: "0.001 USDC",
    icon: "/images/icon-blue.svg",
    bundledStrategies: ["take-profit", "stop-loss"],
    bundledTools: ["polymarket-bet"],
  },
  {
    id: "meteora",
    protocol: "Meteora",
    name: "Dynamic LP",
    tagline: "Provide liquidity with bounded impermanent loss.",
    description: "DLMM / dynamic pools on Meteora with capped pool share.",
    risk: "medium",
    category: "Liquidity",
    priceUsd: 0.001,
    priceLabel: "0.001 USDC",
    icon: "/images/meteora-icon.svg",
    bundledStrategies: ["rebalance", "auto-compound"],
    bundledTools: ["meteora-lp"],
  },
  {
    id: "kamino",
    protocol: "Kamino",
    name: "Lend & earn",
    tagline: "Idle USDC works while you sleep.",
    description: "Supply to curated Kamino markets with auto-compound.",
    risk: "low",
    category: "Yield",
    priceUsd: 0.001,
    priceLabel: "0.001 USDC",
    icon: "/images/kamino-icon.svg",
    bundledStrategies: ["auto-compound"],
    bundledTools: ["kamino-deposit"],
  },

  {
    id: "jupiter",
    protocol: "Jupiter",
    name: "Swap & DCA",
    tagline: "Best-route swaps on a schedule.",
    description: "Recurring buys/sells with slippage and size limits.",
    risk: "medium",
    category: "Trading",
    priceUsd: 0.001,
    priceLabel: "0.001 USDC",
    icon: "/images/jupiter-jup-logo.svg",
    bundledStrategies: ["dca"],
    bundledTools: ["jupiter-swap"],
  },
];

export type SkillId = (typeof AGENT_SKILLS)[number]["id"];

export function isSkillId(id: string | undefined): id is SkillId {
  return id !== undefined && new Set(AGENT_SKILLS.map((s) => s.id)).has(id);
}

export function getSkill(id: string | undefined): AgentSkill | undefined {
  return isSkillId(id) ? AGENT_SKILLS.find((s) => s.id === id) : undefined;
}

export function riskLabel(r: SkillRisk): string {
  switch (r) {
    case "low":
      return "Lower risk";
    case "medium":
      return "Medium risk";
    case "high":
      return "Higher risk";
  }
}
