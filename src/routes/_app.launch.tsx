"use client";

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bot, Loader2, Sparkles, ChevronDown } from "lucide-react";
import { LayoutGroup } from "framer-motion";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppPage } from "@/components/app-page";
import { AgentAskPanel } from "@/components/agent-ask-panel";
import { LaunchNewAgentWizard } from "@/components/launch-new-agent-wizard";
import { TabPillBg } from "@/components/tab-pill-bg";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isSkillId, type SkillId } from "@/data/agent-skills";
import type { AgentIdentity } from "@/hooks/use-solana-data";
import { useUiAgent } from "@/hooks/use-ui-agent";
import { useOishiBackend } from "@/hooks/use-oishi-backend";
import type { BackendAgent } from "@/lib/oishi-api";

type LaunchSearch = { strategy?: SkillId; tab?: "active" | "new" };

export const Route = createFileRoute("/_app/launch")({
  validateSearch: (raw: Record<string, unknown>): LaunchSearch => {
    const out: LaunchSearch = {};
    const s = raw.strategy;
    if (typeof s === "string" && isSkillId(s)) out.strategy = s;
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
      search: { strategy: search.strategy, tab: next },
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
                className="relative z-10 rounded-lg py-2.5 text-sm overflow-hidden data-[state=active]:bg-transparent data-[state=active]:shadow-none"
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
                className="relative z-10 rounded-lg py-2.5 text-sm overflow-hidden data-[state=active]:bg-transparent data-[state=active]:shadow-none"
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
  const { api, isReady } = useOishiBackend();
  const [registering, setRegistering] = useState(false);

  const { data: allAgents = [] } = useQuery({
    queryKey: ["oishi", "backend-agents"],
    queryFn: async () => {
      if (!api) return [];
      return api.listAgents();
    },
    enabled: isReady,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedAgent = selectedId
    ? (allAgents.find((a) => a.id === selectedId) ?? allAgents[0])
    : allAgents[0];

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
        <Loader2 className="size-8 animate-spin" />
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
      {/* Agent selector */}
      {allAgents.length > 1 && (
        <Select value={selectedAgent?.id ?? ""} onValueChange={setSelectedId}>
          <SelectTrigger className="rounded-2xl border-border bg-card h-11 w-full">
            <SelectValue placeholder="Choose agent" />
          </SelectTrigger>
          <SelectContent>
            {allAgents.map((a: BackendAgent) => (
              <SelectItem key={a.id} value={a.id}>
                <span className="flex flex-col gap-0.5 text-left py-0.5">
                  <span className="font-medium text-sm">{a.displayName}</span>
                  <span className="text-[11px] text-muted-foreground font-mono">{a.handle}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Agent info bar */}
      <div className="rounded-2xl border border-border bg-card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="size-2 shrink-0 rounded-full bg-accent animate-pulse" />
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">
              {selectedAgent?.displayName || uiAgent.displayName || uiAgent.handle}
            </p>
            <p className="text-xs text-muted-foreground font-mono truncate">
              {selectedAgent?.handle ?? uiAgent.handle}
              {selectedAgent?.status === "draft" && (
                <span className="ml-2 text-amber-500">(Draft)</span>
              )}
            </p>
          </div>
        </div>
        <KyaMiniBadge score={uiAgent.reputationScore} tier={uiAgent.tier} />
      </div>

      {/* KYA Registration for draft agents */}
      {selectedAgent?.status === "draft" && (
        <div className="rounded-2xl bg-amber-500/5 border border-amber-500/20 p-4 text-center">
          {!registering ? (
            <>
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                KYA your Agent
              </p>
              <p className="text-xs text-muted-foreground mt-1 mb-3">
                Register on-chain to build verifiable reputation.
              </p>
              <button
                type="button"
                disabled={!api}
                onClick={async () => {
                  setRegistering(true);
                  try {
                    const { payWithUsdc } = await import("@/lib/x402-payment");
                    const totalUsd = 0.001;
                    const { signature } = await payWithUsdc(
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      (window as any).solana,
                      totalUsd,
                    );
                    await api!.payAgent(selectedAgent!.id, signature, totalUsd);
                    await api!.registerAgent(selectedAgent!.id);
                  } catch (err) {
                    const msg = err instanceof Error ? err.message : "KYA registration failed";
                    alert(msg);
                  } finally {
                    setRegistering(false);
                  }
                }}
                className="inline-flex items-center gap-2 rounded-full bg-ink text-ink-foreground px-5 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {registering ? <>Registering…</> : "KYA now"}
              </button>
            </>
          ) : null}
        </div>
      )}

      {/* Chat */}
      <AgentAskPanel
        agent={uiAgent}
        backendAgentId={selectedAgent?.id ?? backendAgentId}
        className="min-h-[min(70svh,calc(100svh-15rem))]"
      />
    </div>
  );
}
