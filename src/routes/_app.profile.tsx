import { createFileRoute } from "@tanstack/react-router";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState, type ReactNode, useCallback } from "react";
import { LayoutGroup } from "framer-motion";
import { AppPage } from "@/components/app-page";
import { TabPillBg } from "@/components/tab-pill-bg";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Copy, Sparkles, ShieldCheck, Trophy, Bot, CheckCircle } from "lucide-react";
import { useAgentByOwner } from "@/hooks/use-solana-data";
import type { AgentIdentity } from "@/hooks/use-solana-data";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Oishi" },
      {
        name: "description",
        content: "Your agent identity, KYA reputation, and programmable spending rules.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { publicKey, connected } = useWallet();
  const { data: agent, isLoading } = useAgentByOwner(publicKey ?? null);

  const [dailyCap, setDailyCap] = useState(50);
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [requireApproval, setRequireApproval] = useState(false);
  const [allowSubs, setAllowSubs] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [profileTab, setProfileTab] = useState("kya");

  const copyFn = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    });
  }, []);

  const hasWallet = connected && !!publicKey;
  const hasAgent = !!agent;

  const showSkeleton = hasWallet && isLoading && !agent;

  if (showSkeleton) {
    return (
      <AppPage subtitle="agent & guardrails" title="Profile">
        <section className="mt-12 space-y-4">
          <div className="rounded-3xl bg-card animate-pulse h-48" />
          <div className="rounded-3xl bg-card animate-pulse h-40" />
          <div className="rounded-3xl bg-card animate-pulse h-60" />
        </section>
      </AppPage>
    );
  }

  return (
    <AppPage subtitle="agent & guardrails" title="Profile">
      <LayoutGroup id="profile-tabs">
        <Tabs value={profileTab} onValueChange={setProfileTab} className="mt-2 w-full">
          <TabsList className="grid w-full grid-cols-2 gap-1 rounded-xl bg-muted/80 p-1 h-auto border border-border relative">
            <TabsTrigger
              value="kya"
              className="relative z-10 rounded-lg py-2.5 px-3 text-xs sm:text-sm overflow-hidden data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <TabPillBg
                show={profileTab === "kya"}
                layoutId="profile-seg-pill"
                className="rounded-lg"
              />
              <span className="relative z-10">Agent (KYA)</span>
            </TabsTrigger>
            <TabsTrigger
              value="rules"
              className="relative z-10 rounded-lg py-2.5 px-3 text-xs sm:text-sm overflow-hidden data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <TabPillBg
                show={profileTab === "rules"}
                layoutId="profile-seg-pill"
                className="rounded-lg"
              />
              <span className="relative z-10">Rules</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="kya"
            className="mt-5 space-y-4 focus-visible:outline-none outline-none"
          >
            {/* ── Identity card ──────────────────────────────────── */}
            <section className="rounded-3xl bg-card border border-border p-6 text-center">
              {hasAgent ? (
                <>
                  <div className="mx-auto size-20 rounded-full bg-ink text-ink-foreground flex items-center justify-center font-display text-3xl uppercase">
                    {agent.displayName?.charAt(0) ?? agent.handle.charAt(1)}
                  </div>
                  <p className="mt-4 font-display text-3xl">{agent.handle}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {agent.displayName} · since{" "}
                    {new Date(agent.createdAt * 1000).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </>
              ) : (
                <>
                  <div className="mx-auto size-20 rounded-full bg-secondary text-muted-foreground flex items-center justify-center">
                    <Bot className="size-10" aria-hidden />
                  </div>
                  <p className="mt-4 font-display text-3xl text-muted-foreground">
                    {hasWallet ? "No agent yet" : "Connect wallet"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {hasWallet
                      ? "Launch an agent to claim your identity and KYA reputation."
                      : "Connect your wallet to view and manage your agent profile."}
                  </p>
                </>
              )}

              {hasWallet ? (
                <button
                  type="button"
                  onClick={() => copyFn(publicKey!.toBase58(), "address")}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-xs font-mono hover:bg-secondary/80 transition-colors"
                >
                  {publicKey!.toBase58().slice(0, 4)}…{publicKey!.toBase58().slice(-4)}
                  {copied === "address" ? (
                    <CheckCircle className="size-3 text-success" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                </button>
              ) : (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-secondary/50 px-4 py-2 text-xs font-mono text-muted-foreground border border-border/60">
                  —····—
                </div>
              )}
            </section>

            {/* ── KYA reputation ────────────────────────────────── */}
            <section className="mt-4 rounded-3xl bg-ink text-ink-foreground p-6">
              <div className="flex items-center gap-2">
                <Trophy className="size-4 text-accent" />
                <span className="text-xs uppercase tracking-[0.18em] text-ink-foreground/60">
                  KYA reputation
                </span>
              </div>
              <div className="mt-3 flex items-end gap-3 flex-wrap">
                <p className="font-display text-7xl leading-none tabular text-ink-foreground/90">
                  {hasAgent ? agent.reputationScore : "—"}
                </p>
                {hasAgent ? (
                  <TierBadge tier={agent.tier} />
                ) : (
                  <span className="mb-2 px-2.5 py-0.5 rounded-full border text-xs font-medium bg-ink-foreground/5 text-ink-foreground/35 border-ink-foreground/15">
                    No tier
                  </span>
                )}
              </div>
              <div className="mt-4 h-2 rounded-full bg-ink-foreground/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${hasAgent ? Math.min(100, agent.reputationScore) : 0}%`,
                    backgroundColor: hasAgent ? tierColor(agent.tier) : "rgba(255,255,255,0.12)",
                  }}
                />
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-ink-foreground/40">
                <span>0</span>
                <span>25</span>
                <span>70</span>
                <span>90</span>
                <span>100</span>
              </div>
              <p className="text-sm text-ink-foreground/60 mt-3">
                {hasAgent
                  ? `Verified agent with ${agent.attestationCount} on-chain attestations.`
                  : "Launch an agent to start building on-chain KYA reputation and attestations."}
              </p>
            </section>

            {/* ── Stats grid ────────────────────────────────────── */}
            <section className="mt-4 grid grid-cols-3 gap-3">
              <Stat
                label="Reputation"
                value={hasAgent ? String(agent.reputationScore) : "—"}
                muted={!hasAgent}
              />
              <Stat
                label="Attestations"
                value={hasAgent ? String(agent.attestationCount) : "—"}
                muted={!hasAgent}
              />
              <Stat
                label="Tier"
                value={hasAgent ? agent.tier.toUpperCase() : "—"}
                muted={!hasAgent}
              />
            </section>

            {/* ── Capabilities ──────────────────────────────────── */}
            <section className="mt-4 rounded-3xl bg-card border border-border p-5">
              <p className="text-sm font-medium mb-3">Capabilities</p>
              <div className="space-y-3">
                <Cap
                  icon={<Sparkles className="size-4" />}
                  title="Autonomous payments"
                  sub="Within policy guardrails set by you"
                />
                <Cap
                  icon={<ShieldCheck className="size-4" />}
                  title="On-chain KYA verified"
                  sub={
                    hasAgent
                      ? `Portable identity · ${agent.attestationCount} attestations`
                      : "Portable identity — available once your agent is live"
                  }
                />
                <Cap
                  icon={<Sparkles className="size-4" />}
                  title="Cross-chain funded"
                  sub="Bridge from any chain via LI.FI"
                />
              </div>
            </section>

            {/* ── Share ─────────────────────────────────────────── */}
            <button
              type="button"
              disabled={!hasAgent}
              onClick={() => hasAgent && copyFn(agent.handle, "handle")}
              className={[
                "mt-2 w-full rounded-full py-4 font-medium border flex items-center justify-center gap-2 transition-colors",
                hasAgent
                  ? "bg-secondary text-foreground border-border hover:bg-secondary/80 cursor-pointer"
                  : "bg-secondary/40 text-muted-foreground border-border/60 cursor-not-allowed opacity-80",
              ].join(" ")}
            >
              {copied === "handle" ? (
                <>
                  <CheckCircle className="size-4 text-success" />
                  Copied!
                </>
              ) : (
                <>Share agent handle</>
              )}
            </button>
          </TabsContent>

          <TabsContent
            value="rules"
            className="mt-5 space-y-4 focus-visible:outline-none outline-none"
          >
            {/* ── Spending rules ────────────────────────────────── */}
            <h2 className="font-display text-2xl text-foreground">Spending rules</h2>
            <p className="text-sm text-muted-foreground mt-1 mb-6">
              Your agent can only do what these rules allow. Enforced on-chain.
            </p>

            <section className="rounded-3xl bg-card border border-border p-6">
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-medium">Daily limit</p>
                <p className="font-display text-4xl tabular">${dailyCap}</p>
              </div>
              <input
                type="range"
                min={10}
                max={500}
                step={5}
                value={dailyCap}
                onChange={(e) => setDailyCap(Number(e.target.value))}
                className="w-full mt-4 accent-[var(--ink)]"
              />
              <div className="flex justify-between text-xs text-muted-foreground tabular mt-1">
                <span>$10</span>
                <span>$500</span>
              </div>
              <div className="mt-4 flex gap-2 flex-wrap">
                {[25, 50, 100, 250].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setDailyCap(v)}
                    className={[
                      "px-3 py-1.5 rounded-full text-xs font-medium border",
                      dailyCap === v
                        ? "bg-ink text-ink-foreground border-ink"
                        : "bg-secondary text-foreground border-border",
                    ].join(" ")}
                  >
                    ${v}
                  </button>
                ))}
              </div>
            </section>

            <section className="mt-4 rounded-3xl bg-card border border-border divide-y divide-border">
              <ToggleRow
                title="Verified recipients only"
                sub="Only allow payments to KYA-verified handles"
                value={verifiedOnly}
                onChange={setVerifiedOnly}
              />
              <ToggleRow
                title="Require my approval over $25"
                sub="Push notification before sending"
                value={requireApproval}
                onChange={setRequireApproval}
              />
              <ToggleRow
                title="Allow subscription renewals"
                sub="Whitelisted recurring merchants"
                value={allowSubs}
                onChange={setAllowSubs}
              />
            </section>

            <section className="mt-4 rounded-3xl bg-card border border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium">Verified recipients</p>
                <button type="button" className="text-xs text-muted-foreground">
                  Manage
                </button>
              </div>
              <ul className="space-y-2">
                {hasAgent ? (
                  [
                    { h: "@freelancer.oishi", t: "Designer" },
                    { h: "@cursor.app", t: "Subscription" },
                    { h: "@vercel.bill", t: "Subscription" },
                  ].map((r) => (
                    <li key={r.h} className="flex items-center gap-3 py-1">
                      <span className="size-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                        <Check className="size-4" strokeWidth={2.5} />
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{r.h}</p>
                        <p className="text-xs text-muted-foreground">{r.t}</p>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="py-8 text-center">
                    <p className="text-sm text-muted-foreground">No verified recipients yet</p>
                    <p className="text-xs text-muted-foreground/80 mt-1">
                      Appear here once you have an agent and approved handles.
                    </p>
                  </li>
                )}
              </ul>
            </section>

            <button
              type="button"
              disabled={!hasAgent}
              className={[
                "mt-6 w-full rounded-full bg-ink text-ink-foreground py-4 font-medium transition-opacity",
                !hasAgent && "opacity-40 cursor-not-allowed",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              Save rules on-chain
            </button>
          </TabsContent>
        </Tabs>
      </LayoutGroup>
    </AppPage>
  );
}

// ── Sub-components ─────────────────────────────────────────────
function tierColor(tier: AgentIdentity["tier"]) {
  const colors = { gold: "#f59e0b", green: "#22c55e", yellow: "#eab308", red: "#ef4444" };
  return colors[tier];
}

function TierBadge({ tier }: { tier: AgentIdentity["tier"] }) {
  const colors = {
    gold: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    green: "bg-green-500/15 text-green-400 border-green-500/30",
    yellow: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    red: "bg-red-500/15 text-red-400 border-red-500/30",
  };

  return (
    <span className={`mb-2 px-2.5 py-0.5 rounded-full border text-xs font-medium ${colors[tier]}`}>
      Tier {tier.toUpperCase()}
    </span>
  );
}

function Stat({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-4 text-center">
      <p
        className={["font-display text-2xl tabular", muted ? "text-muted-foreground" : ""].join(
          " ",
        )}
      >
        {value}
      </p>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function Cap({ icon, title, sub }: { icon: ReactNode; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="size-9 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
        {icon}
      </span>
      <div className="flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
    </div>
  );
}

function ToggleRow({
  title,
  sub,
  value,
  onChange,
}: {
  title: string;
  sub: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 p-5">
      <div className="flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
      </div>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}
