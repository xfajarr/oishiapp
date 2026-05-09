import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { ArrowRight, Check } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/fund")({
  head: () => ({
    meta: [
      { title: "Fund agent — Hoshi" },
      { name: "description", content: "Bridge funds from Arbitrum to your agent's Solana wallet via LI.FI." },
    ],
  }),
  component: FundPage,
});

function FundPage() {
  const [amount, setAmount] = useState("500");
  const navigate = useNavigate();

  return (
    <AppShell subtitle="bridge · li.fi" title="Fund agent">
      <p className="text-sm text-muted-foreground mt-1 mb-6">
        Move USDC from Arbitrum to your agent's Solana wallet.
      </p>

      <section className="rounded-3xl bg-card border border-border p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Amount (USDC)</p>
        <input
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
          className="w-full mt-2 bg-transparent font-display text-6xl tabular outline-none"
        />
        <div className="mt-4 flex gap-2">
          {["100", "250", "500", "1000"].map((v) => (
            <button
              key={v}
              onClick={() => setAmount(v)}
              className={[
                "px-3 py-1.5 rounded-full text-xs font-medium border",
                amount === v
                  ? "bg-ink text-ink-foreground border-ink"
                  : "bg-secondary text-foreground border-border",
              ].join(" ")}
            >
              ${v}
            </button>
          ))}
        </div>
      </section>

      {/* Route */}
      <section className="mt-4 rounded-3xl bg-card border border-border p-5">
        <p className="text-sm font-medium mb-4">Route</p>
        <div className="flex items-center justify-between gap-3">
          <Leg label="Arbitrum" sub="ETH" />
          <ArrowRight className="size-4 text-muted-foreground shrink-0" />
          <Leg label="LI.FI" sub="bridge" />
          <ArrowRight className="size-4 text-muted-foreground shrink-0" />
          <Leg label="Solana" sub="USDC" highlight />
        </div>

        <ul className="mt-5 space-y-2 text-sm">
          <Row k="Estimated time" v="~28s" />
          <Row k="Network fee" v="$0.42" />
          <Row k="You receive" v={`${amount || "0"} USDC`} bold />
        </ul>
      </section>

      <button
        onClick={() => navigate({ to: "/activity" })}
        className="mt-6 w-full rounded-full bg-ink text-ink-foreground py-4 font-medium inline-flex items-center justify-center gap-2"
      >
        <Check className="size-4" /> Confirm bridge
      </button>
    </AppShell>
  );
}

function Leg({ label, sub, highlight }: { label: string; sub: string; highlight?: boolean }) {
  return (
    <div
      className={[
        "flex-1 rounded-2xl px-3 py-3 text-center",
        highlight ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground",
      ].join(" ")}
    >
      <p className="text-xs font-medium">{label}</p>
      <p className="text-[10px] uppercase tracking-widest opacity-70 mt-0.5">{sub}</p>
    </div>
  );
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <li className="flex items-center justify-between">
      <span className="text-muted-foreground">{k}</span>
      <span className={bold ? "font-medium tabular" : "tabular"}>{v}</span>
    </li>
  );
}
