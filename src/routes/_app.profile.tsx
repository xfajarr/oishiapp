import { createFileRoute, Link } from "@tanstack/react-router";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState, useCallback, useEffect, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LayoutGroup } from "framer-motion";
import { AppPage } from "@/components/app-page";
import { TabPillBg } from "@/components/tab-pill-bg";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Copy,
  Sparkles,
  ShieldCheck,
  Trophy,
  Bot,
  CheckCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { useAgentByOwner, getTier, type AgentIdentity } from "@/hooks/use-solana-data";
import { useOishiBackend } from "@/hooks/use-oishi-backend";
import { fetchStrategies, type BackendAgent } from "@/lib/oishi-api";
import { cn } from "@/lib/utils";

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

const AGENTS_QUERY_KEY = (wallet: string | undefined) =>
  ["oishi", "backend-agents", wallet] as const;

function ProfilePage() {
  const { publicKey, connected } = useWallet();
  const walletBp = publicKey?.toBase58();
  const { api, isReady: backendReady } = useOishiBackend();

  const { data: chainAgent } = useAgentByOwner(publicKey ?? null);

  const queryClient = useQueryClient();
  const { data: agents = [], isLoading: agentsLoading } = useQuery({
    queryKey: AGENTS_QUERY_KEY(walletBp),
    queryFn: async () => {
      if (!api) return [];
      return api.listAgents();
    },
    enabled: backendReady && !!api && !!walletBp,
    staleTime: 10_000,
  });

  const { data: strategies = [] } = useQuery({
    queryKey: ["oishi", "strategies"],
    queryFn: fetchStrategies,
    staleTime: 60_000,
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

  const selected = agents.find((a) => a.id === selectedAgentId) ?? null;

  const [draftCommon, setDraftCommon] = useState<BackendAgent["commonRules"] | null>(null);

  useEffect(() => {
    if (!selected) {
      setDraftCommon(null);
      return;
    }
    setDraftCommon({ ...selected.commonRules });
  }, [selected?.id, selected?.updatedAt]);

  const [copied, setCopied] = useState<string | null>(null);
  const [profileTab, setProfileTab] = useState("kya");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const copyFn = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    });
  }, []);

  const saveRulesMutation = useMutation({
    mutationFn: async (payload: {
      agentId: string;
      common: BackendAgent["commonRules"];
      specific: BackendAgent["specificRules"];
    }) => {
      if (!api) throw new Error("Not signed in");
      return api.updateAgentRules(payload.agentId, {
        commonRules: payload.common,
        specificRules: payload.specific,
      });
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(
        AGENTS_QUERY_KEY(walletBp),
        (old: BackendAgent[] | undefined) =>
          !old ? [updated] : old.map((a) => (a.id === updated.id ? updated : a)),
      );
      queryClient.invalidateQueries({ queryKey: ["oishi", "backend-agents"] });
      setDraftCommon({ ...updated.commonRules });
      setSaveMessage("Rules saved.");
      setTimeout(() => setSaveMessage(null), 4000);
    },
    onError: (err: unknown) => {
      setSaveMessage(err instanceof Error ? err.message : "Save failed");
    },
  });

  const hasWallet = connected && !!publicKey;
  const hasAgent = !!selected;

  /** Prefer live on-chain KYA when available; fallback to backend scores. */
  const displayScore =
    chainAgent?.reputationScore ?? selected?.kyaReputationScore ?? null;
  const displayAttestations =
    chainAgent?.attestationCount ?? selected?.attestationCount ?? null;
  const displayTier: AgentIdentity["tier"] | null = chainAgent
    ? chainAgent.tier
    : selected != null
      ? getTier(selected.kyaReputationScore)
      : null;

  const strategyMeta = selected
    ? strategies.find((s) => s.id === selected.strategyId)
    : null;

  const kyaSourceLabel = chainAgent ? "Live on-chain KYA" : "Oishi backend sync";

  const showSkeleton =
    hasWallet &&
    backendReady &&
    agentsLoading &&
    agents.length === 0 &&
    !selectedAgentId;

  const handleSaveRules = () => {
    if (!selected || !draftCommon) return;
    setSaveMessage(null);
    saveRulesMutation.mutate({
      agentId: selected.id,
      common: draftCommon,
      specific: selected.specificRules,
    });
  };

  const rulesDirty =
    selected &&
    draftCommon &&
    (draftCommon.dailyCapUsd !== selected.commonRules.dailyCapUsd ||
      draftCommon.maxPerTxUsd !== selected.commonRules.maxPerTxUsd ||
      draftCommon.notifyOnBlock !== selected.commonRules.notifyOnBlock ||
      draftCommon.quietHoursEnabled !== selected.commonRules.quietHoursEnabled);

  if (!hasWallet) {
    return (
      <AppPage subtitle="agent & guardrails" title="Profile">
        <section className="mt-12 text-center rounded-3xl bg-card border border-border p-8">
          <Bot className="mx-auto size-12 text-muted-foreground mb-4" aria-hidden />
          <p className="text-sm font-medium">Connect your wallet</p>
          <p className="text-xs text-muted-foreground mt-2">
            Profile loads your agents and rules from your Oishi account.
          </p>
        </section>
      </AppPage>
    );
  }

  if (!backendReady) {
    return (
      <AppPage subtitle="agent & guardrails" title="Profile">
        <p className="text-sm text-muted-foreground text-center py-16">
          Signing you in…
        </p>
      </AppPage>
    );
  }

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
          <TabsList className="flex h-11 w-full gap-1 rounded-xl bg-muted/80 p-1 h-auto border border-border relative">
            <TabsTrigger
              value="kya"
              className="relative z-10 flex min-h-0 flex-1 basis-0 items-center justify-center rounded-lg py-2.5 px-2 text-xs sm:text-sm text-center overflow-hidden data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <TabPillBg
                show={profileTab === "kya"}
                layoutId="profile-seg-pill"
                className="rounded-lg"
              />
              <span className="relative z-10 leading-tight">Agent (KYA)</span>
            </TabsTrigger>
            <TabsTrigger
              value="rules"
              className="relative z-10 flex min-h-0 flex-1 basis-0 items-center justify-center rounded-lg py-2.5 px-2 text-xs sm:text-sm text-center overflow-hidden data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <TabPillBg
                show={profileTab === "rules"}
                layoutId="profile-seg-pill"
                className="rounded-lg"
              />
              <span className="relative z-10 leading-tight">Rules</span>
            </TabsTrigger>
          </TabsList>

          {/* Agent picker (shown above tab content when needed) */}
          {agents.length > 0 ? (
            <div className="mt-5 rounded-3xl bg-card border border-border p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">
                Active profile
              </p>
              {agents.length === 1 ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{selected?.displayName}</span>
                  {selected?.status ? <StatusBadge status={selected.status} /> : null}
                </div>
              ) : (
                <Select
                  value={selectedAgentId ?? ""}
                  onValueChange={(id) => setSelectedAgentId(id)}
                >
                  <SelectTrigger className="rounded-2xl border-border bg-background h-11 w-full">
                    <SelectValue placeholder="Choose agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        <span className="flex flex-col gap-0.5 text-left py-0.5">
                          <span className="font-medium">{a.displayName}</span>
                          <span className="text-[11px] text-muted-foreground font-mono">
                            {a.handle}
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ) : null}

          <TabsContent
            value="kya"
            className="mt-5 space-y-4 focus-visible:outline-none outline-none"
          >
            {/* ── Identity card ──────────────────────────────────── */}
            <section className="rounded-3xl bg-card border border-border p-6 text-center">
              {selected ? (
                <>
                  <div className="mx-auto size-20 rounded-full bg-ink text-ink-foreground flex items-center justify-center font-display text-3xl uppercase">
                    {selected.displayName?.charAt(0) ?? selected.handle.charAt(1)}
                  </div>
                  <p className="mt-4 font-display text-2xl sm:text-3xl truncate px-2">
                    {selected.handle}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selected.displayName} · since{" "}
                    {new Date(selected.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                    {strategyMeta ? (
                      <Badge variant="secondary" className="rounded-full font-normal">
                        {strategyMeta.protocol} · {strategyMeta.name}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="rounded-full font-mono font-normal">
                        {selected.strategyId}
                      </Badge>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="mx-auto size-20 rounded-full bg-secondary text-muted-foreground flex items-center justify-center">
                    <Bot className="size-10" aria-hidden />
                  </div>
                  <p className="mt-4 font-display text-3xl text-muted-foreground">
                    No agent yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 px-4">
                    Launch an agent to claim your identity and KYA reputation.
                  </p>
                  <Link
                    to="/launch"
                    search={{ tab: "new" }}
                    className="mt-4 inline-flex rounded-full bg-ink text-ink-foreground px-6 py-2.5 text-sm font-medium"
                  >
                    Launch agent
                  </Link>
                </>
              )}

              <div className="mt-4 flex flex-col items-center gap-2">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Your wallet (owner)
                </p>
                <button
                  type="button"
                  onClick={() => copyFn(publicKey!.toBase58(), "address")}
                  className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-xs font-mono hover:bg-secondary/80 transition-colors"
                >
                  {publicKey!.toBase58().slice(0, 4)}…{publicKey!.toBase58().slice(-4)}
                  {copied === "address" ? (
                    <CheckCircle className="size-3 text-success" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                </button>
              </div>

              {selected?.walletPublicKey ? (
                <div className="mt-3 flex flex-col items-center gap-2">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Agent custodial Solana wallet
                  </p>
                  <button
                    type="button"
                    onClick={() => copyFn(selected.walletPublicKey, "custodian")}
                    className="inline-flex items-center gap-2 rounded-full bg-secondary/60 px-4 py-2 text-[11px] font-mono hover:bg-secondary transition-colors max-w-full"
                  >
                    <span className="truncate">
                      {selected.walletPublicKey.slice(0, 6)}…{selected.walletPublicKey.slice(-6)}
                    </span>
                    {copied === "custodian" ? (
                      <CheckCircle className="size-3 shrink-0 text-success" />
                    ) : (
                      <Copy className="size-3 shrink-0" />
                    )}
                  </button>
                  <a
                    href={`https://explorer.solana.com/address/${encodeURIComponent(selected.walletPublicKey)}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-muted-foreground inline-flex items-center gap-1 hover:underline"
                  >
                    Explorer <ExternalLink className="size-3" />
                  </a>
                </div>
              ) : null}
            </section>

            {/* ── KYA reputation ────────────────────────────────── */}
            <section className="mt-4 rounded-3xl bg-ink text-ink-foreground p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Trophy className="size-4 text-accent" />
                  <span className="text-xs uppercase tracking-[0.18em] text-ink-foreground/60">
                    KYA reputation
                  </span>
                </div>
                <span className="text-[10px] text-ink-foreground/45">{kyaSourceLabel}</span>
              </div>
              <div className="mt-3 flex items-end gap-3 flex-wrap">
                <p className="font-display text-7xl leading-none tabular text-ink-foreground/90">
                  {displayScore != null ? displayScore : "—"}
                </p>
                {displayTier ? (
                  <TierBadge tier={displayTier} />
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
                    width: `${displayScore != null ? Math.min(100, Math.max(0, displayScore)) : 0}%`,
                    backgroundColor: displayTier
                      ? tierColor(displayTier)
                      : "rgba(255,255,255,0.12)",
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
                {selected
                  ? `Backend: ${selected.attestationCount} attestations tracked · ${
                      displayAttestations != null
                        ? `Displaying ${displayAttestations} from ${chainAgent ? "chain" : "backend"}`
                        : "scores sync when available"
                    }`
                  : "Launch an agent to start building reputation and attestations."}
              </p>
            </section>

            {/* ── Stats grid ────────────────────────────────────── */}
            <section className="grid grid-cols-3 gap-3">
              <Stat
                label="Reputation"
                value={displayScore != null ? String(displayScore) : "—"}
                muted={!selected}
              />
              <Stat
                label="Attestations"
                value={displayAttestations != null ? String(displayAttestations) : "—"}
                muted={!selected}
              />
              <Stat
                label="Tier"
                value={displayTier ? displayTier.toUpperCase() : "—"}
                muted={!selected}
              />
            </section>

            {selected ? (
              <section className="rounded-3xl bg-card border border-border p-4 grid grid-cols-3 gap-2 text-center">
                <Stat label="Cycles" value={String(selected.cycleCount)} muted={false} />
                <Stat label="Tx · backend" value={String(selected.totalTxCount)} muted={false} />
                <Stat
                  label="Earnings"
                  value={`$${Math.round(selected.totalEarnings)}`}
                  muted={false}
                />
              </section>
            ) : null}

            {/* ── Capabilities ──────────────────────────────────── */}
            <section className="rounded-3xl bg-card border border-border p-5">
              <p className="text-sm font-medium mb-3">Capabilities</p>
              <div className="space-y-3">
                <Cap
                  icon={<Sparkles className="size-4" />}
                  title="Automation"
                  sub={
                    strategyMeta
                      ? `${strategyMeta.name} (${strategyMeta.risk} risk)`
                      : "Configured per deployed strategy"
                  }
                />
                <Cap
                  icon={<ShieldCheck className="size-4" />}
                  title={chainAgent ? "On-chain KYA linked" : "KYA-backed profile"}
                  sub={
                    chainAgent
                      ? "Wallet index resolves to live KYA identity on Solana."
                      : "Reputation fields sync through Oishi; connect on-chain KYA when available."
                  }
                />
                <Cap
                  icon={<Sparkles className="size-4" />}
                  title="Cross-chain funded"
                  sub="Deposit via /fund — SOL native or LI.FI bridge to this agent wallet."
                />
              </div>
            </section>

            <button
              type="button"
              disabled={!hasAgent}
              onClick={() => selected && copyFn(selected.handle, "handle")}
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
                <>Copy agent handle</>
              )}
            </button>

            {selected?.kyaIdentityPda ? (
              <button
                type="button"
                onClick={() => copyFn(selected.kyaIdentityPda!, "pda")}
                className="w-full rounded-full border border-border py-3 text-xs font-mono text-muted-foreground hover:bg-secondary transition-colors inline-flex items-center justify-center gap-2"
              >
                {copied === "pda" ? (
                  <>
                    <Check className="size-3 text-success" /> KYA PDA copied
                  </>
                ) : (
                  <>
                    Copy KYA PDA · {selected.kyaIdentityPda.slice(0, 6)}…
                  </>
                )}
              </button>
            ) : null}
          </TabsContent>

          <TabsContent
            value="rules"
            className="mt-5 space-y-4 focus-visible:outline-none outline-none"
          >
            <h2 className="font-display text-2xl text-foreground">Spending rules</h2>
            <p className="text-sm text-muted-foreground mt-1 mb-2">
              Limits enforced by your backend agent policy. Saves to your Oishi account (API).
            </p>

            {!selected || !draftCommon ? (
              <section className="rounded-3xl bg-card border border-border p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Launch an agent to configure daily caps and notifications.
                </p>
              </section>
            ) : (
              <>
                <section className="rounded-3xl bg-card border border-border p-6 space-y-6">
                  <div>
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-medium">Daily USD cap</p>
                      <p className="font-display text-4xl tabular">${draftCommon.dailyCapUsd}</p>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={10000}
                      step={5}
                      value={Math.min(10000, Math.max(5, draftCommon.dailyCapUsd))}
                      onChange={(e) =>
                        setDraftCommon((d) =>
                          d ? { ...d, dailyCapUsd: Number(e.target.value) } : d,
                        )
                      }
                      className="w-full mt-4 accent-[var(--ink)]"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground tabular mt-1">
                      <span>$5</span>
                      <span>$10k</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-medium">Max per tx (USD)</p>
                      <p className="font-display text-3xl tabular">${draftCommon.maxPerTxUsd}</p>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5000}
                      step={1}
                      value={Math.min(5000, Math.max(1, draftCommon.maxPerTxUsd))}
                      onChange={(e) =>
                        setDraftCommon((d) =>
                          d ? { ...d, maxPerTxUsd: Number(e.target.value) } : d,
                        )
                      }
                      className="w-full mt-4 accent-[var(--ink)]"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground tabular mt-1">
                      <span>$1</span>
                      <span>$5000</span>
                    </div>
                  </div>
                </section>

                <section className="rounded-3xl bg-card border border-border divide-y divide-border">
                  <ToggleRow
                    title="Notify when a trade is blocked"
                    sub={selected.commonRules.notifyOnBlock ? "On in production" : "Policy alerts"}
                    value={draftCommon.notifyOnBlock}
                    onChange={(v) =>
                      setDraftCommon((d) => (d ? { ...d, notifyOnBlock: v } : d))
                    }
                  />
                  <ToggleRow
                    title="Quiet hours (preference)"
                    sub="Honor off-hours routing when your runtime supports it"
                    value={draftCommon.quietHoursEnabled}
                    onChange={(v) =>
                      setDraftCommon((d) =>
                        d ? { ...d, quietHoursEnabled: v } : d,
                      )
                    }
                  />
                </section>

                <section className="rounded-3xl bg-card border border-border p-5">
                  <p className="text-sm font-medium mb-3">Strategy parameters</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Per-strategy flags (read-only here). Adjustable from launch flow later.
                  </p>
                  <ul className="space-y-2">
                    {Object.entries(selected.specificRules).length === 0 ? (
                      <li className="text-xs text-muted-foreground py-4 text-center">
                        No specific overrides
                      </li>
                    ) : (
                      Object.entries(selected.specificRules).map(([key, val]) => (
                        <li
                          key={key}
                          className="flex items-center justify-between gap-3 py-2 border-b border-border/60 last:border-0 text-sm"
                        >
                          <span className="text-muted-foreground font-mono text-xs">{key}</span>
                          <span className="tabular font-medium">{String(val)}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </section>

                <div className="space-y-2">
                  {saveMessage ? (
                    <p
                      className={cn(
                        "text-center text-xs",
                        saveMessage === "Rules saved." ? "text-success" : "text-destructive",
                      )}
                    >
                      {saveMessage}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    disabled={saveRulesMutation.isPending || !rulesDirty}
                    onClick={handleSaveRules}
                    className={cn(
                      "w-full rounded-full bg-ink text-ink-foreground py-4 font-medium transition-opacity inline-flex items-center justify-center gap-2",
                      (!rulesDirty || saveRulesMutation.isPending) &&
                        "opacity-50 cursor-not-allowed pointer-events-none",
                    )}
                  >
                    {saveRulesMutation.isPending ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      "Save rules"
                    )}
                  </button>
                  {!rulesDirty ? (
                    <p className="text-center text-[10px] text-muted-foreground">
                      Edit sliders or toggles to enable save
                    </p>
                  ) : null}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </LayoutGroup>
    </AppPage>
  );
}

function StatusBadge({
  status,
}: {
  status: BackendAgent["status"];
}) {
  const styles: Record<BackendAgent["status"], string> = {
    active: "bg-green-500/15 text-green-600 border-green-500/25",
    paused: "bg-amber-500/15 text-amber-700 border-amber-500/25",
    stopped: "bg-muted text-muted-foreground border-border",
    blocked: "bg-destructive/15 text-destructive border-destructive/25",
  };
  return (
    <Badge variant="outline" className={cn("rounded-full capitalize text-[10px]", styles[status])}>
      {status}
    </Badge>
  );
}

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
    <div className="rounded-2xl bg-card border border-border p-4 text-center min-w-0">
      <p
        className={cn(
          "font-display text-xl sm:text-2xl tabular truncate",
          muted ? "text-muted-foreground" : "",
        )}
      >
        {value}
      </p>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1 leading-tight">
        {label}
      </p>
    </div>
  );
}

function Cap({ icon, title, sub }: { icon: ReactNode; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="size-9 rounded-full bg-accent text-accent-foreground flex items-center justify-center shrink-0">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{sub}</p>
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
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
      </div>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}
