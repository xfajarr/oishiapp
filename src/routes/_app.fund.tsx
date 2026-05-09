import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppPage } from "@/components/app-page";
import {
  IconArbitrum,
  IconBase,
  IconEthereum,
  IconLifi,
  IconSolana,
  IconUSDC,
  IconUSDT,
} from "@/components/bridge/crypto-icons";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ArrowRight, Check, ChevronRight, Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

export const Route = createFileRoute("/_app/fund")({
  head: () => ({
    meta: [
      { title: "Fund agent — Hoshi" },
      {
        name: "description",
        content: "Bridge funds from Arbitrum to your agent's Solana wallet via LI.FI.",
      },
    ],
  }),
  component: FundPage,
});

type ChainId = "arbitrum" | "ethereum" | "base";
type TokenId = "eth" | "usdc" | "usdt";

type AnyIcon = (props: { className?: string }) => ReactNode;

const CHAINS: { id: ChainId; name: string; Icon: AnyIcon }[] = [
  { id: "arbitrum", name: "Arbitrum", Icon: IconArbitrum },
  { id: "ethereum", name: "Ethereum", Icon: IconEthereum },
  { id: "base", name: "Base", Icon: IconBase },
];

const TOKENS_BY_CHAIN: Record<ChainId, { id: TokenId; label: string; Icon: AnyIcon }[]> = {
  arbitrum: [
    { id: "eth", label: "ETH", Icon: IconEthereum },
    { id: "usdc", label: "USDC", Icon: IconUSDC },
    { id: "usdt", label: "USDT", Icon: IconUSDT },
  ],
  ethereum: [
    { id: "eth", label: "ETH", Icon: IconEthereum },
    { id: "usdc", label: "USDC", Icon: IconUSDC },
    { id: "usdt", label: "USDT", Icon: IconUSDT },
  ],
  base: [
    { id: "eth", label: "ETH", Icon: IconEthereum },
    { id: "usdc", label: "USDC", Icon: IconUSDC },
  ],
};

const BRIDGE_STEPS = [
  "Route locked with LI.FI",
  "Confirming on source chain",
  "Cross-chain relay active",
  "Crediting agent on Solana",
] as const;

type BridgePhase = "idle" | "quoting" | "bridging" | "success";

const ETH_USD = 3185;

/** One visual style for both source selects — avoids mixed borders / alignment */
const sourceSelectTriggerClass =
  "h-11 w-full rounded-2xl border border-border bg-card px-3 shadow-none " +
  "focus:outline-none focus:ring-2 focus:ring-ring/25 focus:ring-offset-0";

