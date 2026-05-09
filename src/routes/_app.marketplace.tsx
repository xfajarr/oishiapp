"use client";

import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppPage } from "@/components/app-page";
import { StrategyPickerCard } from "@/components/strategy/strategy-picker-card";
import { AGENT_STRATEGIES } from "@/data/agent-strategies";

export const Route = createFileRoute("/_app/marketplace")({
  head: () => ({
    meta: [
      { title: "Strategy marketplace — Oishi" },
      {
        name: "description",
        content: "Browse agent strategies: Polymarket, Meteora, Kamino, Sanctum, Drift, Jupiter, and more.",
      },
    ],
  }),
  component: MarketplacePage,
});

function MarketplacePage() {
  const [category, setCategory] = useState<string>("all");
  const categories = useMemo(() => {
    const s = new Set(AGENT_STRATEGIES.map((x) => x.category));
    return ["all", ...Array.from(s).sort()];
  }, []);

  const list = useMemo(
    () =>
      category === "all"
        ? AGENT_STRATEGIES
        : AGENT_STRATEGIES.filter((x) => x.category === category),
    [category],
  );

  return (
    <AppPage
      title="Strategy marketplace"
      subtitle="Pick a playbook"
      right={
        <span className="text-xs font-medium text-muted-foreground tabular">
          {list.length} live
        </span>
      }
    >
      <p className="-mt-2 mb-4 text-sm text-muted-foreground leading-relaxed">
        Each strategy ships with protocol-specific guardrails. Common vault limits still apply before anything
        hits the chain.
      </p>

      <div className="flex flex-wrap gap-2 mb-5">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={[
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors border",
              category === c
                ? "bg-primary text-primary-foreground border-transparent"
                : "bg-card text-muted-foreground border-border hover:text-foreground",
            ].join(" ")}
          >
            {c === "all" ? "All" : c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {list.map((strategy) => (
          <StrategyPickerCard key={strategy.id} strategy={strategy} mode="marketplace" />
        ))}
      </div>
    </AppPage>
  );
}
