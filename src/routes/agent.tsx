import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Copy, Sparkles, ShieldCheck, Trophy } from "lucide-react";

export const Route = createFileRoute("/agent")({
  head: () => ({
    meta: [
      { title: "Agent profile — Hoshi" },
      { name: "description", content: "Your agent's identity, KYA reputation, and on-chain history." },
    ],
  }),
  component: AgentPage,
});

function AgentPage() {
  return (
    <AppShell subtitle="identity" title="Your agent">
      {/* Identity card */}
      <section className="mt-2 rounded-3xl bg-card border border-border p-6 text-center">
        <div className="mx-auto size-20 rounded-full bg-ink text-ink-foreground flex items-center justify-center font-display text-3xl">
          a
        </div>
        <p className="mt-4 font-display text-3xl">@alice.hoshi</p>
        <p className="text-xs text-muted-foreground mt-1">Solana identity · since May 2026</p>

        <button className="mt-4 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-xs font-mono">
          7Hk2…q9PfR <Copy className="size-3" />
        </button>
      </section>

      {/* KYA score */}
      <section className="mt-4 rounded-3xl bg-ink text-ink-foreground p-6">
        <div className="flex items-center gap-2">
          <Trophy className="size-4 text-accent" />
          <span className="text-xs uppercase tracking-[0.18em] text-ink-foreground/60">
            KYA reputation
          </span>
        </div>
        <div className="mt-3 flex items-end gap-3">
          <p className="font-display text-7xl leading-none tabular">824</p>
          <span className="mb-2 px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-xs font-medium">
            Tier A
          </span>
        </div>
        <p className="text-sm text-ink-foreground/60 mt-2">
          Trusted by 14 merchants and 3 banks for agent-to-agent payments.
        </p>
      </section>

      {/* Stats */}
      <section className="mt-4 grid grid-cols-3 gap-3">
        <Stat label="Payments" value="142" />
        <Stat label="On-time" value="100%" />
        <Stat label="Disputes" value="0" />
      </section>

      {/* Capabilities */}
      <section className="mt-4 rounded-3xl bg-card border border-border p-5">
        <p className="text-sm font-medium mb-3">Capabilities</p>
        <div className="space-y-3">
          <Cap icon={<Sparkles className="size-4" />} title="Negotiate prices" sub="Up to 15% off list" />
          <Cap icon={<ShieldCheck className="size-4" />} title="Pay freelancers" sub="Verified handles only" />
          <Cap icon={<Sparkles className="size-4" />} title="Manage subscriptions" sub="Auto-cancel unused" />
        </div>
      </section>

      <button className="mt-6 w-full rounded-full bg-ink text-ink-foreground py-4 font-medium">
        Share agent handle
      </button>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-4 text-center">
      <p className="font-display text-2xl tabular">{value}</p>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function Cap({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
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