function formatSendAmount(n: number, symbol: string) {
  if (symbol === "ETH") {
    if (n < 0.0001) return n.toExponential(2);
    return n >= 1 ? n.toFixed(4) : n.toFixed(5);
  }
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function FundPage() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("500");
  const [chainId, setChainId] = useState<ChainId>("arbitrum");
  const [tokenId, setTokenId] = useState<TokenId>("eth");
  const [phase, setPhase] = useState<BridgePhase>("idle");
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const quotingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bridgeTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const tokens = TOKENS_BY_CHAIN[chainId];
  const tokenMeta = tokens.find((t) => t.id === tokenId) ?? tokens[0];
  const chainMeta = CHAINS.find((c) => c.id === chainId)!;
  const ChainIcon = chainMeta.Icon;
  const TokenIcon = tokenMeta.Icon;

  useEffect(() => {
    if (!tokens.some((t) => t.id === tokenId)) {
      setTokenId(tokens[0].id);
    }
  }, [chainId, tokenId, tokens]);

  const receiveUsdc = Math.max(0, parseFloat(amount.replace(/,/g, "")) || 0);

  const quote = useMemo(() => {
    const feeBps = 14;
    const mult = 1 + feeBps / 10_000;
    let sendAmount: number;
    let sendSymbol: string;
    if (tokenId === "eth") {
      sendAmount = (receiveUsdc * mult) / ETH_USD;
      sendSymbol = "ETH";
    } else if (tokenId === "usdc") {
      sendAmount = receiveUsdc * mult;
      sendSymbol = "USDC";
    } else {
      sendAmount = receiveUsdc * mult;
      sendSymbol = "USDT";
    }

    const networkFeeUsd = chainId === "ethereum" ? 1.12 : chainId === "base" ? 0.08 : 0.21;
    const etaSec = chainId === "ethereum" ? 48 : chainId === "base" ? 35 : 28;

    return { sendAmount, sendSymbol, networkFeeUsd, etaSec };
  }, [receiveUsdc, chainId, tokenId]);

  useEffect(() => {
    return () => {
      if (quotingTimer.current) clearTimeout(quotingTimer.current);
      bridgeTimers.current.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    bridgeTimers.current.forEach(clearTimeout);
    bridgeTimers.current = [];
    if (phase !== "bridging") return;

    setProgress(8);
    setStepIndex(0);

    const schedule = (delay: number, fn: () => void) => {
      const id = setTimeout(fn, delay);
      bridgeTimers.current.push(id);
    };

    schedule(500, () => {
      setProgress(28);
      setStepIndex(1);
    });
    schedule(1900, () => {
      setProgress(55);
      setStepIndex(2);
    });
    schedule(3600, () => {
      setProgress(78);
      setStepIndex(3);
    });
    schedule(5200, () => {
      setProgress(100);
      setStepIndex(3);
    });
    schedule(5600, () => setPhase("success"));
  }, [phase]);

  const interactive = phase === "idle";

  function startBridge() {
    if (!receiveUsdc || phase !== "idle") return;
    setPhase("quoting");
    quotingTimer.current = setTimeout(() => {
      setPhase("bridging");
    }, 1100);
  }

  function resetFlow() {
    if (quotingTimer.current) clearTimeout(quotingTimer.current);
    bridgeTimers.current.forEach(clearTimeout);
    bridgeTimers.current = [];
    setPhase("idle");
    setProgress(0);
    setStepIndex(0);
  }

  return (
    <AppPage subtitle="bridge · li.fi" title="Fund agent">
      <p className="text-sm text-muted-foreground mt-1 mb-6">
        Bridge from the chain and token you already hold. Your agent receives native USDC on Solana.
      </p>

      <section className="rounded-3xl bg-card border border-border p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Receive on Solana (USDC)
        </p>
        <input
          inputMode="decimal"
          value={amount}
          disabled={!interactive}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
          className="w-full mt-2 bg-transparent font-display text-6xl tabular outline-none disabled:opacity-50"
        />
        <div className="mt-4 flex gap-2 flex-wrap">
          {["100", "250", "500", "1000"].map((v) => (
            <button
              key={v}
              type="button"
              disabled={!interactive}
              onClick={() => setAmount(v)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                amount === v
                  ? "bg-ink text-ink-foreground border-ink"
                  : "bg-secondary text-foreground border-border",
                !interactive && "opacity-50 pointer-events-none",
              )}
            >
              ${v}
            </button>
          ))}
        </div>
      </section>

      {/* Source selection + route */}
      <section className="mt-4 rounded-3xl bg-card border border-border p-5 space-y-5">
        <div>
          <p className="text-sm font-medium mb-3">Source</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Chain
              </span>
              <Select
                disabled={!interactive}
                value={chainId}
                onValueChange={(v) => {
                  const c = v as ChainId;
                  setChainId(c);
                  const next = TOKENS_BY_CHAIN[c][0].id;
                  setTokenId(next);
                }}
              >
                <SelectTrigger className={sourceSelectTriggerClass}>
                  <div className="flex min-w-0 flex-1 items-center text-left">
                    <SelectValue placeholder="Chain" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {CHAINS.map(({ id, name, Icon }) => (
                    <SelectItem key={id} value={id} className="py-2.5">
                      <span className="flex items-center gap-2.5 min-w-0">
                        <Icon className="size-5 shrink-0" />
                        <span className="truncate">{name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Token
              </span>
              <Select
                disabled={!interactive}
                value={tokenId}
                onValueChange={(v) => setTokenId(v as TokenId)}
              >
                <SelectTrigger className={sourceSelectTriggerClass}>
                  <div className="flex min-w-0 flex-1 items-center text-left">
                    <SelectValue placeholder="Token" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {tokens.map(({ id, label, Icon }) => (
                    <SelectItem key={id} value={id} className="py-2.5">
                      <span className="flex items-center gap-2.5 min-w-0">
                        <Icon className="size-5 shrink-0" />
                        <span className="truncate">{label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-3">Route</p>
          <div className="flex items-stretch justify-between gap-1 sm:gap-2">
            <RouteLeg
              icon={
                <RouteTokenPair
                  left={<ChainIcon className="size-[22px]" />}
                  right={<TokenIcon className="size-[22px]" />}
                />
              }
              label={chainMeta.name}
              sub={tokenMeta.label}
            />
            <FlowArrow />
            <RouteLeg icon={<IconLifi className="size-7" />} label="LI.FI" sub="Bridge" compact />
            <FlowArrow />
            <RouteLeg
              highlight
              icon={
                <RouteTokenPair
                  variant="accent"
                  left={<IconSolana className="size-[22px]" />}
                  right={<IconUSDC className="size-[22px]" />}
                />
              }
              label="Solana"
              sub="USDC"
            />
          </div>
        </div>

        <ul className="space-y-2 text-sm pt-1">
          <Row
            k="You send"
            v={`${formatSendAmount(quote.sendAmount, quote.sendSymbol)} ${quote.sendSymbol}`}
            bold
          />
          <Row k="Estimated time" v={phase === "quoting" ? "Fetching…" : `~${quote.etaSec}s`} />
          <Row
            k="Network + bridge fee"
            v={phase === "quoting" ? "—" : `~$${quote.networkFeeUsd.toFixed(2)}`}
          />
          <Row k="You receive" v={`${receiveUsdc || "0"} USDC`} bold />
        </ul>

        {(phase === "bridging" || phase === "success") && (
          <div className="pt-2 border-t border-border space-y-3" aria-live="polite">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                {phase === "success" ? "Bridge complete" : "Bridge in progress"}
              </span>
              <span className="text-xs tabular text-muted-foreground">{progress}%</span>
            </div>
            <Progress className="h-2 bg-secondary" value={progress} />
            <ol className="space-y-1.5">
              {BRIDGE_STEPS.map((label, i) => {
                const complete = phase === "success" || i < stepIndex;
                const inProgress = phase === "bridging" && i === stepIndex;
                return (
                  <li
                    key={label}
                    className={cn(
                      "flex items-center gap-2 text-xs transition-colors",
                      complete
                        ? "text-success"
                        : inProgress
                          ? "text-foreground font-medium"
                          : "text-muted-foreground",
                    )}
                  >
                    {complete ? (
                      <Check className="size-3.5 shrink-0 text-success" strokeWidth={2.5} />
                    ) : inProgress ? (
                      <Loader2 className="size-3.5 shrink-0 animate-spin" />
                    ) : (
                      <span className="size-3.5 shrink-0 rounded-full border border-border" />
                    )}
                    {label}
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </section>

      {phase === "success" ? (
        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={() => navigate({ to: "/activity" })}
            className="w-full rounded-full bg-ink text-ink-foreground py-4 font-medium inline-flex items-center justify-center gap-2"
          >
            <Check className="size-4" /> View in activity
          </button>
          <button
            type="button"
            onClick={resetFlow}
            className="w-full rounded-full border border-border bg-background py-3.5 text-sm font-medium text-foreground"
          >
            Bridge again
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={!receiveUsdc || (phase !== "idle" && phase !== "quoting")}
          onClick={() => (phase === "idle" ? startBridge() : undefined)}
          className="mt-6 w-full rounded-full bg-ink text-ink-foreground py-4 font-medium inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
        >
          {phase === "quoting" ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Finding best route…
            </>
          ) : phase === "bridging" ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Bridging…
            </>
          ) : (
            <>
              <ChevronRight className="size-4" />
              Review &amp; bridge
            </>
          )}
        </button>
      )}
    </AppPage>
  );
}

function FlowArrow() {
  return (
    <div className="flex flex-col items-center justify-center shrink-0 px-0.5 text-muted-foreground self-center">
      <ArrowRight className="size-4" strokeWidth={2} />
    </div>
  );
}

function RouteTokenPair({
  left,
  right,
  variant = "default",
}: {
  left: ReactNode;
  right: ReactNode;
  variant?: "default" | "accent";
}) {
  const ring = variant === "accent" ? "ring-2 ring-white/45" : "ring-2 ring-border/60";
  const well = variant === "accent" ? "bg-white/20 shadow-sm" : "bg-card shadow-sm";

  return (
    <div className="flex w-full justify-center">
      <div className="flex items-center justify-center">
        <span
          className={cn(
            "inline-flex size-8 items-center justify-center rounded-full",
            well,
            ring,
            "relative z-10",
          )}
        >
          {left}
        </span>
        <span
          className={cn(
            "-ml-3 inline-flex size-8 items-center justify-center rounded-full",
            well,
            ring,
            "relative z-20",
          )}
        >
          {right}
        </span>
      </div>
    </div>
  );
}

function RouteLeg({
  icon,
  label,
  sub,
  highlight,
  compact,
}: {
  icon: ReactNode;
  label: string;
  sub: string;
  highlight?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex-1 min-w-0 rounded-2xl px-2 py-3 flex flex-col items-stretch justify-center gap-2 text-center border border-transparent",
        highlight ? "bg-accent text-accent-foreground shadow-sm" : "bg-secondary text-foreground",
        compact && "py-2.5",
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-full justify-center",
          compact ? "min-h-[2.25rem] items-center" : "min-h-10 items-center",
        )}
      >
        <div
          className={cn(!compact && "flex w-full justify-center", compact && "flex justify-center")}
        >
          {icon}
        </div>
      </div>
      <div className={cn("w-full px-0.5", compact ? "leading-tight" : "")}>
        <p className="text-[11px] font-semibold leading-tight truncate">{label}</p>
        <p className="text-[9px] uppercase tracking-widest opacity-75 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{k}</span>
      <span className={cn("tabular text-right", bold && "font-medium")}>{v}</span>
    </li>
  );
}
