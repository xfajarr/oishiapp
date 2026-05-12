import type { AgentSkill } from "@/data/agent-skills";

export function ProtocolTile({
  skill,
  className,
  size = "md",
}: {
  skill: AgentSkill;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const dims = size === "sm" ? "size-8" : size === "lg" ? "size-14" : "size-10";

  return (
    <div
      className={`shrink-0 rounded-xl flex items-center justify-center overflow-hidden bg-white ${dims} ${className ?? ""}`}
    >
      {skill.icon && (
        <img src={skill.icon} alt={skill.protocol} className="size-full object-contain p-1.5" />
      )}
    </div>
  );
}
