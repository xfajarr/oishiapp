import { createFileRoute } from "@tanstack/react-router";
import { useWallet } from "@solana/wallet-adapter-react";
import { AppPage } from "@/components/app-page";
import {
  CircleCheck,
  CircleX,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  Wallet,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { useRecentTransactions } from "@/hooks/use-solana-data";

const SOLSCAN_BASE =
  "https://solscan.io/tx/";

export const Route = createFileRoute("/_app/activity")({
  head: () => ({
    meta: [
      { title: "Activity — Oishi" },
      {
        name: "description",
        content: "On-chain log of every action your agent takes on Solana.",
      },
    ],
  }),
  component: ActivityPage,
});

function ActivityPage() {
  const { publicKey, connected } = useWallet();
  const { data: txs, isLoading } = useRecentTransactions(publicKey ?? null, 20);

  // ── No wallet ────────────────────────────────────────────
  if (!connected) {
    return (
      <AppPage subtitle="on-chain" title="Activity">
        <section className="mt-12 text-center">
          <div className="mx-auto size-16 rounded-full bg-secondary flex items-center justify-center">
            <Wallet className="size-7 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-lg font-semibold">Connect your wallet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect to see your agent's transaction history.
          </p>
        </section>
      </AppPage>
    );
  }

  // ── Loading ─────────────────────────────────────────────
  if (isLoading && !txs) {
    return (
      <AppPage subtitle="on-chain" title="Activity">
        <section className="mt-8 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-card animate-pulse h-20" />
          ))}
        </section>
      </AppPage>
    );
  }

  // ── Empty ────────────────────────────────────────────────
  if (!txs || txs.length === 0) {
    return (
      <AppPage subtitle="on-chain" title="Activity">
        <section className="mt-12 text-center">
          <div className="mx-auto size-16 rounded-full bg-secondary flex items-center justify-center">
            <Sparkles className="size-7 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-lg font-semibold">No activity yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your agent hasn't made any transactions yet. Fund your agent to get started.
          </p>
        </section>
      </AppPage>
    );
  }

  // ── Group transactions by date ───────────────────────────
  const groups = txs.reduce<Record<string, typeof txs>>((acc, tx) => {
    const date = tx.blockTime
      ? new Date(tx.blockTime * 1000).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      : "Unknown";
    (acc[date] ??= []).push(tx);
    return acc;
  }, {});

  // Status tag for display
  const isConfirmed = (tx: (typeof txs)[0]) => tx.err === null;
  const isFailed = (tx: (typeof txs)[0]) => tx.err !== null;

  return (
    <AppPage subtitle="on-chain" title="Activity">
      <p className="text-sm text-muted-foreground mt-1 mb-5">
        Every move your agent makes — signed and verified on Solana.
      </p>

      {Object.entries(groups).map(([group, list]) => (
        <div key={group} className="mb-6">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2 px-1">
            {group}
          </p>
          <ul className="space-y-2">
            {list.map((tx) => (
              <li key={tx.signature} className="rounded-2xl bg-card border border-border p-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`size-10 rounded-full flex items-center justify-center ${
                      isFailed(tx)
                        ? "bg-destructive text-destructive-foreground"
                        : "bg-success text-success-foreground"
                    }`}
                  >
                    {isFailed(tx) ? (
                      <CircleX className="size-5" strokeWidth={2.2} />
                    ) : (
                      <CircleCheck className="size-5" strokeWidth={2.2} />
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {isFailed(tx) ? "Failed transaction" : "Confirmed transaction"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {tx.memo ?? (tx.confirmationStatus === "finalized" ? "Finalized" : "Confirmed")}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {isFailed(tx) ? "Failed" : "Confirmed"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {tx.blockTime
                        ? new Date(tx.blockTime * 1000).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })
                        : ""}
                    </p>
                  </div>
                </div>
                {tx.signature && (
                  <a
                    href={`${SOLSCAN_BASE}${tx.signature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 pt-3 border-t border-border flex items-center justify-between hover:opacity-80 transition-opacity"
                  >
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      tx
                    </span>
                    <span className="font-mono text-xs text-foreground inline-flex items-center gap-1">
                      {tx.signature.slice(0, 4)}…{tx.signature.slice(-4)}
                      <ExternalLink className="size-3" />
                    </span>
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </AppPage>
  );
}
