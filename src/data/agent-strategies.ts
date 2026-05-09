export type StrategyRisk = "low" | "medium" | "high";

export interface AgentStrategy {
  id: string;
  protocol: string;
  name: string;
  tagline: string;
  description: string;
  risk: StrategyRisk;
  category: string;
  /** Two-letter mark inside protocol tile */
  abbrev: string;
  /** CSS gradient stops for logo tile */
  brandFrom: string;
  brandTo: string;
}

export const AGENT_STRATEGIES: AgentStrategy[] = [
  {
    id: "polymarket",
    protocol: "Polymarket",
    name: "Prediction mark",
    tagline: "Trade probability markets within guardrails.",
    description:
      "Agent places sized positions on liquid prediction markets. Caps prevent one bad model update from blowing the vault.",
    risk: "high",
    category: "Trading",
    abbrev: "PM",
    brandFrom: "oklch(0.55 0.18 250)",
    brandTo: "oklch(0.45 0.14 260)",
  },
  {
    id: "meteora",
    protocol: "Meteora",
    name: "Dynamic LP",
    tagline: "Provide liquidity with bounded impermanent loss.",
    description:
      "DLMM / dynamic pools on Meteora. Rules cap pool share and rebalance cadence so the agent cannot over-concentrate.",
    risk: "medium",
    category: "Liquidity",
    abbrev: "ME",
    brandFrom: "oklch(0.62 0.2 45)",
    brandTo: "oklch(0.52 0.16 35)",
  },
  {
    id: "kamino",
    protocol: "Kamino",
    name: "Lend & earn",
    tagline: "Idle USDC works while you sleep.",
    description:
      "Supply to curated Kamino markets. APY / risk slider maps to vault mixes — conservative by default.",
    risk: "low",
    category: "Yield",
    abbrev: "KM",
    brandFrom: "oklch(0.58 0.14 145)",
    brandTo: "oklch(0.48 0.12 155)",
  },
  {
    id: "sanctum",
    protocol: "Sanctum",
    name: "Liquid stake",
    tagline: "SOL → LST with transparent limits.",
    description:
      "Route SOL into liquid staking. Enforce max LST share of the vault and optional Jito-aligned preferences.",
    risk: "low",
    category: "Staking",
    abbrev: "SC",
    brandFrom: "oklch(0.55 0.12 220)",
    brandTo: "oklch(0.42 0.1 240)",
  },
  {
    id: "drift",
    protocol: "Drift",
    name: "Perps & spots",
    tagline: "Hedge and speculate with a leverage ceiling.",
    description:
      "Trade perpetuals and spots through Drift with hard leverage and notional caps — the vault says no before liquidation risk spikes.",
    risk: "high",
    category: "Trading",
    abbrev: "DR",
    brandFrom: "oklch(0.5 0.14 280)",
    brandTo: "oklch(0.4 0.12 270)",
  },
  {
    id: "jupiter",
    protocol: "Jupiter",
    name: "Swap & DCA",
    tagline: "Best-route swaps on a schedule.",
    description:
      "Recurring buys / sells with slippage and size limits. Ideal for slow, boring accumulation strategies.",
    risk: "medium",
    category: "Trading",
    abbrev: "JP",
    brandFrom: "oklch(0.72 0.18 75)",
    brandTo: "oklch(0.55 0.14 55)",
  },
  {
    id: "raydium",
    protocol: "Raydium",
    name: "AMM LP",
    tagline: "Classic pools with concentration controls.",
    description:
      "Provide liquidity on Raydium CLMM / AMM pairs. Toggle concentrated vs wide range; agent respects max pool weight.",
    risk: "medium",
    category: "Liquidity",
    abbrev: "RD",
    brandFrom: "oklch(0.65 0.22 330)",
    brandTo: "oklch(0.5 0.18 310)",
  },
  {
    id: "marginfi",
    protocol: "marginfi",
    name: "Lend & borrow",
    tagline: "Credit lines with an LTV hard stop.",
    description:
      "Loop lend or light borrow against whitelisted collateral. LTV cap prevents runaway leverage in autopilot.",
    risk: "high",
    category: "Yield",
    abbrev: "MF",
    brandFrom: "oklch(0.55 0.16 200)",
    brandTo: "oklch(0.42 0.12 210)",
  },
];

export type StrategyId = (typeof AGENT_STRATEGIES)[number]["id"];

const IDS = new Set(AGENT_STRATEGIES.map((s) => s.id));

export function isStrategyId(id: string | undefined): id is StrategyId {
  return id !== undefined && IDS.has(id);
}

export function getStrategy(id: string | undefined): AgentStrategy | undefined {
  return isStrategyId(id) ? AGENT_STRATEGIES.find((s) => s.id === id) : undefined;
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
