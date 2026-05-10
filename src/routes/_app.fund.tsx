import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { injected } from "wagmi/connectors";
import { arbitrum, base, mainnet } from "wagmi/chains";
import { AppPage } from "@/components/app-page";
import {
  IconArbitrum,
  IconBase,
  IconEthereum,
  IconLifi,
  IconSolana,
  IconUSDC,
  IconUSDT,
} from "@/components/bridge/crypto-icons";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useOishiBackend } from "@/hooks/use-oishi-backend";
import { useSolanaTx } from "@/hooks/use-solana-tx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLifiQuote, getTokenAddress, toWei, DECIMALS, type LifiQuoteResult } from "@/lib/lifi";
import { ArrowRight, Check, ChevronRight, Loader2, AlertTriangle, RefreshCw, CheckCircle2, Send, ExternalLink } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

export const Route = createFileRoute("/_app/fund")({
  head: () => ({
    meta: [
      { title: "Fund agent — Oishi" },
      {
        name: "description",
        content: "Send SOL or bridge from EVM chains to your agent wallet via LI.FI.",
      },
    ],
  }),
  component: FundPage,
});

type ChainId = "arbitrum" | "ethereum" | "base";
type TokenId = "eth" | "usdc" | "usdt";

type AnyIcon = (props: { className?: string }) => ReactNode;

const CHAINS: { id: ChainId; name: string; Icon: AnyIcon }[] = [
  { id: "arbitrum", name: "Arbitrum", Icon: IconArbitrum },
  { id: "ethereum", name: "Ethereum", Icon: IconEthereum },
  { id: "base", name: "Base", Icon: IconBase },
];

const TOKENS_BY_CHAIN: Record<ChainId, { id: TokenId; label: string; Icon: AnyIcon }[]> = {
  arbitrum: [
    { id: "eth", label: "ETH", Icon: IconEthereum },
    { id: "usdc", label: "USDC", Icon: IconUSDC },
    { id: "usdt", label: "USDT", Icon: IconUSDT },
  ],
  ethereum: [
    { id: "eth", label: "ETH", Icon: IconEthereum },
    { id: "usdc", label: "USDC", Icon: IconUSDC },
    { id: "usdt", label: "USDT", Icon: IconUSDT },
  ],
  base: [
    { id: "eth", label: "ETH", Icon: IconEthereum },
    { id: "usdc", label: "USDC", Icon: IconUSDC },
  ],
};

const BRIDGE_STEPS = [
  "Route locked with LI.FI",
  "Confirming on source chain",
  "Cross-chain relay active",
  "Crediting agent on Solana",
] as const;

type BridgePhase = "idle" | "quoting" | "bridging" | "success";

const sourceSelectTriggerClass =
  "h-11 w-full rounded-2xl border border-border bg-card px-3 shadow-none " +
  "focus:outline-none focus:ring-2 focus:ring-ring/25 focus:ring-offset-0";

