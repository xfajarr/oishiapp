import type { ConfirmedSignatureInfo } from "@solana/web3.js";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { LayoutGroup } from "framer-motion";
import {
  ArrowUpRight,
  Bot,
  CircleCheck,
  CircleX,
  ExternalLink,
  Play,
  Pause,
  Square,
  Sparkles,
  Wallet,
  Clock,
  Zap,
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { AppPage } from "@/components/app-page";
import { TabPillBg } from "@/components/tab-pill-bg";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRecentTransactions, useAgentByOwner } from "@/hooks/use-solana-data";
import { useOishiBackend } from "@/hooks/use-oishi-backend";
import type { BackendAgent, AgentDecision, AgentContext, AgentBalance } from "@/lib/oishi-api";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const SOLSCAN_BASE = "https://solscan.io/tx/";
const POLL_INTERVAL = 15_000; // 15s

function solscanTxUrl(signature: string): string {
  const cluster = import.meta.env.VITE_SOLANA_NETWORK === "mainnet-beta" ? "" : "?cluster=devnet";
  return `${SOLSCAN_BASE}${signature}${cluster}`;
}

// ── Decision icon ────────────────────────────────────────────────────────
function DecisionStatusIcon({ status }: { status: AgentDecision["status"] }) {
  const cls =
    status === "executed"
      ? "bg-success/20 text-success-foreground border border-success/30"
      : status === "blocked"
        ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/25"
        : "bg-destructive/20 text-destructive-foreground border border-destructive/30";
  const Ico = status === "executed" ? CircleCheck : status === "blocked" ? ShieldAlert : CircleX;
  return (
    <span className={cn("size-10 rounded-full shrink-0 flex items-center justify-center", cls)}>
      <Ico className="size-5" strokeWidth={2.1} aria-hidden />
    </span>
  );
}

// ── Agent status helpers ─────────────────────────────────────────────────
function statusBadgeVariant(
  status: BackendAgent["status"],
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "active":
      return "default";
    case "paused":
      return "secondary";
    case "stopped":
    case "blocked":
      return "destructive";
    default:
      return "outline";
  }
}

function statusLabel(status: BackendAgent["status"]): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function statusColor(status: BackendAgent["status"]): string {
  switch (status) {
    case "active":
      return "bg-success";
    case "paused":
      return "bg-amber-500";
    case "stopped":
    case "blocked":
      return "bg-destructive";
    default:
      return "bg-muted-foreground";
  }
}

