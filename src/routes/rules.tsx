import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Switch } from "@/components/ui/switch";
import { Check } from "lucide-react";

export const Route = createFileRoute("/rules")({
  head: () => ({
    meta: [
      { title: "Spending rules — Hoshi" },
      { name: "description", content: "Set programmable allowances and recipient rules for your AI agent." },
    ],
  }),
  component: RulesPage,
});

function RulesPage() {
  const [dailyCap, setDailyCap] = useState(50);
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [requireApproval, setRequireApproval] = useState(false);
  const [allowSubs, setAllowSubs] = useState(true);

  return (
    <AppShell subtitle="programmable" title="Spending rules">
      <p className="text-sm text-muted-foreground mt-1 mb-6">
        Your agent can only do what these rules allow. Enforced on-chain.
      </p>

      {/* Daily cap */}
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

        <div className="mt-4 flex gap-2">
          {[25, 50, 100, 250].map((v) => (
            <button
              key={v}
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

      {/* Toggles */}
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

      {/* Whitelist */}
      <section className="mt-4 rounded-3xl bg-card border border-border p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium">Verified recipients</p>
          <button className="text-xs text-muted-foreground">Manage</button>
        </div>
        <ul className="space-y-2">
          {[
            { h: "@freelancer.hoshi", t: "Designer" },
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

      <button className="mt-6 w-full rounded-full bg-ink text-ink-foreground py-4 font-medium">
        Save rules on-chain
      </button>
    </AppShell>
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
