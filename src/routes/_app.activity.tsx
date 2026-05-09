import { createFileRoute } from "@tanstack/react-router";
import { AppPage } from "@/components/app-page";
import { CircleCheck, CircleX, Wallet, ArrowDownLeft, ArrowUpRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_app/activity")({
  head: () => ({
    meta: [
      { title: "Activity — Oishi" },
      {
        name: "description",
        content: "Transparent, on-chain log of every action your agent takes.",
      },
    ],
  }),
  component: ActivityPage,
});

type Item = {
  id: string;
  group: string;
  status: "approved" | "blocked" | "funded" | "info";
  title: string;
  sub: string;
  amount?: string;
  time: string;
  hash?: string;
};

const items: Item[] = [
  {
    id: "1",
    group: "Today",
    status: "approved",
    title: "Sent $30 to @freelancer.oishi",
    sub: "Within rules · verified recipient",
    amount: "-$30.00",
    time: "Just now",
    hash: "5Hx8…fQ2A",
  },
  {
    id: "2",
    group: "Today",
    status: "blocked",
    title: "Send $100 attempted",
    sub: "Blocked — daily cap $50 exceeded",
    amount: "—",
    time: "2 min ago",
    hash: "9aV1…7bD3",
  },
  {
    id: "3",
    group: "Today",
    status: "funded",
    title: "Bridged from Arbitrum",
    sub: "LI.FI · 0.18 ETH → 500 USDC",
    amount: "+$500.00",
    time: "1 hr ago",
    hash: "aM4q…0kRz",
  },
  {
    id: "4",
    group: "Yesterday",
    status: "info",
    title: "KYA score increased",
    sub: "On-time payment streak · +6",
    time: "Yesterday",
  },
  {
    id: "5",
    group: "Yesterday",
    status: "approved",
    title: "Renewed @cursor.app",
    sub: "Subscription · whitelisted",
    amount: "-$20.00",
    time: "Yesterday",
    hash: "Qq77…M0pL",
  },
];

function ActivityPage() {
  const groups = items.reduce<Record<string, Item[]>>((acc, it) => {
    (acc[it.group] ??= []).push(it);
    return acc;
  }, {});

  return (
    <AppPage subtitle="on-chain" title="Activity">
      <p className="text-sm text-muted-foreground mt-1 mb-5">
        Every move your agent makes — visible, signed, reversible.
      </p>

      {Object.entries(groups).map(([group, list]) => (
        <div key={group} className="mb-6">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2 px-1">
            {group}
          </p>
          <ul className="space-y-2">
            {list.map((it) => (
              <Row key={it.id} item={it} />
            ))}
          </ul>
        </div>
      ))}
    </AppPage>
  );
}

function Row({ item }: { item: Item }) {
  const tone =
    item.status === "approved"
      ? { bg: "bg-success", fg: "text-success-foreground", Icon: CircleCheck }
      : item.status === "blocked"
        ? { bg: "bg-destructive", fg: "text-destructive-foreground", Icon: CircleX }
        : item.status === "funded"
          ? { bg: "bg-accent", fg: "text-accent-foreground", Icon: ArrowDownLeft }
          : { bg: "bg-secondary", fg: "text-foreground", Icon: Sparkles };

  const Icon = tone.Icon;
  const negative = item.amount?.startsWith("-");

  return (
    <li className="rounded-2xl bg-card border border-border p-4">
      <div className="flex items-center gap-3">
        <span
          className={`size-10 rounded-full flex items-center justify-center ${tone.bg} ${tone.fg}`}
        >
          <Icon className="size-5" strokeWidth={2.2} />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{item.title}</p>
          <p className="text-xs text-muted-foreground truncate">{item.sub}</p>
        </div>
        {item.amount && (
          <div className="text-right">
            <p
              className={`text-sm font-medium tabular ${negative ? "text-foreground" : "text-success"}`}
            >
              {item.amount}
            </p>
            <p className="text-xs text-muted-foreground">{item.time}</p>
          </div>
        )}
      </div>
      {item.hash && (
        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">tx</span>
          <span className="font-mono text-xs text-foreground inline-flex items-center gap-1">
            {item.hash} <ArrowUpRight className="size-3" />
          </span>
        </div>
      )}
    </li>
  );
}
