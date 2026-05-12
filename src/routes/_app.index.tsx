import { createFileRoute, Link } from "@tanstack/react-router";
import { type ReactNode } from "react";
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
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AppPage } from "@/components/app-page";
import { useBalances } from "@/hooks/use-solana-data";
import { useUiAgent } from "@/hooks/use-ui-agent";
import { useGoldRushBalances } from "@/hooks/use-goldrush";
import { useOishiBackend } from "@/hooks/use-oishi-backend";
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
  const {
    uiAgent,
    hasAgent,
    isLoading: agentIdentityLoading,
    agent,
    backendAgent,
    isDraft,
    isRegistered,
  } = useUiAgent();

  const { api, isReady: backendReady } = useOishiBackend();
  const backendAgentId = backendAgent?.id ?? null;

  const { data: agentBalance } = useQuery({
    queryKey: ["oishi", "agent-balance", backendAgentId],
    queryFn: async () => {
      if (!api || !backendAgentId || !publicKey) return null;
      try {
        return await api.getAgentBalance(backendAgentId);
      } catch {
        return null;
      }
    },
    enabled: backendReady && !!backendAgentId && !!publicKey,
    staleTime: 10_000,
    refetchInterval: 30_000,
  });

  /* GoldRush: multi-chain portfolio via Covalent */
  const agentWalletAddress = agentBalance?.wallet ?? null;
  const { data: grBalances, isLoading: grLoading } = useGoldRushBalances(agentWalletAddress);

  const isLoading = balanceLoading || agentIdentityLoading;
  const totalUsd = agentBalance
    ? (agentBalance.solUsd ?? 0) + (agentBalance.usdcUsd ?? 0)
    : (balances?.solUsd ?? 0) + (balances?.usdcUsd ?? 0);
  const agentHasWallet = agentBalance && agentBalance.wallet && agentBalance.wallet.length > 0;

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

  // ── Main dashboard ──────────────────────────────────────
  return (
    <AppPage title="Dashboard">
      {/* Launch prompt (only if no agent) */}
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

      {/* Agent identity bar */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={cn(
              "size-2 rounded-full shrink-0",
              isRegistered ? "bg-accent animate-pulse" : "bg-muted-foreground/40",
            )}
          />
          <span className="text-sm font-medium truncate">
            {uiAgent ? uiAgent.displayName || uiAgent.handle : "No agent"}
          </span>
          {uiAgent ? (
            <span className="text-xs text-muted-foreground font-mono truncate hidden sm:inline">
              {uiAgent.handle}
            </span>
          ) : null}
        </div>
        {isDraft && (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-500">
            Draft
          </span>
        )}
        {isRegistered && uiAgent && (
          <KyaBadge score={uiAgent.reputationScore} tier={uiAgent.tier} />
        )}
        {!hasAgent && <span className="text-xs text-muted-foreground">Unregistered</span>}
      </div>

      {/* ── KYA Registration CTA (draft agents only) ────────────── */}
      {isDraft && (
        <Link
          to="/profile"
          className="mt-3 flex items-center gap-3 rounded-2xl border border-accent/20 bg-accent/10 px-4 py-3 hover:bg-accent/15 transition-colors"
        >
          <span className="size-10 shrink-0 rounded-full bg-accent text-white flex items-center justify-center"></span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Register for KYA</p>
            <p className="text-xs text-muted-foreground">
              Register on-chain via Metaplex to build verifiable reputation
            </p>
          </div>
          <ArrowUpRight className="size-4 text-muted-foreground shrink-0" />
        </Link>
      )}

      {/* Desktop layout: 3-column on xl, 2-column on lg, stacked on mobile */}
      <div className="mt-4 lg:mt-6 grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-12 gap-4 lg:gap-5 xl:gap-6">
        {/* Balance card — spans 2 cols on xl, full on lg/mobile */}
        <section className="lg:col-span-2 xl:col-span-7 rounded-3xl bg-ink text-ink-foreground p-6 lg:p-7 xl:p-8">
          <div className="flex items-center justify-between mb-6 lg:mb-8">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-xl bg-ink-foreground/10 flex items-center justify-center">
                <Wallet className="size-4 text-ink-foreground/60" />
              </div>
              <span className="text-[11px] uppercase tracking-[0.18em] text-ink-foreground/60 font-medium">
                Agent wallet
              </span>
            </div>
            {hasAgent && (
              <span className="text-[10px] uppercase tracking-widest text-ink-foreground/40">
                Live
              </span>
            )}
          </div>

          <p className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl tabular leading-none">
            ${Math.floor(totalUsd).toLocaleString()}
            <span className="text-ink-foreground/40">
              .
              {Math.round((totalUsd % 1) * 100)
                .toString()
                .padStart(2, "0")}
            </span>
          </p>

          <div className="mt-4 lg:mt-5 flex flex-wrap gap-6 text-sm text-ink-foreground/60">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-ink-foreground/40 block mb-0.5">
                SOL
              </span>
              <span className="tabular font-medium">{balances!.sol.toFixed(4)}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-ink-foreground/40 block mb-0.5">
                USDC
              </span>
              <span className="tabular font-medium">{balances!.usdc.toFixed(2)}</span>
            </div>
            <div>
              {/* <span className="text-[10px] uppercase tracking-widest text-ink-foreground/40 block mb-0.5">
                Total USD
              </span>
              <span className="tabular font-medium">${totalUsd.toFixed(2)}</span> */}
            </div>
          </div>

          {agentBalance && (
            <a
              href={agentBalance.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 pt-4 border-t border-ink-foreground/10 flex items-center gap-2 text-[11px] text-ink-foreground/40 hover:text-ink-foreground/70 transition-colors font-mono"
            >
              {agentBalance.wallet.slice(0, 6)}…{agentBalance.wallet.slice(-6)}
              <ArrowUpRight className="size-3" />
            </a>
          )}
        </section>

        {/* Right column: Quick actions + KYA stacked */}
        <div className="lg:col-span-1 xl:col-span-5 flex flex-col gap-4 lg:gap-5">
          {/* Quick actions */}
          <section className="rounded-xl lg:rounded-xl bg-card border border-border p-4 lg:p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground font-medium mb-3">
              Quick actions
            </p>
            <div className="grid grid-cols-2 gap-2">
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
              ) : (
                <QuickAction
                  to="/launch"
                  search={{ tab: "new" }}
                  icon={<Bot className="size-4" strokeWidth={2.2} />}
                  label="Launch"
                />
              )}
            </div>
          </section>

          {/* reputation */}
          <section className="rounded-xl lg:rounded-xl bg-card border border-border p-4 lg:p-5 flex-1">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground font-medium">
                reputation
              </p>
              {uiAgent && (
                <span className="text-[10px] text-muted-foreground">
                  {uiAgent.attestationCount} attestations
                </span>
              )}
            </div>

            {uiAgent ? (
              <>
                <div className="flex items-end gap-3 mb-3">
                  <p className="font-display text-3xl lg:text-4xl xl:text-5xl tabular leading-none capitalize">
                    {uiAgent.tier}
                  </p>
                  <span className="text-2xl lg:text-3xl text-muted-foreground/50 mb-0.5">·</span>
                  <p className="font-display text-3xl lg:text-4xl xl:text-5xl tabular leading-none">
                    {uiAgent.reputationScore}
                  </p>
                </div>

                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(100, uiAgent.reputationScore)}%`,
                      backgroundColor:
                        uiAgent.tier === "gold"
                          ? "#f59e0b"
                          : uiAgent.tier === "green"
                            ? "#22c55e"
                            : uiAgent.tier === "yellow"
                              ? "#eab308"
                              : "#ef4444",
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
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  Launch an agent to build reputation.
                </p>
                <Link
                  to="/launch"
                  search={{ tab: "new" }}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs text-accent-foreground font-medium"
                >
                  Get started <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Stats bar — desktop only */}
      <section className="hidden lg:grid grid-cols-4 gap-3 mt-5 lg:mt-6">
        <StatCard label="Total earned" value="+$0.00" icon={<TrendingUp className="size-4" />} />
        <StatCard label="Cycles run" value="0" icon={<Zap className="size-4" />} />
        <StatCard label="Transactions" value="0" icon={<Shield className="size-4" />} />
        <StatCard
          label="Reputation"
          value={uiAgent ? String(uiAgent.reputationScore) : "—"}
          icon={<Sparkles className="size-4" />}
        />
      </section>

      {/* GoldRush portfolio — shown when agent wallet address is available */}
      {agentWalletAddress && (
        <section className="mt-5 lg:mt-6 rounded-3xl bg-card border border-border p-5 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-xl bg-secondary flex items-center justify-center">
                <TrendingUp className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground font-medium">
                  Portfolio
                </p>
                <p className="text-[10px] text-muted-foreground">Powered by GoldRush · Covalent</p>
              </div>
            </div>
            {!grLoading && grBalances && (
              <span className="text-xs text-muted-foreground">
                {grBalances.length} token{grBalances.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {grLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 rounded-xl bg-secondary/50 animate-pulse" />
              ))}
            </div>
          ) : grBalances && grBalances.length > 0 ? (
            <div className="space-y-1">
              {grBalances.slice(0, 6).map((item) => (
                <div
                  key={item.contractAddress}
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="size-8 rounded-lg bg-secondary flex items-center justify-center text-xs font-bold shrink-0">
                      {item.ticker.slice(0, 3)}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.contractName || item.ticker}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">{item.chain}</p>
                    </div>
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    <p className="text-sm font-medium tabular">
                      {item.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}{" "}
                      {item.ticker}
                    </p>
                    <p className="text-[10px] text-muted-foreground tabular">
                      $
                      {item.usdValue.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground">
                {import.meta.env.VITE_GOLDRUSH_API_KEY
                  ? "No token data found for this wallet on Solana mainnet."
                  : "Set VITE_GOLDRUSH_API_KEY in .env to see portfolio."}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {import.meta.env.VITE_GOLDRUSH_API_KEY
                  ? "Fund your agent wallet and tokens appear here."
                  : "Get a free API key at goldrush.dev/platform"}
              </p>
            </div>
          )}
        </section>
      )}

      {/* Pulse / Activity section */}
      <section className="mt-5 lg:mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-foreground">Pulse</h2>
          <Link
            to="/activity"
            className="text-xs text-muted-foreground inline-flex items-center gap-1 hover:text-foreground transition-colors"
          >
            View all <ArrowUpRight className="size-3" />
          </Link>
        </div>
        <p className="text-xs text-muted-foreground text-center py-8 lg:py-12 leading-relaxed rounded-2xl border border-dashed border-border bg-card/30">
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
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
        colors[tier],
      )}
    >
      <Sparkles className="size-3" />
      {tier.toUpperCase()} {score}
    </span>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-xl bg-card border border-border p-4 flex items-center gap-3">
      <div className="size-9 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">
          {label}
        </p>
        <p className="text-base font-semibold tabular truncate">{value}</p>
      </div>
    </div>
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
  icon: ReactNode;
  label: string;
  accent?: boolean;
}) {
  return (
    <Link
      to={to}
      {...(search ? { search } : {})}
      className={cn(
        "rounded-xl p-3 flex flex-row items-center gap-2.5 border transition-all",
        accent
          ? "bg-accent/8 border-accent/20 text-accent-foreground hover:bg-accent/12"
          : "bg-secondary/40 border-border text-foreground hover:bg-secondary/70",
      )}
    >
      <span
        className={cn(
          "size-8 rounded-lg flex items-center justify-center shrink-0",
          accent ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground",
        )}
      >
        {icon}
      </span>
      <span className="text-sm font-medium truncate">{label}</span>
    </Link>
  );
}
