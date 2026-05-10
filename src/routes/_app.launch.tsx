"use client";

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bot, Loader2, Sparkles } from "lucide-react";
import { LayoutGroup } from "framer-motion";
import { AppPage } from "@/components/app-page";
import { AgentAskPanel } from "@/components/agent-ask-panel";
import { LaunchNewAgentWizard } from "@/components/launch-new-agent-wizard";
import { TabPillBg } from "@/components/tab-pill-bg";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isStrategyId, type StrategyId } from "@/data/agent-strategies";
import type { AgentIdentity } from "@/hooks/use-solana-data";
import { useUiAgent } from "@/hooks/use-ui-agent";

type LaunchSearch = { strategy?: StrategyId; tab?: "active" | "new" };

export const Route = createFileRoute("/_app/launch")({
  validateSearch: (raw: Record<string, unknown>): LaunchSearch => {
    const out: LaunchSearch = {};
    const s = raw.strategy;
    if (typeof s === "string" && isStrategyId(s)) out.strategy = s;
    const t = raw.tab;
    if (t === "active" || t === "new") out.tab = t;
    return out;
  },
  head: () => ({
    meta: [
      { title: "Agent — Oishi" },
      {
        name: "description",
        content: "Chat with your agent or launch a new one with a strategy and vault rules.",
      },
    ],
  }),
  component: LaunchPage,
});

function LaunchPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { uiAgent, hasAgent, isLoading, connected, backendAgent } = useUiAgent();
  const backendAgentId = backendAgent?.id ?? null;

  const tab: "active" | "new" =
    search.tab === "active" || search.tab === "new" ? search.tab : hasAgent ? "active" : "new";

  const setTab = (next: "active" | "new") => {
    navigate({
      to: "/launch",
      search: {
        strategy: search.strategy,
        tab: next,
      },
    });
  };

  return (
    <AppPage title="Agent" subtitle="Manage your deployment" right={null}>
      <div className="flex min-h-0 flex-1 flex-col">
        <LayoutGroup id="launch-tabs">
          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as "active" | "new")}
            className="flex min-h-0 flex-1 flex-col"
          >
            <TabsList className="w-full grid h-auto grid-cols-2 gap-1 rounded-xl p-1 relative">
              <TabsTrigger
                value="active"
                className="relative z-10 rounded-lg py-2.5 text-xs sm:text-sm overflow-hidden data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                <TabPillBg
                  show={tab === "active"}
                  layoutId="launch-seg-pill"
                  className="rounded-lg"
                />
                <span className="relative z-10">Your active agent</span>
              </TabsTrigger>
              <TabsTrigger
                value="new"
                className="relative z-10 rounded-lg py-2.5 text-xs sm:text-sm overflow-hidden data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                <TabPillBg show={tab === "new"} layoutId="launch-seg-pill" className="rounded-lg" />
                <span className="relative z-10">Launch new agent</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="active"
              className="mt-6 flex min-h-0 flex-1 flex-col outline-none data-[state=inactive]:hidden"
            >
              <ActiveAgentTab
                connected={!!connected}
                isLoading={isLoading}
                uiAgent={uiAgent}
                hasAgent={hasAgent}
                backendAgentId={backendAgentId}
                onGoLaunchNew={() => setTab("new")}
              />
            </TabsContent>

            <TabsContent value="new" className="mt-6 outline-none">
              <LaunchNewAgentWizard presetStrategy={search.strategy} />
            </TabsContent>
          </Tabs>
        </LayoutGroup>
      </div>
    </AppPage>
  );
}

function KyaMiniBadge({ score, tier }: { score: number; tier: AgentIdentity["tier"] }) {
  const colors = {
    gold: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    green: "bg-green-500/10 text-green-500 border-green-500/20",
    yellow: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    red: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${colors[tier]}`}
    >
      <Sparkles className="size-3" />
      {tier.toUpperCase()} {score}
    </span>
  );
}

function ActiveAgentTab({
  connected,
  isLoading,
  uiAgent,
  hasAgent,
  backendAgentId,
  onGoLaunchNew,
}: {
  connected: boolean;
  isLoading: boolean;
  uiAgent: AgentIdentity | null;
  hasAgent: boolean;
  backendAgentId: string | null;
  onGoLaunchNew: () => void;
}) {
  if (!connected) {
    return (
      <p className="text-sm text-muted-foreground">
        Connect your Solana wallet to view and chat with your agent.
      </p>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
        <Loader2 className="size-8 animate-spin" aria-hidden />
        <p className="text-sm">Loading agent…</p>
      </div>
    );
  }

  if (!hasAgent || !uiAgent) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-4">
        <div className="mx-auto size-14 rounded-full bg-secondary flex items-center justify-center">
          <Bot className="size-7 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">No agent yet</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Launch your first agent to unlock chat, guardrails, and on-chain reputation.
          </p>
        </div>
        <Button
          type="button"
          variant="accent"
          className="w-full rounded-full h-11"
          onClick={onGoLaunchNew}
        >
          Launch new agent
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="rounded-2xl border border-border bg-card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="size-2 shrink-0 rounded-full bg-accent animate-pulse" />
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{uiAgent.displayName || uiAgent.handle}</p>
            <p className="text-xs text-muted-foreground font-mono truncate">{uiAgent.handle}</p>
          </div>
        </div>
        <KyaMiniBadge score={uiAgent.reputationScore} tier={uiAgent.tier} />
      </div>

      <AgentAskPanel
        agent={uiAgent}
        backendAgentId={backendAgentId}
        className="min-h-[min(70svh,calc(100svh-15rem))]"
      />
    </div>
  );
}
