import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import type { AgentStrategy } from "@/data/agent-strategies";
import { riskLabel } from "@/data/agent-strategies";
import { ProtocolTile } from "@/components/strategy/protocol-tile";
import { cn } from "@/lib/utils";

function StrategyCardInner({ strategy }: { strategy: AgentStrategy }) {
  return (
    <>
      <div className="flex items-start gap-3">
        <ProtocolTile strategy={strategy} size="md" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {strategy.protocol}
          </p>
          <p className="font-medium text-foreground mt-0.5">{strategy.name}</p>
          <p className="text-xs text-muted-foreground mt-1">{strategy.tagline}</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-3 leading-relaxed line-clamp-2">{strategy.description}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="text-[10px] uppercase tracking-wide rounded-full bg-secondary px-2 py-0.5 text-muted-foreground">
          {strategy.category}
        </span>
        <span className="text-[10px] uppercase tracking-wide rounded-full bg-accent/25 px-2 py-0.5 text-accent-foreground">
          {riskLabel(strategy.risk)}
        </span>
      </div>
    </>
  );
}

export function StrategyPickerCard({
  strategy,
  mode,
  className,
  selected,
  onSelect,
}: {
  strategy: AgentStrategy;
  mode: "marketplace" | "wizard";
  className?: string;
  /** Wizard: selection state */
  selected?: boolean;
  /** Wizard: tap to select */
  onSelect?: () => void;
}) {
  if (mode === "marketplace") {
    return (
      <div
        className={cn(
          "rounded-2xl border border-border bg-card p-4 flex flex-col h-full shadow-sm",
          className,
        )}
      >
        <StrategyCardInner strategy={strategy} />
        <Link
          to="/launch"
          search={{ strategy: strategy.id }}
          className="mt-4 inline-flex items-center justify-center rounded-full bg-accent text-accent-foreground text-sm font-medium py-2.5 hover:bg-accent/90 transition-colors"
        >
          Use strategy
        </Link>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "rounded-2xl border bg-card p-4 flex flex-col h-full shadow-sm text-left w-full transition-colors",
        selected
          ? "border-accent ring-2 ring-accent/35 ring-offset-2 ring-offset-background"
          : "border-border hover:border-accent/40",
        className,
      )}
    >
      {selected ? (
        <span className="mb-2 inline-flex items-center gap-1 text-[11px] font-medium text-accent-foreground">
          <Check className="size-3.5" strokeWidth={2.5} />
          Selected
        </span>
      ) : null}
      <StrategyCardInner strategy={strategy} />
    </button>
  );
}