function formatSendAmount(n: number, symbol: string) {
  if (symbol === "ETH") {
    if (n < 0.0001) return n.toExponential(2);
    return n >= 1 ? n.toFixed(4) : n.toFixed(5);
  }
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

import type { BackendAgent } from "@/lib/oishi-api";

function solanaExplorerTxUrl(signature: string, rpcEndpoint: string): string {
  const ep = rpcEndpoint.toLowerCase();
  const enc = encodeURIComponent(signature);
  if (ep.includes("devnet")) {
    return `https://explorer.solana.com/tx/${enc}?cluster=devnet`;
  }
  if (ep.includes("testnet")) {
    return `https://explorer.solana.com/tx/${enc}?cluster=testnet`;
  }
  return `https://explorer.solana.com/tx/${enc}`;
}

function solanaExplorerAddressUrl(address: string, rpcEndpoint: string): string {
  const ep = rpcEndpoint.toLowerCase();
  const enc = encodeURIComponent(address);
  if (ep.includes("devnet")) {
    return `https://explorer.solana.com/address/${enc}?cluster=devnet`;
  }
  if (ep.includes("testnet")) {
    return `https://explorer.solana.com/address/${enc}?cluster=testnet`;
  }
  return `https://explorer.solana.com/address/${enc}`;
}

function SolDirectFundPanel({ agent }: { agent: BackendAgent }) {
  const agentId = agent.id;
  const { signAndSend, ready: txReady } = useSolanaTx();
  const { api, isReady: backendReady } = useOishiBackend();
  const { connected } = useWallet();
  const { connection } = useConnection();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [txSig, setTxSig] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: agentBalance } = useQuery({
    queryKey: ["oishi", "agent-balance", agentId],
    queryFn: async () => {
      if (!api) return null;
      return api.getAgentBalance(agentId);
    },
    enabled: backendReady && !!api && !!connected,
    staleTime: 10_000,
  });

  const handleFund = async () => {
    if (!api || !backendReady) return;
    const sol = parseFloat(amount);
    if (!sol || sol < 0.001) {
      setError("Min 0.001 SOL");
      return;
    }

    setLoading(true);
    setError(null);
    setTxSig(null);

    try {
      const { transaction } = await api.fundAgent(agentId, sol);
      const { signature } = await signAndSend(transaction);
      setTxSig(signature);
      setAmount("");
      queryClient.invalidateQueries({ queryKey: ["oishi", "agent-balance", agentId] });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-3xl bg-card border border-border p-6 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium">Send SOL</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            From your connected Solana wallet to this agent&apos;s custodial Solana wallet. Sign one
            transfer in Phantom or Solflare.
          </p>
        </div>
        {agentBalance ? (
          <span className="text-xs text-muted-foreground tabular shrink-0">
            {agentBalance.sol.toFixed(4)} SOL
          </span>
        ) : null}
      </div>

      <div className="flex justify-stretch [&_.wallet-adapter-button-trigger]:!w-full [&_.wallet-adapter-button-trigger]:!justify-center [&_.wallet-adapter-button-trigger]:!rounded-2xl [&_.wallet-adapter-button-trigger]:!bg-secondary [&_.wallet-adapter-button-trigger]:!text-foreground [&_.wallet-adapter-button-trigger]:border [&_.wallet-adapter-button-trigger]:border-border">
        <WalletMultiButton />
      </div>

      <div className="flex gap-2">
        <input
          type="number"
          inputMode="decimal"
          placeholder="0.01"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            setError(null);
            setTxSig(null);
          }}
          disabled={loading}
          className="flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/25"
        />
        <span className="flex items-center text-sm text-muted-foreground font-medium">SOL</span>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["0.01", "0.05", "0.1", "0.5"].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => {
              setAmount(v);
              setError(null);
            }}
            disabled={loading}
            className="px-3 py-1 rounded-full text-xs border border-border bg-secondary hover:bg-secondary/80 transition-colors disabled:opacity-50"
          >
            {v}
          </button>
        ))}
      </div>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      {txSig ? (
        <a
          href={solanaExplorerTxUrl(txSig, connection.rpcEndpoint)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-success hover:underline"
        >
          <CheckCircle2 className="size-3.5" />
          {txSig.slice(0, 8)}… <ExternalLink className="size-3" />
        </a>
      ) : null}

      <button
        type="button"
        disabled={!connected || !txReady || !amount || loading}
        onClick={handleFund}
        className="w-full rounded-full bg-ink text-ink-foreground py-3 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity"
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        {loading ? "Sending…" : "Send SOL to agent"}
      </button>
    </section>
  );
}

