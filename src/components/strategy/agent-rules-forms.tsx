"use client";

import type { StrategyId } from "@/data/agent-strategies";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export type CommonAgentRules = {
  dailyCapUsd: number;
  maxPerTxUsd: number;
  notifyOnBlock: boolean;
  quietHoursEnabled: boolean;
};

export const defaultCommonRules: CommonAgentRules = {
  dailyCapUsd: 75,
  maxPerTxUsd: 35,
  notifyOnBlock: true,
  quietHoursEnabled: false,
};

export function CommonAgentRulesForm({
  value,
  onChange,
  className,
}: {
  value: CommonAgentRules;
  onChange: (next: CommonAgentRules) => void;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-border bg-card p-5 space-y-6", className)}>
      <div>
        <h3 className="text-sm font-semibold text-foreground">Vault limits</h3>
        <p className="text-xs text-muted-foreground mt-1">
          These apply to every strategy. The vault program enforces them before a spend fires.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between gap-4">
          <Label className="text-sm">Daily spend cap</Label>
          <span className="text-sm font-medium tabular text-foreground">${value.dailyCapUsd}</span>
        </div>
        <Slider
          min={10}
          max={500}
          step={5}
          value={[value.dailyCapUsd]}
          onValueChange={([v]) => {
            const daily = v;
            const perTx = Math.min(value.maxPerTxUsd, daily);
            onChange({ ...value, dailyCapUsd: daily, maxPerTxUsd: perTx });
          }}
        />
        <p className="text-xs text-muted-foreground">Resets at 00:00 UTC (demo).</p>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between gap-4">
          <Label className="text-sm">Max per transaction</Label>
          <span className="text-sm font-medium tabular text-foreground">${value.maxPerTxUsd}</span>
        </div>
        <Slider
          min={5}
          max={Math.min(250, value.dailyCapUsd)}
          step={5}
          value={[Math.min(value.maxPerTxUsd, value.dailyCapUsd)]}
          onValueChange={([v]) =>
            onChange({
              ...value,
              maxPerTxUsd: Math.min(v, value.dailyCapUsd),
            })
          }
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          <Label className="text-sm">Notify when a spend is blocked</Label>
          <p className="text-xs text-muted-foreground mt-0.5">In-app + webhook (MVP: log only).</p>
        </div>
        <Switch
          checked={value.notifyOnBlock}
          onCheckedChange={(checked) => onChange({ ...value, notifyOnBlock: checked })}
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          <Label className="text-sm">Quiet hours</Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            No autonomous trades 23:00–07:00 local.
          </p>
        </div>
        <Switch
          checked={value.quietHoursEnabled}
          onCheckedChange={(checked) => onChange({ ...value, quietHoursEnabled: checked })}
        />
      </div>
    </section>
  );
}

type SpecificState = Record<string, number | boolean>;

