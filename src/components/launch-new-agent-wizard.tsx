"use client";

import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
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
import {
  AGENT_STRATEGIES,
  getStrategy,
  isStrategyId,
  type StrategyId,
} from "@/data/agent-strategies";
import { fullOishiHandle, normalizeHandlePrefix, validateHandlePrefix } from "@/lib/oishi-handle";
import { useOishiBackend } from "@/hooks/use-oishi-backend";
import { useSolanaTx } from "@/hooks/use-solana-tx";

const STEP_LABELS = ["Identity", "Strategy", "Rules"] as const;

type LaunchPhase = "idle" | "registering" | "creating" | "onchain" | "done" | "error";

function launchStepSubtitle(step: number): string {
  return `Step ${step + 1} of 3 · ${STEP_LABELS[step]}`;
}

function WizardHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <>
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-1">{subtitle}</p>
      <h2 className="font-display text-3xl leading-none text-foreground break-words mb-4">
        {title}
      </h2>
    </>
  );
}

export function LaunchNewAgentWizard({ presetStrategy }: { presetStrategy?: StrategyId }) {
  const { connected } = useWallet();
  const { api, isReady } = useOishiBackend();
  const { signAndSend, ready: txReady } = useSolanaTx();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [handlePrefix, setHandlePrefix] = useState("");
  const [handleTouched, setHandleTouched] = useState(false);
  const [selectedStrategyId, setSelectedStrategyId] = useState<StrategyId | null>(null);
  const [common, setCommon] = useState<CommonAgentRules>(defaultCommonRules);
  const [specific, setSpecific] = useState<Record<string, number | boolean>>({});

  const [launchPhase, setLaunchPhase] = useState<LaunchPhase>("idle");
  const [launchError, setLaunchError] = useState<string | null>(null);

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
    setLaunchPhase("idle");
    setLaunchError(null);
    navigate({ to: "/launch", search: { tab: "new" } });
  };

  const handleLaunch = async () => {
    if (!api || !isReady) {
      setLaunchError("Wallet not connected. Please connect your Solana wallet first.");
      setLaunchPhase("error");
      return;
    }

    if (!txReady) {
      setLaunchError(
        "Launch requires a wallet that can submit Solana transactions (sendTransaction). Reconnect with Phantom, Solflare, or another signing wallet.",
      );
      setLaunchPhase("error");
      return;
    }

    const handle = fullOishiHandle(normalizedPrefix);

    setLaunchPhase("registering");
    setLaunchError(null);

    let createdId: string | null = null;
    try {
      const created = await api.createAgent({
        displayName: displayTrimmed,
        handle,
        strategyId: selectedStrategyId!,
        commonRules: common,
        specificRules: specific,
      });

      createdId = created.id;
      setLaunchPhase("creating");

      await new Promise((r) => setTimeout(r, 800));

      setLaunchPhase("onchain");
      console.log("[oishi] Requesting on-chain registration tx for", created.id);
      const { transaction, pda } = await api.getRegisterAgentTx(created.id);
      console.log("[oishi] Got tx, PDA:", pda);
      await signAndSend(transaction);
      console.log("[oishi] On-chain tx confirmed");

      setLaunchPhase("done");
      console.log("[oishi] Agent launched:", created);

      setTimeout(() => {
        navigate({ to: "/", replace: true });
      }, 2000);
    } catch (err: unknown) {
      if (createdId) {
        try {
          await api.stopAgent(createdId);
        } catch {
          /* best-effort rollback */
        }
      }
      let message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "Failed to launch agent";
      if (/user rejected/i.test(message) || /denied/i.test(message)) {
        message = "Transaction cancelled or declined. Launch was not completed.";
      }
      setLaunchError(message);
      setLaunchPhase("error");
    }
  };

  if (step === 0) {
    return (
      <>
        <WizardHeading title="Launch agent" subtitle={launchStepSubtitle(0)} />
        <button
          type="button"
          onClick={goBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground -mt-1 mb-4"
        >
          <ArrowLeft className="size-4" strokeWidth={2.2} />
          Back
        </button>

        <p className="-mt-2 mb-5 text-sm text-muted-foreground leading-relaxed">
          Launch binds your agent to Oishi&apos;s registry and completes a Solana registration in
          one flow. The handle is how humans and other agents recognize this agent everywhere.
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
              <span className="font-mono text-foreground">
                {fullOishiHandle(normalizedPrefix || "…")}
              </span>
            </p>
            {handleTouched && (handleError || normalizedPrefix.length === 0) ? (
              <p className="text-xs text-destructive">
                {normalizedPrefix.length === 0 ? "Choose a handle prefix." : handleError}
              </p>
            ) : null}
          </div>

          <p className="text-xs text-muted-foreground rounded-xl bg-muted/40 border border-border/60 px-3 py-2">
            <span className="font-medium text-foreground">Note:</span> Your agent will be launched
            with its own memory, decision engine, and skills — ready to earn 24/7.
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
            <Link
              to="/marketplace"
              className="text-accent-foreground font-medium underline underline-offset-4"
            >
              Strategy marketplace
            </Link>
          </p>
        </div>
      </>
    );
  }

  if (step === 1) {
    return (
      <>
        <WizardHeading title="Choose strategy" subtitle={launchStepSubtitle(1)} />
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
          Tap a protocol playbook. You&apos;ll tune vault limits and strategy-specific guardrails
          next.
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
      </>
    );
  }

  const s = selectedStrategyId ? getStrategy(selectedStrategyId) : undefined;
  if (!s) {
    return (
      <>
        <WizardHeading title="Launch agent" subtitle="Something went wrong" />
        <Button type="button" variant="outline" className="rounded-full" onClick={() => setStep(1)}>
          Back to strategy
        </Button>
      </>
    );
  }

  const strategy = s;

  if (launchPhase !== "idle") {
    return (
      <>
        <WizardHeading title="Launch agent" subtitle="Deploying" />
        <div className="mt-12 flex flex-col items-center text-center">
          {launchPhase === "registering" && (
            <>
              <div className="size-16 rounded-full bg-accent/10 flex items-center justify-center">
                <Loader2 className="size-8 text-accent animate-spin" />
              </div>
              <h3 className="mt-6 text-lg font-semibold">Creating your agent…</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Registering{" "}
                <span className="font-mono text-foreground">
                  {fullOishiHandle(normalizedPrefix)}
                </span>{" "}
                with its own memory, skills, and decision engine.
              </p>
              <div className="mt-8 w-full max-w-xs space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Provisioning profile &amp; rules…
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Initializing skills &amp; context…
                </div>
              </div>
            </>
          )}

          {launchPhase === "creating" && (
            <>
              <div className="size-16 rounded-full bg-accent/10 flex items-center justify-center">
                <Loader2 className="size-8 text-accent animate-spin" />
              </div>
              <h3 className="mt-6 text-lg font-semibold">Almost there…</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Spinning up the {strategy.name} strategy engine. Your agent will wake every 60
                seconds.
              </p>
              <div className="mt-8 w-full max-w-xs space-y-3">
                <div className="flex items-center gap-3 text-sm text-success">
                  <CheckCircle className="size-4" />
                  Profile provisioned with Oishi
                </div>
                <div className="flex items-center gap-3 text-sm text-success">
                  <CheckCircle className="size-4" />
                  Skills &amp; context wired
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Preparing Solana registration…
                </div>
              </div>
            </>
          )}

          {launchPhase === "onchain" && (
            <>
              <div className="size-16 rounded-full bg-accent/10 flex items-center justify-center">
                <Loader2 className="size-8 text-accent animate-spin" />
              </div>
              <h3 className="mt-6 text-lg font-semibold">Registering on Solana…</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Writing agent identity to the blockchain. Approve the transaction in your wallet.
              </p>
              <div className="mt-8 w-full max-w-xs space-y-3">
                <div className="flex items-center gap-3 text-sm text-success">
                  <CheckCircle className="size-4" />
                  Profile synced
                </div>
                <div className="flex items-center gap-3 text-sm text-success">
                  <CheckCircle className="size-4" />
                  Strategy runtime ready
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Signing on-chain registration…
                </div>
              </div>
            </>
          )}

          {launchPhase === "done" && (
            <>
              <div className="size-16 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle className="size-8 text-success" />
              </div>
              <h3 className="mt-6 text-lg font-semibold">Agent launched!</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                <span className="font-mono text-foreground">
                  {fullOishiHandle(normalizedPrefix)}
                </span>{" "}
                is now live. It will check every 60 seconds for opportunities.
              </p>
              <div className="mt-8 w-full max-w-xs space-y-3">
                <div className="flex items-center gap-3 text-sm text-success">
                  <CheckCircle className="size-4" />
                  Registered with Oishi ({strategy.protocol})
                </div>
                <div className="flex items-center gap-3 text-sm text-success">
                  <CheckCircle className="size-4" />
                  On-chain identity confirmed
                </div>
                <div className="flex items-center gap-3 text-sm text-success">
                  <CheckCircle className="size-4" />
                  Agent scheduler active
                </div>
              </div>
              <p className="mt-6 text-xs text-muted-foreground">Redirecting to dashboard…</p>
            </>
          )}

          {launchPhase === "error" && (
            <>
              <div className="size-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="size-8 text-destructive" />
              </div>
              <h3 className="mt-6 text-lg font-semibold">Launch failed</h3>
              <p className="mt-2 text-sm text-destructive/80 max-w-sm">{launchError}</p>
              <div className="mt-6 flex flex-col gap-3 w-full max-w-xs">
                <Button
                  variant="accent"
                  className="w-full rounded-full h-12"
                  onClick={handleLaunch}
                >
                  Try again
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-full"
                  onClick={resetWizard}
                >
                  Start over
                </Button>
              </div>
            </>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <WizardHeading title="Set rules" subtitle={launchStepSubtitle(2)} />
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
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {strategy.protocol}
          </p>
          <p className="font-medium text-foreground">{strategy.name}</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{strategy.tagline}</p>
        </div>
      </div>

      <CommonAgentRulesForm value={common} onChange={setCommon} className="mb-4" />
      <StrategySpecificRulesForm strategyId={strategy.id} value={specific} onChange={setSpecific} />

      <div className="mt-6 flex flex-col gap-3">
        <Button
          variant="accent"
          className="w-full rounded-full h-12 text-base"
          disabled={!connected || !isReady || !txReady}
          onClick={handleLaunch}
        >
          {!connected
            ? "Connect wallet to launch"
            : !isReady
              ? "Waiting for wallet sign-in…"
              : !txReady
                ? "Wallet cannot send Solana txs"
                : "Launch agent"}
        </Button>
        {connected && isReady && !txReady ? (
          <p className="text-[11px] text-destructive/90 text-center leading-relaxed">
            This adapter does not expose <span className="font-mono">sendTransaction</span>.
            Disconnect and choose Phantom, Solflare, or another wallet that submits transactions —
            launch completes only after on-chain confirmation.
          </p>
        ) : null}
        <Button
          type="button"
          variant="outline"
          className="w-full rounded-full"
          onClick={resetWizard}
        >
          Start over
        </Button>
        <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
          You approve one Solana transaction after the agent is provisioned. If anything fails
          afterward, launch is rolled back so you do not stay half-done.
        </p>
      </div>
    </>
  );
}