// ── Debounce helper ───────────────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function FundPage() {
  const navigate = useNavigate();

  const { api, isReady: backendReady } = useOishiBackend();
  const { data: agents = [], isLoading: agentsLoading } = useQuery({
    queryKey: ["oishi", "fund-page-agents"],
    queryFn: async () => {
      if (!api) return [] as BackendAgent[];
      return api.listAgents();
    },
    enabled: backendReady && !!api,
    staleTime: 10_000,
  });

  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  useEffect(() => {
    if (!agents.length) {
      setSelectedAgentId(null);
      return;
    }
    setSelectedAgentId((prev) =>
      prev && agents.some((a) => a.id === prev) ? prev : agents[0].id,
    );
  }, [agents]);

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) ?? null;
  const agentDepositAddress =
    selectedAgent?.walletPublicKey && selectedAgent.walletPublicKey.length > 0
      ? selectedAgent.walletPublicKey
      : null;

  const [amount, setAmount] = useState("500");
  const [chainId, setChainId] = useState<ChainId>("arbitrum");
  const [tokenId, setTokenId] = useState<TokenId>("eth");
  const [phase, setPhase] = useState<BridgePhase>("idle");
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);

  // ── EVM wallet ──────────────────────────────────────────────────
  const { address: evmAddress, isConnected: evmConnected, chainId: evmChainId } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const chainToWagmi: Record<ChainId, typeof arbitrum | typeof mainnet | typeof base> = {
    arbitrum,
    ethereum: mainnet,
    base,
  };

  // ── Real LI.FI quote state ──────────────────────────────────────
  const [lifiQuote, setLifiQuote] = useState<LifiQuoteResult | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  const quotingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bridgeTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const tokens = TOKENS_BY_CHAIN[chainId];
  const tokenMeta = tokens.find((t) => t.id === tokenId) ?? tokens[0];
  const chainMeta = CHAINS.find((c) => c.id === chainId)!;
  const ChainIcon = chainMeta.Icon;
  const TokenIcon = tokenMeta.Icon;

  const receiveUsdc = Math.max(0, parseFloat(amount.replace(/,/g, "")) || 0);
  const debouncedAmount = useDebounce(amount, 600);
  const interactive = phase === "idle";

  // ── Sync token to available tokens on chain change ──────────────────
  useEffect(() => {
    if (!tokens.some((t) => t.id === tokenId)) {
      setTokenId(tokens[0].id);
    }
  }, [chainId, tokenId, tokens]);

  // ── Fetch real LI.FI quote ─────────────────────────────────────────
  const fetchQuote = useCallback(async () => {
    const num = parseFloat(debouncedAmount.replace(/,/g, "")) || 0;
    if (num <= 0) {
      setLifiQuote(null);
      setQuoteError(null);
      return;
    }

    if (!agentDepositAddress) {
      setLifiQuote(null);
      setQuoteError(null);
      setQuoteLoading(false);
      return;
    }

    // Cancel previous request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setQuoteLoading(true);
    setQuoteError(null);

    try {
      const tokenAddr = getTokenAddress(chainId, tokenId);
      const decimals = DECIMALS[tokenMeta.label] ?? 18;
      const weiAmount = toWei(num, decimals);

      const result = await getLifiQuote({
        fromChain: chainId,
        toChain: "solana",
        fromToken: tokenAddr,
        toToken: "",
        fromAmount: weiAmount,
        fromAddress: evmAddress ?? "",
        toAddress: agentDepositAddress,
      });

      if (!controller.signal.aborted) {
        setLifiQuote(result);
        setQuoteError(null);
      }
    } catch (err: unknown) {
      if (!controller.signal.aborted) {
        const message = err instanceof Error ? err.message : "Failed to fetch quote";
        setQuoteError(message);
        setLifiQuote(null);
      }
    } finally {
      if (!controller.signal.aborted) {
        setQuoteLoading(false);
      }
    }
  }, [debouncedAmount, chainId, tokenId, tokenMeta.label, evmAddress, agentDepositAddress]);

  useEffect(() => {
    if (phase === "idle") {
      fetchQuote();
    }
    return () => abortRef.current?.abort();
  }, [fetchQuote, phase]);

  // ── Derived quote data ──────────────────────────────────────────────
  const sendSymbol = tokenMeta.label;
  const sendAmount = lifiQuote
    ? Number(
        lifiQuote.route.fromAmount ??
          lifiQuote.route.steps[0]?.action?.fromAmount ??
          lifiQuote.route.steps[0]?.estimate?.fromAmount ??
          "0",
      ) /
      10 ** (DECIMALS[sendSymbol] ?? 18)
    : 0;
  const receiveLabel = lifiQuote?.receiveToken ?? "USDC";
  const receiveFormatted = lifiQuote ? Number(lifiQuote.receiveAmount) / 10 ** 6 : receiveUsdc;
  const totalFeeUsd = lifiQuote ? lifiQuote.feeUsd + lifiQuote.gasUsd : null;
  const etaSec = lifiQuote?.etaSec ?? null;
  const routeSteps = lifiQuote?.steps ?? null;

  // ── Cleanup timers ──────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (quotingTimer.current) clearTimeout(quotingTimer.current);
      bridgeTimers.current.forEach(clearTimeout);
      abortRef.current?.abort();
    };
  }, []);

  // ── Bridge animation (simulated execution) ──────────────────────────
  useEffect(() => {
    bridgeTimers.current.forEach(clearTimeout);
    bridgeTimers.current = [];
    if (phase !== "bridging") return;

    setProgress(8);
    setStepIndex(0);

    const schedule = (delay: number, fn: () => void) => {
      const id = setTimeout(fn, delay);
      bridgeTimers.current.push(id);
    };

    schedule(500, () => {
      setProgress(28);
      setStepIndex(1);
    });
    schedule(1900, () => {
      setProgress(55);
      setStepIndex(2);
    });
    schedule(3600, () => {
      setProgress(78);
      setStepIndex(3);
    });
    schedule(5200, () => {
      setProgress(100);
      setStepIndex(3);
    });
    schedule(5600, () => setPhase("success"));
  }, [phase]);

  function startBridge() {
    if (!receiveUsdc || phase !== "idle") return;
    if (!lifiQuote) {
      setQuoteError("Please wait for the quote to load before bridging");
      return;
    }
    setPhase("quoting");
    quotingTimer.current = setTimeout(() => {
      setPhase("bridging");
    }, 1100);
  }

  function resetFlow() {
    if (quotingTimer.current) clearTimeout(quotingTimer.current);
    bridgeTimers.current.forEach(clearTimeout);
    bridgeTimers.current = [];
    setPhase("idle");
    setProgress(0);
    setStepIndex(0);
    setQuoteError(null);
  }

  function retryQuote() {
    setQuoteError(null);
    fetchQuote();
  }

  // ── Derived quote display data ──────────────────────────────────────
  const quoteSendText = lifiQuote
    ? `${formatSendAmount(sendAmount, sendSymbol)} ${sendSymbol}`
    : quoteLoading
      ? "Fetching…"
      : "—";

  const quoteReceiveText = lifiQuote
    ? `${receiveFormatted.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${receiveLabel}`
    : "—";

  const quoteFeeText = lifiQuote ? `~$${totalFeeUsd!.toFixed(2)}` : quoteLoading ? "—" : "—";

  const quoteEtaText = lifiQuote
    ? etaSec! < 60
      ? `~${etaSec}s`
      : `~${Math.ceil(etaSec! / 60)}m`
    : "—";

  const quoteStepText = routeSteps ? `${routeSteps} step${routeSteps > 1 ? "s" : ""}` : "—";

  const { connection } = useConnection();

  return (
    <AppPage subtitle="SOL or cross-chain" title="Fund agent">
      <p className="text-sm text-muted-foreground mt-1 mb-6">
        Pick which agent receives the deposit. Send SOL directly from Phantom, or bridge from another chain
        with LI.FI into that agent&apos;s custodial Solana wallet.
      </p>

      {!backendReady ? (
        <p className="text-sm text-muted-foreground text-center py-12">Connect and sign in to load your agents.</p>
      ) : agentsLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : !agents.length ? (
        <section className="rounded-3xl bg-card border border-border p-8 text-center">
          <p className="text-sm font-medium">No agents yet</p>
          <p className="text-xs text-muted-foreground mt-2 mb-6 max-w-xs mx-auto leading-relaxed">
            Launch an agent first. Deposits always go to that agent&apos;s dedicated Solana wallet.
          </p>
          <Link
            to="/launch"
            search={{ tab: "new" }}
            className="inline-flex rounded-full bg-ink text-ink-foreground px-6 py-3 text-sm font-medium"
          >
            Launch an agent
          </Link>
        </section>
      ) : selectedAgent ? (
        <>
          <section className="rounded-3xl bg-card border border-border p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">Deposit to</p>
            {agents.length > 1 ? (
              <Select value={selectedAgentId!} onValueChange={(id) => setSelectedAgentId(id)}>
                <SelectTrigger className={sourceSelectTriggerClass}>
                  <SelectValue placeholder="Choose agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((a) => (
                    <SelectItem key={a.id} value={a.id} className="py-3">
                      <span className="flex flex-col gap-0.5 text-left">
                        <span className="font-medium">{a.displayName}</span>
                        <span className="text-[11px] text-muted-foreground font-mono">{a.handle}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div>
                <p className="font-medium">{selectedAgent.displayName}</p>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">{selectedAgent.handle}</p>
              </div>
            )}
            {agentDepositAddress ? (
              <a
                href={solanaExplorerAddressUrl(agentDepositAddress, connection.rpcEndpoint)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground hover:underline max-w-full"
              >
                <span className="truncate">
                  {agentDepositAddress.slice(0, 10)}…{agentDepositAddress.slice(-8)}
                </span>
                <ExternalLink className="size-3 shrink-0" />
              </a>
            ) : (
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-3 leading-relaxed">
                This agent has no custodial Solana pubkey on file yet.
              </p>
            )}
          </section>

          <Tabs defaultValue="sol" className="mt-4">
            <TabsList className="flex h-11 w-full gap-1 rounded-2xl bg-muted p-1">
              <TabsTrigger
                value="sol"
                className={cn(
                  "flex min-h-0 flex-1 basis-0 items-center justify-center rounded-xl px-2 py-2",
                  "text-center text-xs font-medium leading-tight sm:text-sm",
                )}
              >
                Solana (SOL)
              </TabsTrigger>
              <TabsTrigger
                value="bridge"
                className={cn(
                  "flex min-h-0 flex-1 basis-0 items-center justify-center rounded-xl px-2 py-2",
                  "text-center text-xs font-medium leading-tight sm:text-sm",
                )}
              >
                Cross-chain (LI.FI)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sol" className="mt-4 focus-visible:outline-none">
              <SolDirectFundPanel agent={selectedAgent} />
            </TabsContent>

            <TabsContent value="bridge" className="mt-4 space-y-4 focus-visible:outline-none">
              {/* ── Receive amount input ─────────────────────────────────── */}
              <section className="rounded-3xl bg-card border border-border p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Receive on Solana (USDC)
        </p>
        <input
          inputMode="decimal"
          value={amount}
          disabled={!interactive}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
          className="w-full mt-2 bg-transparent font-display text-6xl tabular outline-none disabled:opacity-50"
        />
        <div className="mt-4 flex gap-2 flex-wrap">
          {["100", "250", "500", "1000"].map((v) => (
            <button
              key={v}
              type="button"
              disabled={!interactive}
              onClick={() => setAmount(v)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                amount === v
                  ? "bg-ink text-ink-foreground border-ink"
                  : "bg-secondary text-foreground border-border",
                !interactive && "opacity-50 pointer-events-none",
              )}
            >
              ${v}
            </button>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Credit to (agent wallet)
          </p>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
            LI.FI settles on this agent-owned Solana address — not your personal wallet.
          </p>
          {agentDepositAddress ? (
            <p className="mt-3 text-[11px] font-mono text-muted-foreground text-center break-all px-1 leading-relaxed">
              {agentDepositAddress}
            </p>
          ) : (
            <p className="text-xs text-amber-600 dark:text-amber-500 text-center mt-3">
              Pick an agent with a valid wallet to load quotes.
            </p>
          )}
        </div>
      </section>

      {/* ── Source + Route ───────────────────────────────────────── */}
              <section className="rounded-3xl bg-card border border-border p-5 space-y-5">
        {/* ── EVM Wallet ────────────────────────────────────────── */}
        {interactive && (
          <div>
            <p className="text-sm font-medium mb-3">Source wallet</p>
            {evmConnected && evmAddress ? (
              <div className="flex items-center justify-between rounded-2xl bg-secondary px-4 py-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  {evmChainId === mainnet.id ? (
                    <IconEthereum className="size-5 shrink-0" />
                  ) : evmChainId === arbitrum.id ? (
                    <IconArbitrum className="size-5 shrink-0" />
                  ) : evmChainId === base.id ? (
                    <IconBase className="size-5 shrink-0" />
                  ) : (
                    <IconEthereum className="size-5 shrink-0" />
                  )}
                  <span className="text-sm font-mono truncate">
                    {evmAddress.slice(0, 6)}…{evmAddress.slice(-4)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => disconnect()}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() =>
                    connect({
                      connector: connectors.find((c) => c.id === "injected") ?? connectors[0],
                    })
                  }
                  className="w-full rounded-2xl border border-border bg-secondary px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 hover:bg-secondary/80 transition-colors"
                >
                  <IconEthereum className="size-4" />
                  Connect MetaMask / EVM wallet
                </button>
                {connectors.some((c) => c.id === "walletConnect") && (
                  <button
                    type="button"
                    onClick={() =>
                      connect({ connector: connectors.find((c) => c.id === "walletConnect")! })
                    }
                    className="w-full rounded-2xl border border-border bg-secondary px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 hover:bg-secondary/80 transition-colors"
                  >
                    <img src="/images/walletconnect.svg" alt="WalletConnect" className="size-4" />
                    WalletConnect
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <div>
          <p className="text-sm font-medium mb-3">Source</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Chain
              </span>
              <Select
                disabled={!interactive}
                value={chainId}
                onValueChange={(v) => {
                  const c = v as ChainId;
                  setChainId(c);
                  const next = TOKENS_BY_CHAIN[c][0].id;
                  setTokenId(next);
                  setLifiQuote(null);
                }}
              >
                <SelectTrigger className={sourceSelectTriggerClass}>
                  <div className="flex min-w-0 flex-1 items-center text-left">
                    <SelectValue placeholder="Chain" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {CHAINS.map(({ id, name, Icon }) => (
                    <SelectItem key={id} value={id} className="py-2.5">
                      <span className="flex items-center gap-2.5 min-w-0">
                        <Icon className="size-5 shrink-0" />
                        <span className="truncate">{name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Token
              </span>
              <Select
                disabled={!interactive}
                value={tokenId}
                onValueChange={(v) => {
                  setTokenId(v as TokenId);
                  setLifiQuote(null);
                }}
              >
                <SelectTrigger className={sourceSelectTriggerClass}>
                  <div className="flex min-w-0 flex-1 items-center text-left">
                    <SelectValue placeholder="Token" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {tokens.map(({ id, label, Icon }) => (
                    <SelectItem key={id} value={id} className="py-2.5">
                      <span className="flex items-center gap-2.5 min-w-0">
                        <Icon className="size-5 shrink-0" />
                        <span className="truncate">{label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* ── Route visualization ────────────────────────────────── */}
        <div>
          <p className="text-sm font-medium mb-3">Route</p>
          <div className="flex items-stretch justify-between gap-1 sm:gap-2">
            <RouteLeg
              icon={
                <RouteTokenPair
                  left={<ChainIcon className="size-[22px]" />}
                  right={<TokenIcon className="size-[22px]" />}
                />
              }
              label={chainMeta.name}
              sub={tokenMeta.label}
            />
            <FlowArrow />
            <RouteLeg
              icon={<IconLifi className="size-7" />}
              label="LI.FI"
              sub={quoteStepText}
              compact
            />
            <FlowArrow />
            <RouteLeg
              highlight
              icon={
                <RouteTokenPair
                  variant="accent"
                  left={<IconSolana className="size-[22px]" />}
                  right={<IconUSDC className="size-[22px]" />}
                />
              }
              label="Solana"
              sub={receiveLabel}
            />
          </div>
        </div>

        {/* ── Error banner ───────────────────────────────────────── */}
        {quoteError && phase === "idle" && (
          <div className="flex items-start gap-3 rounded-2xl bg-destructive/10 border border-destructive/30 px-4 py-3">
            <AlertTriangle className="size-4 shrink-0 text-destructive mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-destructive">Could not load bridge quote</p>
              <p className="text-xs text-destructive/80 mt-0.5 line-clamp-2">{quoteError}</p>
            </div>
            <button
              type="button"
              onClick={retryQuote}
              className="shrink-0 text-destructive hover:text-destructive/80 transition-colors"
            >
              <RefreshCw className="size-4" />
            </button>
          </div>
        )}

        {/* ── Quote details ──────────────────────────────────────── */}
        <ul className="space-y-2 text-sm pt-1">
          <Row k="You send" v={quoteSendText} bold loading={quoteLoading} />
          <Row k="Estimated time" v={quoteEtaText} loading={quoteLoading} />
          <Row k="Network + bridge fee" v={quoteFeeText} loading={quoteLoading} />
          <Row k="You receive" v={quoteReceiveText} bold loading={quoteLoading} />
          {lifiQuote && (
            <Row
              k="Provider"
              v={
                lifiQuote.route.steps[0]?.toolDetails?.name ??
                lifiQuote.route.steps[0]?.tool ??
                "LI.F.I"
              }
            />
          )}
        </ul>

        {/* ── Bridge progress ────────────────────────────────────── */}
        {(phase === "bridging" || phase === "success") && (
          <div className="pt-2 border-t border-border space-y-3" aria-live="polite">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                {phase === "success" ? "Bridge complete" : "Bridge in progress"}
              </span>
              <span className="text-xs tabular text-muted-foreground">{progress}%</span>
            </div>
            <Progress className="h-2 bg-secondary" value={progress} />
            <ol className="space-y-1.5">
              {BRIDGE_STEPS.map((label, i) => {
                const complete = phase === "success" || i < stepIndex;
                const inProgress = phase === "bridging" && i === stepIndex;
                return (
                  <li
                    key={label}
                    className={cn(
                      "flex items-center gap-2 text-xs transition-colors",
                      complete
                        ? "text-success"
                        : inProgress
                          ? "text-foreground font-medium"
                          : "text-muted-foreground",
                    )}
                  >
                    {complete ? (
                      <Check className="size-3.5 shrink-0 text-success" strokeWidth={2.5} />
                    ) : inProgress ? (
                      <Loader2 className="size-3.5 shrink-0 animate-spin" />
                    ) : (
                      <span className="size-3.5 shrink-0 rounded-full border border-border" />
                    )}
                    {label}
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </section>

      {/* ── Action button ────────────────────────────────────────── */}
      {phase === "success" ? (
        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={() => navigate({ to: "/activity" })}
            className="w-full rounded-full bg-ink text-ink-foreground py-4 font-medium inline-flex items-center justify-center gap-2"
          >
            <Check className="size-4" /> View in activity
          </button>
          <button
            type="button"
            onClick={resetFlow}
            className="w-full rounded-full border border-border bg-background py-3.5 text-sm font-medium text-foreground"
          >
            Bridge again
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={
            !receiveUsdc ||
            !agentDepositAddress ||
            (phase !== "idle" && phase !== "quoting") ||
            (!lifiQuote && !quoteLoading)
          }
          onClick={() => (phase === "idle" ? startBridge() : undefined)}
          className="mt-6 w-full rounded-full bg-ink text-ink-foreground py-4 font-medium inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
        >
          {phase === "quoting" ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Locking route…
            </>
          ) : phase === "bridging" ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Bridging…
            </>
          ) : quoteLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Loading quote…
            </>
          ) : (
            <>
              <ChevronRight className="size-4" />
              Review &amp; bridge
            </>
          )}
        </button>
      )}

      {/* ── LI.FI attribution ────────────────────────────────────── */}
              <p className="mt-4 text-center text-[10px] text-muted-foreground px-2">
                Routes powered by <span className="font-medium text-foreground/70">LI.FI</span> · Quotes
                update live · Bridge execution simulated in demo
              </p>
            </TabsContent>
          </Tabs>
        </>
      ) : null}
    </AppPage>
  );
}

// ── Sub-components ─────────────────────────────────────────────────
function FlowArrow() {
  return (
    <div className="flex flex-col items-center justify-center shrink-0 px-0.5 text-muted-foreground self-center">
      <ArrowRight className="size-4" strokeWidth={2} />
    </div>
  );
}

function RouteTokenPair({
  left,
  right,
  variant = "default",
}: {
  left: ReactNode;
  right: ReactNode;
  variant?: "default" | "accent";
}) {
  const ring = variant === "accent" ? "ring-2 ring-white/45" : "ring-2 ring-border/60";
  const well = variant === "accent" ? "bg-white/20 shadow-sm" : "bg-card shadow-sm";

  return (
    <div className="flex w-full justify-center">
      <div className="flex items-center justify-center">
        <span
          className={cn(
            "inline-flex size-8 items-center justify-center rounded-full",
            well,
            ring,
            "relative z-10",
          )}
        >
          {left}
        </span>
        <span
          className={cn(
            "-ml-3 inline-flex size-8 items-center justify-center rounded-full",
            well,
            ring,
            "relative z-20",
          )}
        >
          {right}
        </span>
      </div>
    </div>
  );
}

function RouteLeg({
  icon,
  label,
  sub,
  highlight,
  compact,
}: {
  icon: ReactNode;
  label: string;
  sub: string;
  highlight?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex-1 min-w-0 rounded-2xl px-2 py-3 flex flex-col items-stretch justify-center gap-2 text-center border border-transparent",
        highlight ? "bg-accent text-accent-foreground shadow-sm" : "bg-secondary text-foreground",
        compact && "py-2.5",
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-full justify-center",
          compact ? "min-h-[2.25rem] items-center" : "min-h-10 items-center",
        )}
      >
        <div
          className={cn(!compact && "flex w-full justify-center", compact && "flex justify-center")}
        >
          {icon}
        </div>
      </div>
      <div className={cn("w-full px-0.5", compact ? "leading-tight" : "")}>
        <p className="text-[11px] font-semibold leading-tight truncate">{label}</p>
        <p className="text-[9px] uppercase tracking-widest opacity-75 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

function Row({ k, v, bold, loading }: { k: string; v: string; bold?: boolean; loading?: boolean }) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{k}</span>
      <span className={cn("tabular text-right", bold && "font-medium")}>
        {loading ? (
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Loader2 className="size-3 animate-spin" />
          </span>
        ) : (
          v
        )}
      </span>
    </li>
  );
}
