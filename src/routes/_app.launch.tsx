"use client";

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppPage } from "@/components/app-page";
import {
  CommonAgentRulesForm,
  defaultCommonRules,
  defaultSpecificForStrategy,
  StrategySpecificRulesForm,
  type CommonAgentRules,
} from "@/components/strategy/agent-rules-forms";
import { ProtocolTile } from "@/components/strategy/protocol-tile";
import { StrategyPickerCard } from "@/components/strategy/strategy-picker-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AGENT_STRATEGIES, getStrategy, isStrategyId, type StrategyId } from "@/data/agent-strategies";
import {
  fullOishiHandle,
  normalizeHandlePrefix,
  validateHandlePrefix,
} from "@/lib/oishi-handle";

type LaunchSearch = { strategy?: StrategyId };

const STEP_LABELS = ["Identity", "Strategy", "Rules"] as const;

export const Route = createFileRoute("/_app/launch")({
  validateSearch: (raw: Record<string, unknown>): LaunchSearch => {
    const s = raw.strategy;
    if (typeof s === "string" && isStrategyId(s)) return { strategy: s };
    return {};
  },
  head: () => ({
    meta: [
      { title: "Launch agent — Oishi" },
      {
        name: "description",
        content: "Name your agent, claim a .oishi handle, pick a strategy, and set vault rules.",
      },
    ],
  }),
  component: LaunchPage,
});

function launchStepSubtitle(step: number): string {
  return `Step ${step + 1} of 3 · ${STEP_LABELS[step]}`;
}

