/**
 * Bridging helpers via Li.F.I **REST** (`GET https://li.quest/v1/quote`).
 * Matches their agent-friendly HTTP surface ([API](https://docs.li.fi/api-reference/get-a-quote-for-a-token-transfer)).
 */
type LifiFeeLine = { amountUSD?: string | number };

export type LifiQuoteStepJson = {
  type?: string;
  tool?: string;
  toolDetails?: { name?: string; key?: string };
  estimate?: {
    fromAmount?: string;
    toAmount?: string;
    executionDuration?: number;
    feeCosts?: LifiFeeLine[];
    gasCosts?: LifiFeeLine[];
  };
  action?: {
    fromAmount?: string;
    fromToken?: { symbol?: string; decimals?: number };
    toToken?: { symbol?: string; decimals?: number };
    fromChainId?: number;
    toChainId?: number;
    slippage?: number;
  };
};

export interface LifiNormalizedQuoteRoute {
  fromAmount?: string;
  toToken?: { symbol?: string };
  steps: LifiQuoteStepJson[];
}

export function normalizeLiFiQuotePayload(json: unknown): LifiNormalizedQuoteRoute {
  if (!json || typeof json !== "object") {
    throw new Error("LI.F.I returned an empty quote response.");
  }

  const o = json as Record<string, unknown>;
  const nestedSteps = o.steps;

  if (Array.isArray(nestedSteps) && nestedSteps.length > 0) {
    const steps = nestedSteps as LifiQuoteStepJson[];
    const fromAmountRaw = o.fromAmount;
    const fromAmount =
      typeof fromAmountRaw === "string"
        ? fromAmountRaw
        : (steps[0]?.action?.fromAmount ?? steps[0]?.estimate?.fromAmount ?? "0");
    const toTokenRaw = o.toToken;
    let toToken: { symbol?: string } | undefined;
    if (toTokenRaw && typeof toTokenRaw === "object" && toTokenRaw !== null) {
      toToken = toTokenRaw as { symbol?: string };
    }
    return { steps, fromAmount, toToken: toToken ?? steps[0]?.action?.toToken };
  }

  const step = json as LifiQuoteStepJson;
  const hasEstimate = step?.estimate != null && typeof step.estimate === "object";
  const hasAction = step?.action != null && typeof step.action === "object";
  if (!hasEstimate && !hasAction) {
    throw new Error("LI.F.I returned no executable step for this bridge request.");
  }
  const fromAmount = step.action?.fromAmount ?? step.estimate?.fromAmount ?? "0";
  return {
    steps: [step],
    fromAmount,
    toToken: step.action?.toToken,
  };
}

const LIFI_API_BASE = "https://li.quest/v1";

async function fetchQuoteJson(searchParams: Record<string, string>): Promise<object> {
  const url = new URL(`${LIFI_API_BASE}/quote`);
  const integrator = (import.meta.env.VITE_LIFI_INTEGRATOR as string | undefined) ?? "oishi";
  url.searchParams.set("integrator", integrator);
  Object.entries(searchParams).forEach(([k, v]) => {
    if (v !== undefined && v !== "") url.searchParams.set(k, v);
  });

  const res = await fetch(url.toString(), { headers: { Accept: "application/json" } });
  const body = await res.text();
  if (!res.ok) {
    let msg = body;
    try {
      const j = JSON.parse(body) as { message?: string };
      if (typeof j.message === "string" && j.message.length > 0) msg = j.message;
    } catch {
      /* not JSON */
    }
    throw new Error(msg);
  }
  return JSON.parse(body) as object;
}

// ── Chain IDs (Li.F.I format) ─────────────────────────────────────────
export const CHAIN_IDS = {
  ethereum: 1,
  arbitrum: 42161,
  base: 8453,
  solana: 1151111081099710,
} as const;

const NATIVE = "0x0000000000000000000000000000000000000000";

