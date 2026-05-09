import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, BadgeCheck, LayoutGrid, Plus, Wallet, CircleCheck, CircleX } from "lucide-react";
import { AppPage } from "@/components/app-page";

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
  return (
    <AppPage title="Good evening, Alice">
      {/* Agent balance card */}
      <section className="mt-2 rounded-3xl bg-ink text-ink-foreground p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-accent" />
            <span className="text-xs uppercase tracking-[0.18em] text-ink-foreground/60">
              Agent wallet
            </span>
          </div>
          <span className="text-xs font-mono text-ink-foreground/60">@alice.oishi</span>
        </div>

        <div className="mt-6">
          <p className="font-display text-6xl tabular leading-none">
            $1,284<span className="text-ink-foreground/40">.20</span>
          </p>
          <p className="mt-2 text-sm text-ink-foreground/60">daily cap $50</p>
        </div>

        {/* Daily cap progress */}
        <div className="mt-6">
          <div className="flex justify-between text-xs text-ink-foreground/60 mb-2">
            <span>Spent today</span>
            <span className="tabular">$30 / $50</span>
          </div>
          <div className="h-2 rounded-full bg-ink-foreground/10 overflow-hidden">
            <div className="h-full w-[60%] bg-accent rounded-full" />
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section className="mt-5 grid grid-cols-3 gap-3">
        <Link
          to="/fund"
          className="rounded-2xl bg-card p-3 flex flex-row items-center justify-center gap-2 border border-border min-w-0"
        >
          <span className="size-8 shrink-0 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
            <Plus className="size-4" strokeWidth={2.4} />
          </span>
          <span className="text-sm font-medium truncate">Fund</span>
        </Link>
        <Link
          to="/profile"
          className="rounded-2xl bg-card p-3 flex flex-row items-center justify-center gap-2 border border-border min-w-0"
        >
          <span className="size-8 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
            <BadgeCheck className="size-4" strokeWidth={2.35} />
          </span>
          <span className="text-sm font-medium truncate">Profile</span>
        </Link>
        <Link
          to="/marketplace"
          className="rounded-2xl bg-card p-3 flex flex-row items-center justify-center gap-2 border border-border min-w-0"
        >
          <span className="size-8 shrink-0 rounded-full bg-secondary text-foreground flex items-center justify-center">
            <LayoutGrid className="size-4" strokeWidth={2.2} />
          </span>
          <span className="text-sm font-medium truncate">Strategies</span>
        </Link>
      </section>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        Launch a new agent anytime from the center button in the bar below.
      </p>

      {/* KYA reputation */}
      <section className="mt-5 rounded-3xl bg-card border border-border p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              KYA reputation
            </p>
            <p className="font-display text-3xl mt-1">A · 824</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Last 30d</p>
            <p className="text-success font-medium tabular">+18</p>
          </div>
        </div>
        <div className="mt-4 flex gap-1">
          {Array.from({ length: 30 }).map((_, i) => (
            <span
              key={i}
              className={[
                "h-7 flex-1 rounded-sm",
                i % 11 === 0 ? "bg-secondary" : "bg-accent/80",
              ].join(" ")}
              style={{ opacity: 0.4 + (i / 30) * 0.6 }}
            />
          ))}
        </div>
      </section>

      {/* Recent activity */}
      <section className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-foreground">Recent activity</h2>
          <Link
            to="/activity"
            className="text-xs text-muted-foreground inline-flex items-center gap-1"
          >
            See all <ArrowUpRight className="size-3" />
          </Link>
        </div>

        <ul className="space-y-2">
          <ActivityRow
            status="approved"
            title="Sent to @freelancer.oishi"
            sub="Payment · within rules"
            amount="-$30.00"
            time="now"
          />
          <ActivityRow
            status="blocked"
            title="Send attempt $100"
            sub="Blocked · daily cap exceeded"
            amount="—"
            time="2m"
          />
          <ActivityRow
            status="funded"
            title="Bridged from Arbitrum"
            sub="LI.FI · ETH → USDC"
            amount="+$500.00"
            time="1h"
          />
        </ul>
      </section>
    </AppPage>
  );
}

function ActivityRow({
  status,
  title,
  sub,
  amount,
  time,
}: {
  status: "approved" | "blocked" | "funded";
  title: string;
  sub: string;
  amount: string;
  time: string;
}) {
  const tone =
    status === "approved"
      ? { bg: "bg-success", fg: "text-success-foreground", Icon: CircleCheck }
      : status === "blocked"
        ? { bg: "bg-destructive", fg: "text-destructive-foreground", Icon: CircleX }
        : { bg: "bg-accent", fg: "text-accent-foreground", Icon: Wallet };
  const Icon = tone.Icon;
  return (
    <li className="flex items-center gap-3 rounded-2xl bg-card border border-border p-3">
      <span
        className={`size-10 rounded-full flex items-center justify-center ${tone.bg} ${tone.fg}`}
      >
        <Icon className="size-5" strokeWidth={2.2} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{sub}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium tabular">{amount}</p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
    </li>
  );
}
