"use client";

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LayoutGroup } from "framer-motion";
import { Package, Wrench } from "lucide-react";
import { AppPage } from "@/components/app-page";
import { StrategyPickerCard } from "@/components/strategy/strategy-picker-card";
import { AGENT_SKILLS } from "@/data/agent-skills";
import { AGENT_STRATEGIES, getStrategy } from "@/data/agent-strategies";
import { AGENT_TOOLS, getTool } from "@/data/agent-tools";
import { TabPillBg } from "@/components/tab-pill-bg";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type TabType = "skills" | "strategies" | "tools";

/** Which skills bundle a given strategy/tool ID */
function skillsThatBundle(itemId: string, field: "bundledStrategies" | "bundledTools") {
  return AGENT_SKILLS.filter((s) => s[field].includes(itemId));
}

export const Route = createFileRoute("/_app/marketplace")({
  head: () => ({
    meta: [
      { title: "Marketplace — Oishi" },
      { name: "description", content: "Browse skills, strategies, and tools for your AI agent." },
    ],
  }),
  component: MarketplacePage,
});

function MarketplacePage() {
  const [tab, setTab] = useState<TabType>("skills");
  const navigate = useNavigate();

  return (
    <AppPage title="Marketplace" subtitle="Build your agent stack" right={null}>
      <LayoutGroup id="marketplace-tabs">
        <Tabs value={tab} onValueChange={(v) => setTab(v as TabType)} className="w-full">
          <TabsList className="w-full grid h-auto grid-cols-3 gap-1 rounded-xl p-1 relative">
            {(["skills", "strategies", "tools"] as const).map((t) => (
              <TabsTrigger
                key={t}
                value={t}
                className="relative z-10 rounded-lg py-2.5 text-xs sm:text-sm overflow-hidden data-[state=active]:bg-transparent data-[state=active]:shadow-none capitalize"
              >
                <TabPillBg show={tab === t} layoutId="mkt-seg-pill" className="rounded-lg" />
                <span className="relative z-10">{t}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="skills" className="mt-5 outline-none">
            <p className="text-sm text-muted-foreground mb-4">
              Skills are protocol integrations — choose what your agent will do on Solana. Each
              skill includes bundled strategies and tools at no extra cost.
            </p>
            <div className="grid grid-cols-1 gap-3">
              {AGENT_SKILLS.map((s) => (
                <StrategyPickerCard
                  key={s.id}
                  skill={s}
                  mode="marketplace"
                  onSelect={() =>
                    navigate({ to: "/launch", search: { strategy: s.id, tab: "new" } })
                  }
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="strategies" className="mt-5 outline-none">
            <p className="text-sm text-muted-foreground mb-4">
              Strategies give your agent superpowers — auto-compound, rebalance, arbitrage and more.
              Some are bundled free with specific skills.
            </p>
            <div className="grid grid-cols-1 gap-3">
              {AGENT_STRATEGIES.map((st) => {
                const includedIn = skillsThatBundle(st.id, "bundledStrategies");
                return (
                  <SkillToolCard
                    key={st.id}
                    name={st.name}
                    tagline={st.tagline}
                    description={st.description}
                    price={st.priceLabel}
                    risk={st.risk}
                    bundledBy={includedIn.map((s) => s.protocol)}
                  />
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="tools" className="mt-5 outline-none">
            <p className="text-sm text-muted-foreground mb-4">
              Tools are protocol integrations your agent can use — swaps, deposits, trades,
              payments. Some are bundled free with specific skills.
            </p>
            <div className="grid grid-cols-1 gap-3">
              {AGENT_TOOLS.map((t) => {
                const includedIn = skillsThatBundle(t.id, "bundledTools");
                return (
                  <SkillToolCard
                    key={t.id}
                    name={t.name}
                    tagline={t.tagline}
                    description={t.description}
                    price={t.priceLabel}
                    bundledBy={includedIn.map((s) => s.protocol)}
                  />
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </LayoutGroup>
    </AppPage>
  );
}

function SkillToolCard({
  name,
  tagline,
  description,
  price,
  risk,
  bundledBy,
}: {
  name: string;
  tagline: string;
  description: string;
  price: string;
  risk?: string;
  bundledBy?: string[];
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 flex items-start gap-3 hover:border-accent/30 transition-colors cursor-pointer">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium">{name}</p>
          {risk && (
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                risk === "low"
                  ? "bg-green-500/10 text-green-500"
                  : risk === "medium"
                    ? "bg-yellow-500/10 text-yellow-500"
                    : "bg-red-500/10 text-red-500",
              )}
            >
              {risk}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{tagline}</p>
        <p className="text-[11px] text-muted-foreground/70 mt-1">{description}</p>

        {/* Bundled-in skills */}
        {bundledBy && bundledBy.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {bundledBy.length > 0 && <Package className="size-3 text-muted-foreground shrink-0" />}
            {bundledBy.map((protocol) => (
              <span
                key={protocol}
                className="inline-flex items-center gap-1 rounded-full bg-green-500/8 text-green-600 dark:text-green-400 border border-green-500/15 px-2 py-0.5 text-[10px] font-medium"
              >
                {protocol}
              </span>
            ))}
          </div>
        )}

        {bundledBy && bundledBy.length === 0 && (
          <div className="mt-3 flex items-center gap-1.5">
            <Wrench className="size-3 text-muted-foreground/50 shrink-0" />
            <span className="text-[10px] text-muted-foreground/50">Standalone — not bundled</span>
          </div>
        )}
      </div>
      <span className="text-xs font-mono text-muted-foreground shrink-0">{price}</span>
    </div>
  );
}
