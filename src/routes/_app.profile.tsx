import { createFileRoute } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { AppPage } from "@/components/app-page";
import { Switch } from "@/components/ui/switch";
import { Check, Copy, Sparkles, ShieldCheck, Trophy } from "lucide-react";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Oishi" },
      {
        name: "description",
        content: "Your agent identity, KYA reputation, and programmable spending rules in one place.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const [dailyCap, setDailyCap] = useState(50);
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [requireApproval, setRequireApproval] = useState(false);
  const [allowSubs, setAllowSubs] = useState(true);

  return (
    <AppPage subtitle="identity & rules" title="Profile">
      <section className="mt-2 rounded-3xl bg-card border border-border p-6 text-center">
        <div className="mx-auto size-20 rounded-full bg-ink text-ink-foreground flex items-center justify-center font-display text-3xl">
          a
        </div>
        <p className="mt-4 font-display text-3xl">@alice.oishi</p>
        <p className="text-xs text-muted-foreground mt-1">Solana identity · since May 2026</p>

        <button
          type="button"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-xs font-mono"
        >
          7Hk2…q9PfR <Copy className="size-3" />
        </button>
      </section>

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

      <section className="mt-4 grid grid-cols-3 gap-3">
        <Stat label="Payments" value="142" />
        <Stat label="On-time" value="100%" />
        <Stat label="Disputes" value="0" />
      </section>

      <section className="mt-4 rounded-3xl bg-card border border-border p-5">
        <p className="text-sm font-medium mb-3">Capabilities</p>
        <div className="space-y-3">
          <Cap
            icon={<Sparkles className="size-4" />}
            title="Negotiate prices"
            sub="Up to 15% off list"
          />
          <Cap
            icon={<ShieldCheck className="size-4" />}
            title="Pay freelancers"
            sub="Verified handles only"
          />
          <Cap
            icon={<Sparkles className="size-4" />}
            title="Manage subscriptions"
            sub="Auto-cancel unused"
          />
        </div>
      </section>

      <button
        type="button"
        className="mt-6 w-full rounded-full bg-secondary text-foreground py-4 font-medium border border-border"
      >
        Share agent handle
      </button>

      <h2 className="mt-10 font-display text-2xl text-foreground">Spending rules</h2>
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
          {[
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
          ))}
        </ul>
      </section>

      <button type="button" className="mt-6 w-full rounded-full bg-ink text-ink-foreground py-4 font-medium">
        Save rules on-chain
      </button>
    </AppPage>
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
