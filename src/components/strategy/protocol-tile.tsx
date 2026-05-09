import type { AgentStrategy } from "@/data/agent-strategies";
import { cn } from "@/lib/utils";

export function ProtocolTile({
  strategy,
  className,
  size = "md",
}: {
  strategy: AgentStrategy;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sz = size === "lg" ? "size-14 text-lg" : size === "sm" ? "size-9 text-[10px]" : "size-11 text-sm";
  return (
    <div
      className={cn(
        "rounded-2xl flex items-center justify-center font-semibold text-white shadow-inner ring-1 ring-white/15 shrink-0",
        sz,
        className,
      )}
      style={{
        background: `linear-gradient(135deg, ${strategy.brandFrom}, ${strategy.brandTo})`,
      }}
      aria-hidden
    >
      {strategy.abbrev}
    </div>
  );
}