const TOKENS: Record<string, Record<string, string>> = {
  ethereum: {
    ETH: NATIVE,
    USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    USDT: "0xdAc17F958D2ee523a2206206994597C13D831ec7",
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

/** Li.F.I requires `fromAddress`; anonymous preview quotes use this placeholder. */
const PLACEHOLDER_EVM_FROM = "0x0000000000000000000000000000000000000001";

export function getChainId(chain: string): number {
  return CHAIN_IDS[chain as keyof typeof CHAIN_IDS] ?? CHAIN_IDS.arbitrum;
}

export function getTokenAddress(chain: string, token: string): string {
  const normalizedChain = chain.toLowerCase();
  const normalizedToken = token.toUpperCase();
  return TOKENS[normalizedChain]?.[normalizedToken] ?? NATIVE;
}

export interface LifiQuoteParams {
  fromChain: string;
  toChain: string;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  fromAddress?: string;
  toAddress?: string;
}

export interface LifiQuoteResult {
  route: LifiNormalizedQuoteRoute;
  receiveAmount: string;
  receiveToken: string;
  feeUsd: number;
  gasUsd: number;
  etaSec: number;
  steps: number;
}

function looksLikeEvmAddress(s: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(s.trim());
}

export async function getLifiQuote(params: LifiQuoteParams): Promise<LifiQuoteResult> {
  const fromChainId = getChainId(params.fromChain);
  const toChainId = getChainId(params.toChain);
  const fromTokenAddr = params.fromToken || getTokenAddress(params.fromChain, "ETH");
  const toTokenAddr = params.toToken || SOLANA_USDC;
  const toAddr = params.toAddress?.trim() ?? "";

  if (toChainId === CHAIN_IDS.solana) {
    if (!toAddr) {
      throw new Error(
        "A Solana recipient address is required. Connect your Phantom or Solflare wallet on this page.",
      );
    }
    if (looksLikeEvmAddress(toAddr)) {
      throw new Error(
        "Bridge to Solana needs a Solana wallet address — not your EVM (0x…) address.",
      );
    }
  }

  const fromAddressRaw = params.fromAddress?.trim() ?? "";
  const fromAddress = fromAddressRaw || PLACEHOLDER_EVM_FROM;

  const q: Record<string, string> = {
    fromChain: String(fromChainId),
    toChain: String(toChainId),
    fromToken: fromTokenAddr,
    toToken: toTokenAddr,
    fromAmount: params.fromAmount,
    fromAddress,
    order: "CHEAPEST",
  };
  if (toAddr) q.toAddress = toAddr;

  const payload = await fetchQuoteJson(q);
  const route = normalizeLiFiQuotePayload(payload);
  const step = route.steps[0];
  const estimate = step?.estimate;

  return {
    route,
    receiveAmount: estimate?.toAmount ?? "0",
    receiveToken: route.toToken?.symbol ?? step?.action?.toToken?.symbol ?? "USDC",
    feeUsd: Number(estimate?.feeCosts?.reduce((sum, f) => sum + Number(f.amountUSD ?? 0), 0) ?? 0),
    gasUsd: Number(estimate?.gasCosts?.reduce((sum, g) => sum + Number(g.amountUSD ?? 0), 0) ?? 0),
    etaSec: estimate?.executionDuration ?? 30,
    steps: route.steps.length,
  };
}

export function formatTokenAmount(amount: string, decimals: number): string {
  const num = Number(amount) / 10 ** decimals;
  if (num < 0.0001) return num.toExponential(2);
  return num >= 1 ? num.toFixed(4) : num.toFixed(6);
}

export function toWei(amount: number | string, decimals: number): string {
  const parsed = typeof amount === "string" ? parseFloat(amount) || 0 : amount;
  const amt = BigInt(Math.floor(parsed * 10 ** decimals));
  return amt.toString();
}

export const DECIMALS: Record<string, number> = {
  ETH: 18,
  USDC: 6,
  USDT: 6,
  SOL: 9,
};