function LaunchPage() {
  const { strategy: presetStrategy } = Route.useSearch();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [handlePrefix, setHandlePrefix] = useState("");
  const [handleTouched, setHandleTouched] = useState(false);
  const [selectedStrategyId, setSelectedStrategyId] = useState<StrategyId | null>(null);
  const [common, setCommon] = useState<CommonAgentRules>(defaultCommonRules);
  const [specific, setSpecific] = useState<Record<string, number | boolean>>({});

  const normalizedPrefix = useMemo(() => normalizeHandlePrefix(handlePrefix), [handlePrefix]);
  const handleError = handleTouched ? validateHandlePrefix(normalizedPrefix) : null;
  const displayTrimmed = displayName.trim();
  const displayError =
    displayTrimmed.length === 0
      ? "Add a display name."
      : displayTrimmed.length > 48
        ? "Shorten to 48 characters or fewer."
        : null;

  useEffect(() => {
    if (presetStrategy && isStrategyId(presetStrategy)) {
      setSelectedStrategyId(presetStrategy);
    }
  }, [presetStrategy]);

  useEffect(() => {
    if (!selectedStrategyId) {
      setSpecific({});
      return;
    }
    setSpecific(defaultSpecificForStrategy(selectedStrategyId));
  }, [selectedStrategyId]);

  const canProceedIdentity =
    !displayError &&
    handleTouched &&
    normalizedPrefix.length > 0 &&
    validateHandlePrefix(normalizedPrefix) === null;

  const canProceedStrategy = selectedStrategyId !== null;

  const goBack = () => {
    if (step > 0) {
      setStep((s) => s - 1);
      return;
    }
    navigate({ to: "/" });
  };

  const resetWizard = () => {
    setStep(0);
    setDisplayName("");
    setHandlePrefix("");
    setHandleTouched(false);
    setSelectedStrategyId(null);
    setCommon(defaultCommonRules);
    setSpecific({});
    navigate({ to: "/launch", search: {} });
  };

  if (step === 0) {
    return (
      <AppPage title="Launch agent" subtitle={launchStepSubtitle(0)} right={null}>
        <button
          type="button"
          onClick={goBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground -mt-1 mb-4"
        >
          <ArrowLeft className="size-4" strokeWidth={2.2} />
          Back
        </button>

        <p className="-mt-2 mb-5 text-sm text-muted-foreground leading-relaxed">
          Register an on-chain identity for your agent. The handle is how humans and other agents
          recognize it across Oishi.
        </p>

        <div className="rounded-2xl border border-border bg-card p-5 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="agent-display-name">Display name</Label>
            <Input
              id="agent-display-name"
              placeholder="e.g. DCA Moonbot"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoComplete="off"
              className="rounded-xl h-11"
            />
            {displayError ? <p className="text-xs text-destructive">{displayError}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="agent-handle">Claim handle</Label>
            <div className="flex rounded-xl border border-input overflow-hidden bg-background shadow-sm focus-within:ring-1 focus-within:ring-ring">
              <span className="flex items-center pl-3 pr-1 text-muted-foreground text-sm select-none">
                @
              </span>
              <Input
                id="agent-handle"
                className="border-0 rounded-none shadow-none focus-visible:ring-0 h-11 flex-1 min-w-0"
                placeholder="your-agent"
                value={handlePrefix}
                onChange={(e) => {
                  setHandlePrefix(e.target.value);
                  setHandleTouched(true);
                }}
                onBlur={() => setHandleTouched(true)}
                autoComplete="off"
                spellCheck={false}
              />
              <span className="flex items-center pr-3 pl-1 text-muted-foreground text-sm tabular shrink-0">
                .oishi
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Live preview:{" "}
              <span className="font-mono text-foreground">{fullOishiHandle(normalizedPrefix || "…")}</span>
            </p>
            {handleTouched && (handleError || normalizedPrefix.length === 0) ? (
              <p className="text-xs text-destructive">
                {normalizedPrefix.length === 0 ? "Choose a handle prefix." : handleError}
              </p>
            ) : null}
          </div>

          <p className="text-xs text-muted-foreground rounded-xl bg-muted/40 border border-border/60 px-3 py-2">
            <span className="font-medium text-foreground">Demo fee:</span> ~0.003 SOL for KYA-style
            registration (not charged in this prototype).
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Button
            variant="accent"
            className="w-full rounded-full h-12 text-base"
            disabled={!canProceedIdentity}
            onClick={() => setStep(1)}
          >
            Continue to strategy
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Browsing first?{" "}
            <Link to="/marketplace" className="text-accent-foreground font-medium underline underline-offset-4">
              Strategy marketplace
            </Link>
          </p>
        </div>
      </AppPage>
    );
  }

  if (step === 1) {
    return (
      <AppPage title="Choose strategy" subtitle={launchStepSubtitle(1)} right={null}>
        <button
          type="button"
          onClick={() => setStep(0)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground -mt-1 mb-4"
        >
          <ArrowLeft className="size-4" strokeWidth={2.2} />
          Identity
        </button>

        <div className="rounded-xl border border-border bg-muted/30 px-3 py-2 mb-4 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{displayTrimmed}</span>
          <span className="mx-1.5">·</span>
          <span className="font-mono text-foreground">{fullOishiHandle(normalizedPrefix)}</span>
        </div>

        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          Tap a protocol playbook. You&apos;ll tune vault limits and strategy-specific guardrails next.
        </p>

        <div className="grid grid-cols-1 gap-3">
          {AGENT_STRATEGIES.map((s) => (
            <StrategyPickerCard
              key={s.id}
              strategy={s}
              mode="wizard"
              selected={selectedStrategyId === s.id}
              onSelect={() => setSelectedStrategyId(s.id)}
            />
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Button
            variant="accent"
            className="w-full rounded-full h-12 text-base"
            disabled={!canProceedStrategy}
            onClick={() => setStep(2)}
          >
            Continue to rules
          </Button>
        </div>
      </AppPage>
    );
  }

  // step === 2 — rules
  const s = selectedStrategyId ? getStrategy(selectedStrategyId) : undefined;
  if (!s) {
    return (
      <AppPage title="Launch agent" subtitle="Something went wrong" right={null}>
        <Button type="button" variant="outline" className="rounded-full" onClick={() => setStep(1)}>
          Back to strategy
        </Button>
      </AppPage>
    );
  }

  const strategy = s;

  return (
    <AppPage title="Set rules" subtitle={launchStepSubtitle(2)} right={null}>
      <button
        type="button"
        onClick={() => setStep(1)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground -mt-1 mb-4"
      >
        <ArrowLeft className="size-4" strokeWidth={2.2} />
        Strategy
      </button>

      <div className="rounded-xl border border-border bg-muted/30 px-3 py-2 mb-4 space-y-1">
        <div className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{displayTrimmed}</span>
          <span className="mx-1.5">·</span>
          <span className="font-mono text-foreground">{fullOishiHandle(normalizedPrefix)}</span>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-muted/20 p-4 flex gap-3 items-start mb-5">
        <ProtocolTile strategy={strategy} size="lg" />
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{strategy.protocol}</p>
          <p className="font-medium text-foreground">{strategy.name}</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{strategy.tagline}</p>
        </div>
      </div>

      <CommonAgentRulesForm value={common} onChange={setCommon} className="mb-4" />
      <StrategySpecificRulesForm
        strategyId={strategy.id}
        value={specific}
        onChange={setSpecific}
      />

      <div className="mt-6 flex flex-col gap-3">
        <Button
          variant="accent"
          className="w-full rounded-full h-12 text-base"
          onClick={() => {
            const payload = {
              displayName: displayTrimmed,
              handle: fullOishiHandle(normalizedPrefix),
              strategyId: strategy.id,
              common,
              specific,
            };
            console.log("oishi.agent.launch", payload);
            navigate({ to: "/" });
          }}
        >
          Launch agent
        </Button>
        <Button type="button" variant="outline" className="w-full rounded-full" onClick={resetWizard}>
          Start over
        </Button>
        <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
          Prototype: nothing is written on-chain. Check the console for{" "}
          <span className="font-mono">oishi.agent.launch</span>.
        </p>
      </div>
    </AppPage>
  );
}
