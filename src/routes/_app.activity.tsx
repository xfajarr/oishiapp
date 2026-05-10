import type { ConfirmedSignatureInfo } from "@solana/web3.js";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { LayoutGroup } from "framer-motion";
import {
  ArrowUpRight,
  Bot,
  CircleCheck,
  CircleX,
  ExternalLink,
  Sparkles,
  Wallet,
  Clock,
  Zap,
  ShieldAlert,
} from "lucide-react";
import { AppPage } from "@/components/app-page";
import { TabPillBg } from "@/components/tab-pill-bg";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRecentTransactions, useAgentByOwner } from "@/hooks/use-solana-data";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const SOLSCAN_BASE = "https://solscan.io/tx/";

function solscanTxUrl(signature: string): string {
  const cluster = import.meta.env.VITE_SOLANA_NETWORK === "mainnet-beta" ? "" : "?cluster=devnet";
  return `${SOLSCAN_BASE}${signature}${cluster}`;
}

type AgentLogEvent = {
  id: string;
  at: Date;
  kind: "policy" | "tool" | "approval" | "sync";
  title: string;
  detail: string;
};

function demoAgentLog(handle: string, displayName: string): AgentLogEvent[] {
  const now = Date.now();
  const m = (n: number) => new Date(now - n * 60_000);
  return [
    {
      id: "l1",
      at: m(5),
      kind: "sync",
      title: "Balances reflected",
      detail: `${displayName || handle}: treasury snapshot synced with RPC.`,
    },
    {
      id: "l2",
      at: m(42),
      kind: "tool",
      title: "MCP capability probed",
      detail: `Payment quote path cached for USDC outbound (within daily cap).`,
    },
    {
      id: "l3",
      at: m(180),
      kind: "policy",
      title: "Policy guardrails enforced",
      detail: `TX simulation passed — KYA recipients only, approvals required over $25.`,
    },
    {
      id: "l4",
      at: m(900),
      kind: "approval",
      title: "Man-in-the-loop (pending UX)",
      detail: `Awaiting signer when a payout exceeds thresholds. Wire this to approvals API.`,
    },
  ];
}

function LogIcon({ kind }: { kind: AgentLogEvent["kind"] }) {
  const cls =
    kind === "policy"
      ? "bg-accent/20 text-accent-foreground border border-accent/30"
      : kind === "tool"
        ? "bg-secondary text-foreground border border-border"
        : kind === "approval"
          ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/25"
          : "bg-muted text-muted-foreground border border-border";
  const Ico =
    kind === "approval" ? ShieldAlert : kind === "tool" ? Zap : kind === "sync" ? Clock : Bot;
  return (
    <span className={cn("size-10 rounded-full shrink-0 flex items-center justify-center", cls)}>
      <Ico className="size-5" strokeWidth={2.1} aria-hidden />
    </span>
  );
}

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
  const { data: txs, isLoading } = useRecentTransactions(publicKey ?? null, 20);
  const { data: agent, isLoading: agentLoading } = useAgentByOwner(publicKey ?? null);
  const hasAgent = !!agent;
  const [activityTab, setActivityTab] = useState("agent-log");

  const agentLogEvents = agent ? demoAgentLog(agent.handle, agent.displayName || agent.handle) : [];

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

  if ((isLoading && !txs) || agentLoading) {
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

  if (!hasAgent) {
    return (
      <AppPage subtitle="on-chain wallet" title="Activity">
        <p className="text-sm text-muted-foreground mt-1 mb-5">
          Your wallet signatures on Solana. Launch an agent to unlock the decision log alongside
          this feed.
        </p>
        {walletEmpty ? (
          <section className="mt-12 text-center">
            <div className="mx-auto size-16 rounded-full bg-secondary flex items-center justify-center">
              <Sparkles className="size-7 text-muted-foreground" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">No activity yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Fund your wallet and launch your agent — then txs and tooling events show here.
            </p>
            <Link
              to="/launch"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-ink text-ink-foreground px-5 py-2.5 text-sm font-medium"
            >
              Launch agent <ArrowUpRight className="size-3.5" />
            </Link>
          </section>
        ) : (
          <WalletTxSections list={list} />
        )}
      </AppPage>
    );
  }

  return (
    <AppPage subtitle="agent trail & chain" title="Activity">
      <p className="text-sm text-muted-foreground mt-1 mb-4 leading-relaxed">
        <strong className="text-foreground">{agent!.displayName || agent!.handle}</strong> —
        reasoning trail (stub) paired with signatures from your connected wallet on Solana.
      </p>

      <LayoutGroup id="activity-tabs">
        <Tabs value={activityTab} onValueChange={setActivityTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-auto rounded-2xl p-1 bg-muted/80 border border-border relative">
            <TabsTrigger
              value="agent-log"
              className="relative z-10 rounded-xl py-2.5 text-xs sm:text-sm overflow-hidden data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <TabPillBg
                show={activityTab === "agent-log"}
                layoutId="activity-seg-pill"
                className="rounded-xl"
              />
              <span className="relative z-10">Agent log</span>
            </TabsTrigger>
            <TabsTrigger
              value="onchain"
              className="relative z-10 rounded-xl py-2.5 text-xs sm:text-sm overflow-hidden data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <TabPillBg
                show={activityTab === "onchain"}
                layoutId="activity-seg-pill"
                className="rounded-xl"
              />
              <span className="relative z-10">On-chain (wallet)</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agent-log" className="mt-4 space-y-2 focus-visible:outline-none">
            <p className="text-[11px] text-muted-foreground px-1 mb-2 leading-relaxed">
              Demo timeline — swap for events from backend / MCP when wired. Man-in-the-loop cards
              will surface approvals here first.
            </p>
            <ul className="space-y-2">
              {agentLogEvents.map((ev) => (
                <li
                  key={ev.id}
                  className="rounded-2xl bg-card border border-border p-4 flex gap-3 items-start"
                >
                  <LogIcon kind={ev.kind} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-foreground leading-snug">{ev.title}</p>
                      <time
                        dateTime={ev.at.toISOString()}
                        className="text-[10px] text-muted-foreground shrink-0 tabular"
                        title={ev.at.toLocaleString()}
                      >
                        {formatDistanceToNow(ev.at, { addSuffix: true })}
                      </time>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {ev.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <Link
              to="/launch"
              search={{ tab: "active" }}
              className="mt-3 flex items-center justify-center gap-2 w-full rounded-2xl border border-border bg-secondary/50 py-3 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
            >
              Ask your agent about this trail <ArrowUpRight className="size-4" />
            </Link>
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

  const isConfirmed = (tx: (typeof list)[0]) => tx.err === null;
  const isFailed = (tx: (typeof list)[0]) => tx.err !== null;

  return (
    <>
      {Object.entries(groups).map(([group, txsInGroup]) => (
        <div key={group} className="mb-6">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2 px-1">
            {group}
          </p>
          <ul className="space-y-2">
            {txsInGroup.map((tx) => (
              <li key={tx.signature} className="rounded-2xl bg-card border border-border p-4">
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
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}
