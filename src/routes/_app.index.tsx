import { createFileRoute, Link } from "@tanstack/react-router";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  ArrowUpRight,
  BadgeCheck,
  Bot,
  LayoutGrid,
  MessageSquare,
  Plus,
  Shield,
  Sparkles,
} from "lucide-react";
import { AppPage } from "@/components/app-page";
import { useBalances } from "@/hooks/use-solana-data";
import { useUiAgent } from "@/hooks/use-ui-agent";
import { cn } from "@/lib/utils";
import type { AgentIdentity } from "@/hooks/use-solana-data";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Oishi — Your agent's wallet" },
      {
        name: "description",
        content: "Programmable allowances and on-chain reputation for AI agents on Solana.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { publicKey, connected } = useWallet();
  const { data: balances, isLoading: balanceLoading } = useBalances(publicKey ?? null);
  const { uiAgent, hasAgent, isLoading: agentIdentityLoading, agent } = useUiAgent();

  const isLoading = balanceLoading || agentIdentityLoading;
  const totalUsd = (balances?.solUsd ?? 0) + (balances?.usdcUsd ?? 0);

  // ── No wallet connected ─────────────────────────────────
  if (!connected) {
    return (
      <AppPage title="Dashboard">
        <section className="mt-12 text-center">
          <div className="mx-auto size-16 rounded-full bg-secondary flex items-center justify-center">
            <Shield className="size-7 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-lg font-semibold">Connect your wallet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect Phantom or Solflare to view your agent.
          </p>
          <Link
            to="/onboarding"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink text-ink-foreground px-6 py-3 text-sm font-medium"
          >
            Connect now
          </Link>
        </section>
      </AppPage>
    );
  }

  // ── Loading ─────────────────────────────────────────────
  if (isLoading && !balances && !agent) {
    return (
      <AppPage title="Dashboard">
        <section className="mt-8 space-y-4">
          <div className="rounded-3xl bg-ink/20 animate-pulse h-48" />
          <div className="rounded-3xl bg-card animate-pulse h-24" />
          <div className="rounded-3xl bg-card animate-pulse h-40" />
        </section>
      </AppPage>
    );
  }

  // ── No agent created — show full dashboard + launch prompt ────
  return (
    <AppPage title="Dashboard">
      {/* ── Launch prompt (only if no agent) ──────────────────── */}
      {!hasAgent && (
        <Link
          to="/launch"
          search={{ tab: "new" }}
          className="mt-2 flex items-center gap-3 rounded-2xl bg-accent/10 border border-accent/20 px-4 py-3 hover:bg-accent/15 transition-colors"
        >
          <span className="size-10 shrink-0 rounded-full bg-accent text-white flex items-center justify-center">
            <Bot className="size-5" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Launch your agent</p>
            <p className="text-xs text-muted-foreground">Pick a strategy and deploy on-chain</p>
          </div>
          <ArrowUpRight className="size-4 text-muted-foreground shrink-0" />
        </Link>
      )}

      {/* ── Agent identity bar ────────────────────────────────── */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`size-2 rounded-full ${hasAgent ? "bg-accent animate-pulse" : "bg-muted-foreground/40"}`}
          />
          <span className="text-sm font-medium truncate">
            {uiAgent ? uiAgent.displayName || uiAgent.handle : "No agent"}
          </span>
          {uiAgent ? (
            <span className="text-xs text-muted-foreground font-mono truncate">
              {uiAgent.handle}
            </span>
          ) : null}
        </div>
        {uiAgent ? (
          <KyaBadge score={uiAgent.reputationScore} tier={uiAgent.tier} />
        ) : (
          <span className="text-xs text-muted-foreground">Unregistered</span>
        )}
      </div>

      {/* ── Balance card ────────────────────────────────── */}
      <section className="mt-3 rounded-3xl bg-ink text-ink-foreground p-6">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.18em] text-ink-foreground/60">
            Agent wallet
          </span>
        </div>

        <div className="mt-4">
          <p className="font-display text-6xl tabular leading-none">
            ${Math.floor(totalUsd).toLocaleString()}
            <span className="text-ink-foreground/40">
              .
              {Math.round((totalUsd % 1) * 100)
                .toString()
                .padStart(2, "0")}
            </span>
          </p>
          <div className="mt-2 flex gap-4 text-sm text-ink-foreground/60">
            <span className="tabular">{balances!.sol.toFixed(4)} SOL</span>
            <span className="tabular">{balances!.usdc.toFixed(2)} USDC</span>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-ink-foreground/10 text-xs text-ink-foreground/50">
          ≈ ${totalUsd.toFixed(2)} USD
        </div>
      </section>

      {/* ── Quick actions ────────────────────────────────── */}
      <section className={cn("mt-4 grid gap-3", uiAgent ? "grid-cols-2" : "grid-cols-3")}>
        <QuickAction
          to="/fund"
          icon={<Plus className="size-4" strokeWidth={2.4} />}
          label="Fund"
          accent
        />
        <QuickAction
          to="/profile"
          icon={<BadgeCheck className="size-4" strokeWidth={2.35} />}
          label="Profile"
        />
        <QuickAction
          to="/marketplace"
          icon={<LayoutGrid className="size-4" strokeWidth={2.2} />}
          label="Strategies"
        />
        {uiAgent ? (
          <QuickAction
            to="/launch"
            search={{ tab: "active" }}
            icon={<MessageSquare className="size-4" strokeWidth={2.2} />}
            label="Ask agent"
          />
        ) : null}
      </section>

      {/* ── KYA reputation ───────────────────────────────── */}
      <section className="mt-4 rounded-3xl bg-card border border-border p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              KYA reputation
            </p>
            {uiAgent ? (
              <p className="font-display text-3xl mt-1 capitalize">
                {uiAgent.tier} · {uiAgent.reputationScore}
              </p>
            ) : (
              <p className="font-display text-3xl mt-1 text-muted-foreground">Unregistered</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Attestations</p>
            <p className="text-accent font-medium tabular">
              {uiAgent ? uiAgent.attestationCount : "—"}
            </p>
          </div>
        </div>
        <div className="mt-4 h-2 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: uiAgent ? `${Math.min(100, uiAgent.reputationScore)}%` : "0%",
              backgroundColor: uiAgent
                ? uiAgent.tier === "gold"
                  ? "#f59e0b"
                  : uiAgent.tier === "green"
                    ? "#22c55e"
                    : uiAgent.tier === "yellow"
                      ? "#eab308"
                      : "#ef4444"
                : "#6b7280",
            }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
          <span>0</span>
          <span>25</span>
          <span>70</span>
          <span>90</span>
          <span>100</span>
        </div>
        {!hasAgent && (
          <p className="mt-3 text-xs text-muted-foreground">
            Launch an agent to build on-chain reputation.
          </p>
        )}
      </section>

      {/* ── Recent activity ──────────────────────────────── */}
      <section className="mt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-foreground">Pulse</h2>
          <Link
            to="/activity"
            className="text-xs text-muted-foreground inline-flex items-center gap-1"
          >
            Activity <ArrowUpRight className="size-3" />
          </Link>
        </div>
        <p className="text-xs text-muted-foreground text-center py-6 leading-relaxed">
          {hasAgent
            ? "Agent decision trail and Solana txs live on Activity. Chat with your agent from Launch → Your active agent."
            : "Launch your agent first. Then Activity shows tool runs, approvals, and on-chain txs together."}
        </p>
      </section>
    </AppPage>
  );
}

// ── Sub-components ─────────────────────────────────────────────

function KyaBadge({ score, tier }: { score: number; tier: AgentIdentity["tier"] }) {
  const colors = {
    gold: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    green: "bg-green-500/10 text-green-500 border-green-500/20",
    yellow: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    red: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${colors[tier]}`}
    >
      <Sparkles className="size-3" />
      {tier.toUpperCase()} {score}
    </span>
  );
}

function QuickAction({
  to,
  search,
  icon,
  label,
  accent,
}: {
  to: string;
  search?: { tab?: "active" | "new" };
  icon: React.ReactNode;
  label: string;
  accent?: boolean;
}) {
  return (
    <Link
      to={to}
      {...(search ? { search } : {})}
      className="rounded-2xl bg-card p-3 flex flex-row items-center justify-center gap-2 border border-border min-w-0"
    >
      <span
        className={`size-8 shrink-0 rounded-full flex items-center justify-center ${
          accent ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground"
        }`}
      >
        {icon}
      </span>
      <span className="text-sm font-medium truncate">{label}</span>
    </Link>
  );
}
