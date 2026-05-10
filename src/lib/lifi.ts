import type { RouteExtended, StatusResponse } from "@lifi/sdk";

// ── LI.FI REST API base ──────────────────────────────────────────────
const LIFI_API = "https://li.quest/v1";

// ── Chain IDs (LI.FI format) ─────────────────────────────────────────
export const CHAIN_IDS = {
  ethereum: 1,
  arbitrum: 42161,
  base: 8453,
  solana: 1151111081099710,
} as const;

// ── Token addresses (canonical per chain) ────────────────────────────
const NATIVE = "0x0000000000000000000000000000000000000000";

const TOKENS: Record<string, Record<string, string>> = {
  ethereum: {
    ETH: NATIVE,
    USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  },
  arbitrum: {
    ETH: NATIVE,
    USDC: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    USDT: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
  },
  base: {
    ETH: NATIVE,
    USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  },
};

const SOLANA_USDC = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

export function getChainId(chain: string): number {
  return CHAIN_IDS[chain as keyof typeof CHAIN_IDS] ?? CHAIN_IDS.arbitrum;
}

export function getTokenAddress(chain: string, token: string): string {
  const normalizedChain = chain.toLowerCase();
  const normalizedToken = token.toUpperCase();
  return TOKENS[normalizedChain]?.[normalizedToken] ?? NATIVE;
}

// ── Types ─────────────────────────────────────────────────────────────
export interface LifiQuoteParams {
  fromChain: string;
  toChain: string;
  fromToken: string;
  toToken: string;
  fromAmount: string; // wei string (smallest unit)
  fromAddress?: string;
  toAddress?: string;
}

export interface LifiQuoteResult {
  route: RouteExtended;
  receiveAmount: string;
  receiveToken: string;
  feeUsd: number;
  gasUsd: number;
  etaSec: number;
  steps: number;
}

// ── API calls ─────────────────────────────────────────────────────────
let integratorKey = "";

export function setLifiIntegratorKey(key: string) {
  integratorKey = key;
}

async function lifiFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${LIFI_API}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") url.searchParams.set(k, v);
    });
  }
  if (integratorKey) url.searchParams.set("integrator", integratorKey);

  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`LI.FI API error ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

// ── Quote ─────────────────────────────────────────────────────────────
export async function getLifiQuote(params: LifiQuoteParams): Promise<LifiQuoteResult> {
  const fromChainId = getChainId(params.fromChain);
  const toChainId = getChainId(params.toChain);
  const fromTokenAddr = params.fromToken || getTokenAddress(params.fromChain, "ETH");
  const toTokenAddr = params.toToken || SOLANA_USDC;

  const route: RouteExtended = await lifiFetch<RouteExtended>("/quote", {
    fromChain: String(fromChainId),
    toChain: String(toChainId),
    fromToken: fromTokenAddr,
    toToken: toTokenAddr,
    fromAmount: params.fromAmount,
    fromAddress: params.fromAddress ?? "",
    toAddress: params.toAddress ?? "",
    order: "CHEAPEST",
  });

  const step = route.steps[0];
  const estimate = step?.estimate;

  return {
    route,
    receiveAmount: estimate?.toAmount ?? "0",
    receiveToken: route.toToken.symbol ?? "USDC",
    feeUsd: Number(estimate?.feeCosts?.reduce((sum, f) => sum + Number(f.amountUSD ?? 0), 0) ?? 0),
    gasUsd: Number(estimate?.gasCosts?.reduce((sum, g) => sum + Number(g.amountUSD ?? 0), 0) ?? 0),
    etaSec: estimate?.executionDuration ?? 30,
    steps: route.steps.length,
  };
}

// ── Status ────────────────────────────────────────────────────────────
export async function getLifiStatus(txHash: string): Promise<StatusResponse> {
  return lifiFetch<StatusResponse>("/status", { txHash });
}

// ── Helpers ───────────────────────────────────────────────────────────
export function formatTokenAmount(amount: string, decimals: number): string {
  const num = Number(amount) / 10 ** decimals;
  if (num < 0.0001) return num.toExponential(2);
  return num >= 1 ? num.toFixed(4) : num.toFixed(6);
}

export function toWei(amount: number | string, decimals: number): string {
  const parsed = typeof amount === "string" ? parseFloat(amount) || 0 : amount;
  // Use BigInt to avoid precision issues
  const amt = BigInt(Math.floor(parsed * 10 ** decimals));
  return amt.toString();
}

export const DECIMALS: Record<string, number> = {
  ETH: 18,
  USDC: 6,
  USDT: 6,
  SOL: 9,
};