export function StrategySpecificRulesForm({
  strategyId,
  value,
  onChange,
}: {
  strategyId: StrategyId;
  value: SpecificState;
  onChange: (next: SpecificState) => void;
}) {
  const set = (key: string, v: number | boolean) => onChange({ ...value, [key]: v });

  switch (strategyId) {
    case "kamino":
      return (
        <section className="rounded-2xl border border-border bg-card p-5 space-y-5">
          <h3 className="text-sm font-semibold text-foreground">Kamino</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-sm">Target yield vs risk</Label>
              <span className="text-xs text-muted-foreground tabular">
                {typeof value.apyLean === "number" ? value.apyLean : 45}%
              </span>
            </div>
            <Slider
              min={10}
              max={90}
              step={5}
              value={[typeof value.apyLean === "number" ? value.apyLean : 45]}
              onValueChange={([v]) => set("apyLean", v)}
            />
            <p className="text-xs text-muted-foreground">
              Higher = more aggressive vault mixes (simulated).
            </p>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label className="text-sm">Stablecoin-only supply</Label>
            </div>
            <Switch
              checked={value.stableOnly !== false}
              onCheckedChange={(c) => set("stableOnly", c)}
            />
          </div>
        </section>
      );
    case "drift":
      return (
        <section className="rounded-2xl border border-border bg-card p-5 space-y-5">
          <h3 className="text-sm font-semibold text-foreground">Drift</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-sm">Max leverage</Label>
              <span className="text-sm font-medium tabular">
                {typeof value.maxLev === "number" ? value.maxLev : 3}x
              </span>
            </div>
            <Slider
              min={1}
              max={10}
              step={0.5}
              value={[typeof value.maxLev === "number" ? value.maxLev : 3]}
              onValueChange={([v]) => set("maxLev", v)}
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <Label className="text-sm">Isolate perp positions</Label>
            <Switch
              checked={value.isolated !== false}
              onCheckedChange={(c) => set("isolated", c)}
            />
          </div>
        </section>
      );
    case "polymarket":
      return (
        <section className="rounded-2xl border border-border bg-card p-5 space-y-5">
          <h3 className="text-sm font-semibold text-foreground">Polymarket</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-sm">Max position (USDC)</Label>
              <span className="text-sm font-medium tabular">
                ${typeof value.maxPosition === "number" ? value.maxPosition : 50}
              </span>
            </div>
            <Slider
              min={10}
              max={200}
              step={5}
              value={[typeof value.maxPosition === "number" ? value.maxPosition : 50]}
              onValueChange={([v]) => set("maxPosition", v)}
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label className="text-sm">Liquid markets only</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                &gt; $2M depth (demo heuristic).
              </p>
            </div>
            <Switch
              checked={value.liquidOnly !== false}
              onCheckedChange={(c) => set("liquidOnly", c)}
            />
          </div>
        </section>
      );
    case "meteora":
      return (
        <section className="rounded-2xl border border-border bg-card p-5 space-y-5">
          <h3 className="text-sm font-semibold text-foreground">Meteora</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-sm">IL tolerance</Label>
              <span className="text-xs text-muted-foreground">
                {typeof value.ilTolerance === "number" ? value.ilTolerance : 40}%
              </span>
            </div>
            <Slider
              min={10}
              max={90}
              step={5}
              value={[typeof value.ilTolerance === "number" ? value.ilTolerance : 40]}
              onValueChange={([v]) => set("ilTolerance", v)}
            />
            <p className="text-xs text-muted-foreground">
              Higher allows wider price ranges before rebalance.
            </p>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label className="text-sm">Auto-rebalance</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                When price exits the band (simulated).
              </p>
            </div>
            <Switch
              checked={value.autoRebal !== false}
              onCheckedChange={(c) => set("autoRebal", c)}
            />
          </div>
        </section>
      );
    case "sanctum":
      return (
        <section className="rounded-2xl border border-border bg-card p-5 space-y-5">
          <h3 className="text-sm font-semibold text-foreground">Sanctum</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-sm">Max LST share of vault</Label>
              <span className="text-xs tabular">
                {typeof value.maxLstPct === "number" ? value.maxLstPct : 60}%
              </span>
            </div>
            <Slider
              min={20}
              max={100}
              step={5}
              value={[typeof value.maxLstPct === "number" ? value.maxLstPct : 60]}
              onValueChange={([v]) => set("maxLstPct", v)}
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <Label className="text-sm">Prefer Jito-backed routes</Label>
            <Switch
              checked={value.jitoPrefer === true}
              onCheckedChange={(c) => set("jitoPrefer", c)}
            />
          </div>
        </section>
      );
    case "jupiter":
      return (
        <section className="rounded-2xl border border-border bg-card p-5 space-y-5">
          <h3 className="text-sm font-semibold text-foreground">Jupiter</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-sm">Max slippage</Label>
              <span className="text-xs tabular">
                {typeof value.slippageBps === "number" ? value.slippageBps : 50} bps
              </span>
            </div>
            <Slider
              min={10}
              max={150}
              step={5}
              value={[typeof value.slippageBps === "number" ? value.slippageBps : 50]}
              onValueChange={([v]) => set("slippageBps", v)}
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label className="text-sm">Restrict to audited routes</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Fewer hops, fewer surface-area surprises.
              </p>
            </div>
            <Switch
              checked={value.auditedRoutes !== false}
              onCheckedChange={(c) => set("auditedRoutes", c)}
            />
          </div>
        </section>
      );
    case "raydium":
      return (
        <section className="rounded-2xl border border-border bg-card p-5 space-y-5">
          <h3 className="text-sm font-semibold text-foreground">Raydium</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-sm">Max share in one pool</Label>
              <span className="text-xs tabular">
                {typeof value.maxPoolPct === "number" ? value.maxPoolPct : 35}%
              </span>
            </div>
            <Slider
              min={10}
              max={80}
              step={5}
              value={[typeof value.maxPoolPct === "number" ? value.maxPoolPct : 35]}
              onValueChange={([v]) => set("maxPoolPct", v)}
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <Label className="text-sm">Concentrated range</Label>
            <Switch
              checked={value.concentrated === true}
              onCheckedChange={(c) => set("concentrated", c)}
            />
          </div>
        </section>
      );
    case "marginfi":
      return (
        <section className="rounded-2xl border border-border bg-card p-5 space-y-5">
          <h3 className="text-sm font-semibold text-foreground">marginfi</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-sm">Max LTV</Label>
              <span className="text-xs tabular">
                {typeof value.maxLtv === "number" ? value.maxLtv : 55}%
              </span>
            </div>
            <Slider
              min={30}
              max={75}
              step={5}
              value={[typeof value.maxLtv === "number" ? value.maxLtv : 55]}
              onValueChange={([v]) => set("maxLtv", v)}
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <Label className="text-sm">Allow borrowing</Label>
            <Switch
              checked={value.borrowOff !== true}
              onCheckedChange={(c) => set("borrowOff", !c)}
            />
          </div>
        </section>
      );
    default:
      return null;
  }
}

export function defaultSpecificForStrategy(id: StrategyId): SpecificState {
  switch (id) {
    case "kamino":
      return { apyLean: 45, stableOnly: true };
    case "drift":
      return { maxLev: 3, isolated: true };
    case "polymarket":
      return { maxPosition: 50, liquidOnly: true };
    case "meteora":
      return { ilTolerance: 40, autoRebal: true };
    case "sanctum":
      return { maxLstPct: 60, jitoPrefer: false };
    case "jupiter":
      return { slippageBps: 50, auditedRoutes: true };
    case "raydium":
      return { maxPoolPct: 35, concentrated: false };
    case "marginfi":
      return { maxLtv: 55, borrowOff: false };
    default:
      return {};
  }
}
