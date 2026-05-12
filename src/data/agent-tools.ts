export interface AgentTool {
  id: string;
  name: string;
  description: string;
  tagline: string;
  category: string;
  priceUsd: number;
  priceLabel: string;
  /** True if bundled free with certain strategies */
  bundled: boolean;
}

export const AGENT_TOOLS: AgentTool[] = [
  {
    id: "jupiter-swap",
    name: "Jupiter Swap",
    description: "Execute token swaps through Jupiter aggregator.",
    tagline: "Best-route token swaps",
    category: "DEX",
    priceUsd: 0.001,
    priceLabel: "0.001 USDC",
    bundled: true,
  },
  {
    id: "kamino-deposit",
    name: "Kamino Deposit",
    description: "Deposit tokens into Kamino yield vaults.",
    tagline: "Earn yield on deposits",
    category: "Lending",
    priceUsd: 0.001,
    priceLabel: "0.001 USDC",
    bundled: true,
  },

  {
    id: "meteora-lp",
    name: "Meteora LP",
    description: "Manage DLMM liquidity positions on Meteora.",
    tagline: "Provide concentrated liquidity",
    category: "Liquidity",
    priceUsd: 0.5,
    priceLabel: "0.001 USDC",
    bundled: true,
  },

  {
    id: "polymarket-bet",
    name: "Polymarket Bet",
    description: "Place prediction market positions.",
    tagline: "Trade on outcomes",
    category: "Prediction",
    priceUsd: 0.5,
    priceLabel: "0.001 USDC",
    bundled: true,
  },

  {
    id: "x402-pay",
    name: "x402 Payments",
    description: "Pay for APIs and services using x402 protocol.",
    tagline: "Pay-per-call",
    category: "Payments",
    priceUsd: 0.1,
    priceLabel: "0.001 USDC",
    bundled: false,
  },
  {
    id: "nft-sniper",
    name: "NFT Sniper",
    description: "Monitor and snipe NFT listings below floor price.",
    tagline: "Snipe undervalued NFTs",
    category: "NFT",
    priceUsd: 1.5,
    priceLabel: "0.001 USDC",
    bundled: false,
  },
];

export type ToolId = (typeof AGENT_TOOLS)[number]["id"];

export function getTool(id: string): AgentTool | undefined {
  return AGENT_TOOLS.find((t) => t.id === id);
}