// ── Action label helper ──────────────────────────────────────────────────
function actionLabel(action: string): string {
  return action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Route definition ─────────────────────────────────────────────────────
export const Route = createFileRoute("/_app/activity")({
  head: () => ({
    meta: [
      { title: "Activity — Oishi" },
      {
        name: "description",
        content: "Agent decision log plus on-chain activity from your connected Solana wallet.",
      },
    ],
  }),
  component: ActivityPage,
});

function ActivityPage() {
  const { publicKey, connected } = useWallet();
  const { data: txs, isLoading: txsLoading } = useRecentTransactions(publicKey ?? null, 20);
  const { data: agent, isLoading: agentLoading } = useAgentByOwner(publicKey ?? null);
  const hasOnChainAgent = !!agent;
  const [activityTab, setActivityTab] = useState("agent-log");

  // ── Backend agent data ────────────────────────────────────────────────
  const { api } = useOishiBackend();
  const [agents, setAgents] = useState<BackendAgent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [backendAgent, setBackendAgent] = useState<BackendAgent | null>(null);
  const [balance, setBalance] = useState<AgentBalance | null>(null);
  const [decisions, setDecisions] = useState<AgentDecision[]>([]);
  const [context, setContext] = useState<AgentContext | null>(null);
  const [loadingBackend, setLoadingBackend] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);

  const hasAgent = hasOnChainAgent || !!backendAgent;

  const fetchAgentData = useCallback(async () => {
    if (!api) return;
    setLoadingBackend(true);
    setBackendError(null);
    try {
      const agentList = await api.listAgents();
      setAgents(agentList);
      // Auto-select first agent if none selected or selected no longer exists
      const targetId =
        selectedAgentId && agentList.some((a) => a.id === selectedAgentId)
          ? selectedAgentId
          : (agentList[0]?.id ?? null);
      if (targetId) {
        setSelectedAgentId(targetId);
        const ag = agentList.find((a) => a.id === targetId) ?? null;
        setBackendAgent(ag);
        if (ag) {
          const [bal, decRes, ctx] = await Promise.all([
            api.getAgentBalance(ag.id).catch(() => null),
            api.getAgentDecisions(ag.id, 50),
            api.getAgentContext(ag.id).catch(() => null),
          ]);
          setBalance(bal);
          setDecisions(decRes.decisions ?? []);
          setContext(ctx);
        }
      } else {
        setSelectedAgentId(null);
        setBackendAgent(null);
        setDecisions([]);
        setContext(null);
      }
    } catch (err) {
      setBackendError(err instanceof Error ? err.message : "Failed to load agent data");
    } finally {
      setLoadingBackend(false);
    }
  }, [api, selectedAgentId]);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchAgentData();
    if (api) {
      pollRef.current = setInterval(fetchAgentData, POLL_INTERVAL);
    }
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [fetchAgentData, api]);

  // ── Agent lifecycle actions ───────────────────────────────────────────
  const doPause = useCallback(async () => {
    if (!api || !backendAgent) return;
    setActionLoading("pause");
    try {
      const updated = await api.pauseAgent(backendAgent.id);
      setBackendAgent(updated);
    } catch (err) {
      setBackendError(err instanceof Error ? err.message : "Pause failed");
    } finally {
      setActionLoading(null);
    }
  }, [api, backendAgent]);

  const doResume = useCallback(async () => {
    if (!api || !backendAgent) return;
    setActionLoading("resume");
    try {
      const updated = await api.resumeAgent(backendAgent.id);
      setBackendAgent(updated);
    } catch (err) {
      setBackendError(err instanceof Error ? err.message : "Resume failed");
    } finally {
      setActionLoading(null);
    }
  }, [api, backendAgent]);

  const doStop = useCallback(async () => {
    if (!api || !backendAgent) return;
    setActionLoading("stop");
    try {
      await api.stopAgent(backendAgent.id);
      setBackendAgent((prev) => (prev ? { ...prev, status: "stopped" } : null));
    } catch (err) {
      setBackendError(err instanceof Error ? err.message : "Stop failed");
    } finally {
      setActionLoading(null);
    }
  }, [api, backendAgent]);

  // ── Loading / empty states ────────────────────────────────────────────
  if (!connected) {
    return (
      <AppPage subtitle="agent trail & chain" title="Activity">
        <section className="mt-12 text-center">
          <div className="mx-auto size-16 rounded-full bg-secondary flex items-center justify-center">
            <Wallet className="size-7 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-lg font-semibold">Connect your wallet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect to see your agent log and Solana txs.
          </p>
          <Link
            to="/onboarding"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink text-ink-foreground px-5 py-2.5 text-sm font-medium"
          >
            Connect now
          </Link>
        </section>
      </AppPage>
    );
  }

  if ((txsLoading && !txs) || agentLoading) {
    return (
      <AppPage subtitle="agent trail & chain" title="Activity">
        <section className="mt-8 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-card animate-pulse h-20" />
          ))}
        </section>
      </AppPage>
    );
  }

  const list = txs ?? [];
  const walletEmpty = list.length === 0;

  // ── After loading, always render tabs ────────────────────────────
  // Each tab handles its own empty/no-agent state.

  return (
    <AppPage subtitle="agent trail & chain" title="Activity">
      <p className="text-sm text-muted-foreground mt-1 mb-4 leading-relaxed">
        {hasAgent ? (
          <>
            <strong className="text-foreground">
              {agent?.displayName ||
                agent?.handle ||
                backendAgent?.displayName ||
                backendAgent?.handle ||
                "Agent"}
            </strong>{" "}
            — decisions your agent has made with real-time status and on-chain wallet activity.
          </>
        ) : (
          <>
            Your wallet signatures on Solana. Launch an agent to unlock the decision log alongside
            this feed.
          </>
        )}
      </p>

      <LayoutGroup id="activity-tabs">
        <Tabs value={activityTab} onValueChange={setActivityTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-auto rounded-2xl p-1 bg-muted/80 border border-border relative">
            <TabsTrigger
              value="agent-log"
              className="relative z-10 rounded-xl py-2.5 text-sm overflow-hidden data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <TabPillBg
                show={activityTab === "agent-log"}
                layoutId="activity-seg-pill"
                className="rounded-xl"
              />
              <span className="relative z-10">Agent activity logs</span>
            </TabsTrigger>
            <TabsTrigger
              value="onchain"
              className="relative z-10 rounded-xl py-2.5 text-sm overflow-hidden data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <TabPillBg
                show={activityTab === "onchain"}
                layoutId="activity-seg-pill"
                className="rounded-xl"
              />
              <span className="relative z-10">Activity tx</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agent-log" className="mt-4 space-y-4 focus-visible:outline-none">
            {/* ── Agent selector ────────────────────────────────────────── */}
            {agents.length > 1 && (
              <div className="flex items-center gap-2">
                <Select
                  value={selectedAgentId ?? ""}
                  onValueChange={(id) => setSelectedAgentId(id)}
                >
                  <SelectTrigger className="rounded-xl border-border bg-card h-10 w-full sm:w-64 text-sm">
                    <SelectValue placeholder="Select agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.displayName || a.handle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {backendAgent && (
                  <Badge
                    variant={statusBadgeVariant(backendAgent.status)}
                    className="text-[10px] px-2 py-0 h-6 shrink-0"
                  >
                    {statusLabel(backendAgent.status)}
                  </Badge>
                )}
              </div>
            )}

            {/* ── Status + Controls ─────────────────────────────────────── */}
            {hasAgent ? (
              <AgentStatusCard
                backendAgent={backendAgent}
                context={context}
                balance={balance}
                loading={loadingBackend}
                error={backendError}
                actionLoading={actionLoading}
                onPause={doPause}
                onResume={doResume}
                onStop={doStop}
                onRetry={fetchAgentData}
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-border py-12 text-center px-4">
                <Bot className="size-10 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-sm font-semibold text-foreground">No agent yet</h3>
                <p className="mt-1 text-xs text-muted-foreground max-w-xs mx-auto">
                  Launch an agent to start monitoring its decisions, status, and activity logs.
                </p>
                <Link
                  to="/launch"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-ink text-ink-foreground px-5 py-2.5 text-sm font-medium"
                >
                  Launch agent <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
            )}

            {/* ── Decision feed ────────────────────────────────────────── */}
            {backendAgent && (
              <div>
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-sm font-semibold text-foreground">Decision log</h3>
                  {backendAgent && (
                    <span className="text-[11px] text-muted-foreground tabular-nums">
                      {decisions.length} decisions
                    </span>
                  )}
                </div>

                {decisions.length === 0 && !loadingBackend ? (
                  <div className="rounded-2xl border border-dashed border-border py-10 text-center px-4">
                    <Bot className="size-8 mx-auto text-muted-foreground" />
                    <p className="mt-3 text-sm font-medium text-foreground">No decisions yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Decisions appear here once the agent starts running cycles.
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {decisions.map((d) => (
                      <li
                        key={d.id}
                        className="rounded-2xl bg-card border border-border p-4 flex gap-3 items-start"
                      >
                        <DecisionStatusIcon status={d.status} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium text-foreground leading-snug">
                              {actionLabel(d.action)}
                            </p>
                            <time
                              dateTime={new Date(d.timestamp).toISOString()}
                              className="text-[10px] text-muted-foreground shrink-0 tabular-nums"
                              title={new Date(d.timestamp).toLocaleString()}
                            >
                              {formatDistanceToNow(d.timestamp, { addSuffix: true })}
                            </time>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            {d.reasoning}
                          </p>
                          {d.status === "blocked" && d.blockReason && (
                            <div className="mt-2 flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                              <AlertTriangle className="size-3.5 mt-0.5 shrink-0" />
                              <span>{d.blockReason}</span>
                            </div>
                          )}
                          {d.txHash && (
                            <a
                              href={solscanTxUrl(d.txHash)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                              Tx <ExternalLink className="size-3" />
                            </a>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="onchain" className="mt-4 focus-visible:outline-none">
            {walletEmpty ? (
              <section className="rounded-2xl border border-dashed border-border py-14 text-center px-4">
                <Sparkles className="size-10 mx-auto text-muted-foreground" />
                <p className="mt-4 text-sm font-medium">No signatures yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Bridges, SPL moves, or program txs from this wallet will list here with Solscan
                  links.
                </p>
              </section>
            ) : (
              <WalletTxSections list={list} />
            )}
          </TabsContent>
        </Tabs>
      </LayoutGroup>
    </AppPage>
  );
}

// ── Agent Status Card ─────────────────────────────────────────────────────
function AgentStatusCard({
  backendAgent,
  context,
  balance,
  loading,
  error,
  actionLoading,
  onPause,
  onResume,
  onStop,
  onRetry,
}: {
  backendAgent: BackendAgent | null;
  context: AgentContext | null;
  balance: AgentBalance | null;
  loading: boolean;
  error: string | null;
  actionLoading: string | null;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onRetry: () => void;
}) {
  if (!backendAgent && loading) {
    return <div className="rounded-2xl bg-card animate-pulse h-32" />;
  }

  if (!backendAgent) {
    return (
      <div className="rounded-2xl bg-card border border-border p-5 text-center">
        <Bot className="size-8 mx-auto text-muted-foreground" />
        <p className="mt-2 text-sm font-medium">No backend agent found</p>
        <p className="text-xs text-muted-foreground mt-1">
          Your on-chain agent is registered but we couldn&apos;t sync its backend state.
        </p>
        <Button variant="outline" size="sm" className="mt-3 rounded-full" onClick={onRetry}>
          <RefreshCw className="size-3.5 mr-1.5" />
          Retry
        </Button>
      </div>
    );
  }

  const { status, cycleCount, totalTxCount, lastActiveAt } = backendAgent;

  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden">
      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          {/* Pulsing status dot */}
          <span className="relative flex size-3">
            {status === "active" && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-40" />
            )}
            <span className={cn("relative inline-flex size-3 rounded-full", statusColor(status))} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                {backendAgent.displayName || backendAgent.handle}
              </span>
              <Badge variant={statusBadgeVariant(status)} className="text-[10px] px-2 py-0">
                {statusLabel(status)}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {status === "active"
                ? lastActiveAt
                  ? `Last active ${formatDistanceToNow(lastActiveAt, { addSuffix: true })}`
                  : "Waiting for first cycle…"
                : status === "paused"
                  ? "Agent is paused — tasks are on hold"
                  : "Agent is stopped"}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          {status === "active" && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-full h-8 px-3 text-xs"
              onClick={onPause}
              disabled={actionLoading !== null}
            >
              {actionLoading === "pause" ? (
                <RefreshCw className="size-3 mr-1 animate-spin" />
              ) : (
                <Pause className="size-3 mr-1" />
              )}
              Pause
            </Button>
          )}
          {(status === "paused" || status === "stopped") && (
            <Button
              variant="default"
              size="sm"
              className="rounded-full h-8 px-3 text-xs"
              onClick={onResume}
              disabled={actionLoading !== null}
            >
              {actionLoading === "resume" ? (
                <RefreshCw className="size-3 mr-1 animate-spin" />
              ) : (
                <Play className="size-3 mr-1" />
              )}
              Resume
            </Button>
          )}
          {status !== "stopped" && status !== "blocked" && (
            <Button
              variant="destructive"
              size="sm"
              className="rounded-full h-8 px-3 text-xs"
              onClick={onStop}
              disabled={actionLoading !== null}
            >
              {actionLoading === "stop" ? (
                <RefreshCw className="size-3 mr-1 animate-spin" />
              ) : (
                <Square className="size-3 mr-1" />
              )}
              Stop
            </Button>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 divide-x divide-border text-center">
        <div className="py-3 px-2">
          <p className="text-lg font-bold text-foreground tabular-nums">{cycleCount}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
            Cycles
          </p>
        </div>
        <div className="py-3 px-2">
          <p className="text-lg font-bold text-foreground tabular-nums">{totalTxCount}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
            Transactions
          </p>
        </div>
        <div className="py-3 px-2">
          <p className="text-lg font-bold text-foreground tabular-nums">
            {balance ? `${balance.sol.toFixed(3)} SOL` : "—"}
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
            {balance ? (
              <a
                href={balance.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                Agent wallet <ExternalLink className="size-2.5" />
              </a>
            ) : (
              "Balance"
            )}
          </p>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="px-4 py-2.5 bg-destructive/10 border-t border-destructive/20 flex items-center justify-between">
          <span className="text-xs text-destructive">{error}</span>
          <button
            onClick={onRetry}
            className="text-xs text-destructive font-medium hover:underline"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}

// ── Wallet tx sections ───────────────────────────────────────────────────
function WalletTxSections({ list }: { list: ConfirmedSignatureInfo[] }) {
  const groups = list.reduce<Record<string, NonNullable<(typeof list)[number]>[]>>((acc, tx) => {
    const date = tx.blockTime
      ? new Date(tx.blockTime * 1000).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      : "Unknown";
    (acc[date] ??= []).push(tx);
    return acc;
  }, {});

  const isFailed = (tx: (typeof list)[0]) => tx.err !== null;

  return (
    <div>
      {Object.entries(groups).map(([group, txsInGroup]) => (
        <div key={group} className="mb-6 last:mb-0">
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground font-medium mb-3 px-1">
            {group}
          </p>

          {/* ── Desktop: table ───────────────────────────────────── */}
          <div className="hidden lg:block rounded-2xl border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 font-medium w-12" />
                  <th className="px-2 py-3 font-medium">Transaction</th>
                  <th className="px-2 py-3 font-medium">Status</th>
                  <th className="px-2 py-3 font-medium">Time</th>
                  <th className="px-4 py-3 font-medium text-right">Signature</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {txsInGroup.map((tx, idx) => (
                  <tr key={tx.signature} className="bg-card hover:bg-muted/20 transition-colors">
                    {/* Status icon */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`size-8 rounded-full flex items-center justify-center ${
                          isFailed(tx)
                            ? "bg-destructive/15 text-destructive"
                            : "bg-success/15 text-success"
                        }`}
                      >
                        {isFailed(tx) ? (
                          <CircleX className="size-4" strokeWidth={2.2} />
                        ) : (
                          <CircleCheck className="size-4" strokeWidth={2.2} />
                        )}
                      </span>
                    </td>

                    {/* Memo / type */}
                    <td className="px-2 py-3.5">
                      <p className="text-sm font-medium text-foreground">
                        {isFailed(tx) ? "Failed" : "Confirmed"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {tx.memo ?? "Solana transaction"}
                      </p>
                    </td>

                    {/* Status badge */}
                    <td className="px-2 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                          tx.confirmationStatus === "finalized"
                            ? "bg-success/10 text-success"
                            : tx.confirmationStatus === "confirmed"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            tx.confirmationStatus === "finalized"
                              ? "bg-success"
                              : tx.confirmationStatus === "confirmed"
                                ? "bg-amber-500"
                                : "bg-muted-foreground"
                          }`}
                        />
                        {tx.confirmationStatus === "finalized"
                          ? "Finalized"
                          : tx.confirmationStatus === "confirmed"
                            ? "Confirmed"
                            : "Pending"}
                      </span>
                    </td>

                    {/* Time */}
                    <td className="px-2 py-3.5">
                      <p className="text-sm text-foreground tabular-nums">
                        {tx.blockTime
                          ? new Date(tx.blockTime * 1000).toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                            })
                          : "—"}
                      </p>
                    </td>

                    {/* Signature + link */}
                    <td className="px-4 py-3.5 text-right">
                      <a
                        href={solscanTxUrl(tx.signature)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {tx.signature.slice(0, 6)}…{tx.signature.slice(-6)}
                        <ExternalLink className="size-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Mobile: cards ────────────────────────────────────── */}
          <div className="lg:hidden space-y-2">
            {txsInGroup.map((tx) => (
              <div key={tx.signature} className="rounded-2xl bg-card border border-border p-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`size-10 rounded-full flex items-center justify-center ${
                      isFailed(tx)
                        ? "bg-destructive text-destructive-foreground"
                        : "bg-success text-success-foreground"
                    }`}
                  >
                    {isFailed(tx) ? (
                      <CircleX className="size-5" strokeWidth={2.2} />
                    ) : (
                      <CircleCheck className="size-5" strokeWidth={2.2} />
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {isFailed(tx) ? "Failed transaction" : "Confirmed transaction"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {tx.memo ??
                        (tx.confirmationStatus === "finalized" ? "Finalized" : "Confirmed")}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {isFailed(tx) ? "Failed" : "Confirmed"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {tx.blockTime
                        ? new Date(tx.blockTime * 1000).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })
                        : ""}
                    </p>
                  </div>
                </div>
                {tx.signature && (
                  <a
                    href={solscanTxUrl(tx.signature)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 pt-3 border-t border-border flex items-center justify-between hover:opacity-80 transition-opacity"
                  >
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      tx
                    </span>
                    <span className="font-mono text-xs text-foreground inline-flex items-center gap-1">
                      {tx.signature.slice(0, 4)}…{tx.signature.slice(-4)}
                      <ExternalLink className="size-3" />
                    </span>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
