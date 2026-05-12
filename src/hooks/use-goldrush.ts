import { useQuery } from "@tanstack/react-query";
import {
  getAgentBalances,
  getAgentTransactions,
  totalPortfolioValue,
  type GoldRushTokenBalance,
  type GoldRushTransaction,
} from "@/lib/goldrush";

/**
 * Fetch token balances via GoldRush for a Solana wallet address.
 * Gracefully returns empty array when no API key or on devnet.
 */
export function useGoldRushBalances(address: string | null | undefined) {
  return useQuery({
    queryKey: ["goldrush", "balances", address],
    queryFn: async (): Promise<GoldRushTokenBalance[]> => {
      if (!address) return [];
      return getAgentBalances(address);
    },
    enabled: !!address,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

/**
 * Fetch decoded transaction history via GoldRush.
 */
export function useGoldRushTransactions(address: string | null | undefined) {
  return useQuery({
    queryKey: ["goldrush", "txs", address],
    queryFn: async (): Promise<GoldRushTransaction[]> => {
      if (!address) return [];
      return getAgentTransactions(address);
    },
    enabled: !!address,
    staleTime: 20_000,
    refetchInterval: 60_000,
  });
}

/**
 * Convenience hook: total portfolio value in USD.
 */
export function useGoldRushPortfolioValue(address: string | null | undefined) {
  const { data: balances, isLoading } = useGoldRushBalances(address);
  return {
    totalUsd: balances ? totalPortfolioValue(balances) : 0,
    balances: balances ?? [],
    isLoading,
    isEmpty: balances !== undefined && balances.length === 0,
  };
}
