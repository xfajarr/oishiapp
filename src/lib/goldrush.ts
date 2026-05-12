import { GoldRushClient } from "@covalenthq/client-sdk";

const API_KEY = import.meta.env.VITE_GOLDRUSH_API_KEY;

function getClient(): GoldRushClient {
  if (!API_KEY) {
    console.warn("[GoldRush] No API key set");
    return new GoldRushClient("placeholder");
  }
  return new GoldRushClient(API_KEY);
}

export interface GoldRushTokenBalance {
  ticker: string;
  contractName: string;
  balance: number;
  usdValue: number;
  usdPrice: number;
  contractAddress: string;
  chain: string;
}

export interface GoldRushTransfer {
  from: string;
  to: string;
  ticker: string;
  delta: string;
}

export interface GoldRushTransaction {
  txHash: string;
  blockHeight: number;
  blockSignedAt: string;
  successful: boolean;
  fromAddress: string;
  toAddress: string;
  valueQuote: number;
  gasQuote: number;
  transfers: GoldRushTransfer[];
}

const SOLANA_CHAIN = "solana-mainnet";

/**
 * Fetch all token balances for a Solana wallet via GoldRush.
 * Filters spam and sub-$0.01 dust.
 */
export async function getAgentBalances(address: string): Promise<GoldRushTokenBalance[]> {
  if (!API_KEY) return [];

  try {
    const client = getClient();
    const resp = await client.BalanceService.getTokenBalancesForWalletAddress(
      SOLANA_CHAIN,
      address,
    );

    if (resp.error || !resp.data) {
      return [];
    }

    return (resp.data.items ?? [])
      .filter((item) => !item.is_spam)
      .filter((item) => {
        const q = item.quote;
        return q !== null && q !== undefined && Number(q) > 0.01;
      })
      .map((item) => ({
        ticker: item.contract_ticker_symbol ?? "???",
        contractName: item.contract_name ?? "Unknown",
        balance:
          parseFloat(String(item.balance ?? "0")) / Math.pow(10, item.contract_decimals ?? 0),
        usdValue: Number(item.quote ?? 0),
        usdPrice: Number(item.quote_rate ?? 0),
        contractAddress: item.contract_address ?? "",
        chain: "Solana",
      }));
  } catch (err) {
    console.error("[GoldRush] balance fetch failed:", err);
    return [];
  }
}

/**
 * Fetch recent decoded transactions via GoldRush (single page).
 */
export async function getAgentTransactions(address: string): Promise<GoldRushTransaction[]> {
  if (!API_KEY) return [];

  try {
    const client = getClient();
    const resp = await client.TransactionService.getAllTransactionsForAddressByPage(
      SOLANA_CHAIN,
      address,
    );

    if (resp.error || !resp.data) {
      return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (resp.data.items ?? []).slice(0, 20).map((tx: any) => ({
      txHash: tx.tx_hash ?? "",
      blockHeight: tx.block_height ?? 0,
      blockSignedAt: tx.block_signed_at ?? "",
      successful: tx.successful ?? false,
      fromAddress: tx.from_address ?? "",
      toAddress: tx.to_address ?? "",
      valueQuote: Number(tx.value_quote ?? 0),
      gasQuote: Number(tx.gas_quote ?? 0),
      transfers: (tx.transfers ?? []).map(
        (t: {
          from_address: string;
          to_address: string;
          contract_ticker_symbol: string;
          delta: string;
        }) => ({
          from: t.from_address ?? "",
          to: t.to_address ?? "",
          ticker: t.contract_ticker_symbol ?? "",
          delta: t.delta ?? "0",
        }),
      ),
    }));
  } catch (err) {
    console.error("[GoldRush] tx fetch failed:", err);
    return [];
  }
}

/** Sum token USD values. */
export function totalPortfolioValue(balances: GoldRushTokenBalance[]): number {
  return balances.reduce((sum, b) => sum + b.usdValue, 0);
}
