/**
 * LLM provider icon + metadata.
 * Renders the actual brand SVG files from /public/images/ via <img> tags.
 * "default" = Oishi-managed model (inline icon, no external key needed).
 */
"use client";

import { cn } from "@/lib/utils";

const OISHI_INDIGO = "#22C55E";
const OISHI_INDIGO_BG = "#22C55E18";

export type ProviderId =
  | "default"
  | "openai"
  | "anthropic"
  | "groq"
  | "xai"
  | "deepseek"
  | "openrouter";

export interface ProviderMeta {
  id: ProviderId;
  label: string;
  sub: string;
  brand: string;
  brandBg: string;
  /** URL placeholder shown when no key is entered */
  keyPlaceholder: string;
}

/** Maps provider ID → SVG filename in /public/images/ (excludes "default") */
const PROVIDER_IMAGE: Partial<Record<ProviderId, string>> = {
  openai: "/images/openai.svg",
  anthropic: "/images/anthropic.svg",
  groq: "/images/groq.svg",
  xai: "/images/xai.svg",
  deepseek: "/images/deepseek-color.svg",
  openrouter: "/images/openrouter.svg",
};

export const PROVIDERS: ProviderMeta[] = [
  {
    id: "default",
    label: "Oishi Model",
    sub: "Oishi-managed — no key needed",
    brand: OISHI_INDIGO,
    brandBg: OISHI_INDIGO_BG,
    keyPlaceholder: "",
  },
  {
    id: "openai",
    label: "OpenAI",
    sub: "GPT-4o, GPT-4o Mini",
    brand: "#10A37F",
    brandBg: "#10A37F18",
    keyPlaceholder: "sk-proj-…",
  },
  {
    id: "anthropic",
    label: "Anthropic",
    sub: "Claude 3.5 Sonnet, Claude 3 Opus",
    brand: "#CC785C",
    brandBg: "#CC785C18",
    keyPlaceholder: "sk-ant-…",
  },
  {
    id: "groq",
    label: "Groq",
    sub: "Fast inference — Llama, Mixtral, DeepSeek",
    brand: "#0A0A0A",
    brandBg: "#0A0A0A18",
    keyPlaceholder: "gsk_…",
  },
  {
    id: "xai",
    label: "xAI",
    sub: "Grok-2, Grok-beta",
    brand: "#1A1A1A",
    brandBg: "#1A1A1A18",
    keyPlaceholder: "xai-…",
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    sub: "DeepSeek V3, Coder",
    brand: "#4D6BFE",
    brandBg: "#4D6BFE18",
    keyPlaceholder: "sk-…",
  },
  {
    id: "openrouter",
    label: "OpenRouter",
    sub: "Access 100+ models via one key",
    brand: "#7C3AED",
    brandBg: "#7C3AED18",
    keyPlaceholder: "sk-or-…",
  },
];

// ── Brand SVG icons loaded from /public/images/ (or inline for "default") ─
function ProviderSvgIcon({ id, size = 20 }: { id: ProviderId; size?: number }) {
  if (id === "default") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-label="Oishi Model">
        <circle cx="12" cy="12" r="10" fill="white" />
        <path d="M8 12a4 4 0 0 0 8 0V8a4 4 0 0 0-8 4z" fill="currentColor" opacity={0.85} />
        <circle cx="12" cy="12" r="1.5" fill="white" />
      </svg>
    );
  }

  const src = PROVIDER_IMAGE[id];
  if (!src) return null;
  return <img src={src} alt="" width={size} height={size} className="shrink-0" loading="lazy" />;
}

// ── Provider selection card ───────────────────────────────────────────────
export function ProviderCard({
  meta,
  selected,
  onSelect,
}: {
  meta: ProviderMeta;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left w-full",
        "transition-all duration-200 cursor-pointer min-h-[52px]",
        selected
          ? "border-[#22C55E] bg-[#22C55E]/10 shadow-sm"
          : "border-border/70 bg-card/60 hover:border-[#22C55E]/40 hover:bg-[#22C55E]/5",
      )}
    >
      {/* Brand icon */}
      <div
        className={cn(
          "size-8 shrink-0 rounded-lg flex items-center justify-center transition-all duration-200",
        )}
        style={{
          background: selected ? OISHI_INDIGO : "hsl(var(--secondary))",
        }}
      >
        <div
          className="flex items-center justify-center transition-all duration-200"
          style={{
            opacity: selected ? 1 : 0.5,
            color: selected ? "white" : "currentColor",
            filter: selected ? "brightness(1)" : "brightness(0.5)",
          }}
        >
          <ProviderSvgIcon id={meta.id} size={selected ? 18 : 16} />
        </div>
      </div>

      {/* Labels */}
      <div className="min-w-0 flex-1 leading-tight">
        <p className="text-xs font-semibold truncate transition-colors duration-200">
          {meta.label}
        </p>
        <p className="text-[10px] text-muted-foreground truncate">{meta.sub}</p>
      </div>

      {/* Selected checkmark */}
      {selected && (
        <div className="shrink-0 size-5 rounded-full flex items-center justify-center bg-[#22C55E]">
          <svg viewBox="0 0 12 12" className="size-3" fill="none" aria-hidden>
            <path
              d="M2 6l3 3 5-5"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </button>
  );
}
