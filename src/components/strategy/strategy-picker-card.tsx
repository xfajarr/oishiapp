import { Link } from "@tanstack/react-router";
import { Check, Package } from "lucide-react";
import type { AgentSkill } from "@/data/agent-skills";
import { riskLabel } from "@/data/agent-skills";
import { getStrategy } from "@/data/agent-strategies";
import { getTool } from "@/data/agent-tools";
import { ProtocolTile } from "@/components/strategy/protocol-tile";
import { cn } from "@/lib/utils";

function StrategyCardInner({ skill }: { skill: AgentSkill }) {
  const strategies = skill.bundledStrategies.map((id) => getStrategy(id)).filter(Boolean);
  const tools = skill.bundledTools.map((id) => getTool(id)).filter(Boolean);

  return (
    <>
      <div className="flex items-start gap-3">
        <ProtocolTile skill={skill} size="md" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {skill.protocol}
          </p>
          <p className="font-medium text-foreground mt-0.5">{skill.name}</p>
          <p className="text-xs text-muted-foreground mt-1">{skill.tagline}</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-3 leading-relaxed line-clamp-2">
        {skill.description}
      </p>
      <div className="mt-3 flex flex-wrap gap-2 items-center">
        <span className="text-[10px] uppercase tracking-wide rounded-full bg-secondary px-2 py-0.5 text-muted-foreground">
          {skill.category}
        </span>
        <span className="text-[10px] uppercase tracking-wide rounded-full bg-accent/25 px-2 py-0.5 text-accent-foreground">
          {riskLabel(skill.risk)}
        </span>
        <span className="text-[10px] font-mono text-muted-foreground ml-auto">
          {skill.priceLabel}
        </span>
      </div>

      {/* Bundled strategies + tools */}
      {(strategies.length > 0 || tools.length > 0) && (
        <div className="mt-3 pt-3 border-t border-border/60 space-y-2">
          {strategies.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <Package className="size-3 text-muted-foreground shrink-0" />
              {strategies.map((st) => (
                <span
                  key={st!.id}
                  className="inline-flex items-center gap-1 rounded-full bg-green-500/8 text-green-600 dark:text-green-400 border border-green-500/15 px-2 py-0.5 text-[10px] font-medium"
                >
                  {st!.name}
                </span>
              ))}
            </div>
          )}
          {tools.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pl-5">
              {tools.map((t) => (
                <span
                  key={t!.id}
                  className="inline-flex items-center gap-1 rounded-full bg-blue-500/8 text-blue-600 dark:text-blue-400 border border-blue-500/15 px-2 py-0.5 text-[10px] font-medium"
                >
                  {t!.name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

export function StrategyPickerCard({
  skill,
  mode,
  className,
  selected,
  onSelect,
}: {
  skill: AgentSkill;
  mode: "marketplace" | "wizard";
  className?: string;
  selected?: boolean;
  onSelect?: () => void;
}) {
  if (mode === "marketplace") {
    return (
      <Link
        to="/launch"
        search={{ strategy: skill.id, tab: "new" }}
        className={cn(
          "block rounded-2xl border border-border bg-card p-4 hover:border-accent/40 transition-all duration-200 cursor-pointer",
          className,
        )}
      >
        <StrategyCardInner skill={skill} />
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "rounded-2xl border bg-card p-4 text-left w-full transition-all duration-200 cursor-pointer",
        selected
          ? "border-accent ring-1 ring-accent/30 shadow-sm"
          : "border-border/70 hover:border-accent/40 hover:bg-accent/4",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <ProtocolTile skill={skill} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-foreground">{skill.name}</p>
            {selected && <Check className="size-4 text-accent shrink-0" />}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{skill.tagline}</p>
        </div>
        <span className="text-xs font-mono text-muted-foreground shrink-0">{skill.priceLabel}</span>
      </div>
    </button>
  );
}
