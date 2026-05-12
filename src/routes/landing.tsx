"use client";

import { createFileRoute, Link } from "@tanstack/react-router";
import { OishiMark } from "@/components/oishi-mark";
import {
  ArrowRight,
  Bot,
  Code2,
  Cpu,
  ExternalLink,
  Flame,
  KeyRound,
  Lock,
  ScrollText,
  ShieldCheck,
  Shield,
  Sparkles,
  Wallet,
  Zap,
  Route as RouteIcon,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/landing")({
  head: () => ({
    meta: [
      { title: "Oishi — The wallet your agent can't wreck" },
      {
        name: "description",
        content:
          "Programmable spending for AI agents: Solana-native wallet, LI.FI routing, OKX x402 · MPP · APP alignment, on-chain rules, and reputation.",
      },
    ],
  }),
  component: LandingPage,
});

const easeOut = [0.22, 1, 0.36, 1] as const;

function LandingPage() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen w-full flex justify-center bg-background relative text-foreground overflow-x-hidden">
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.85]"
        aria-hidden
        style={{
          background: [
            "radial-gradient(120% 90% at 50% -15%, color-mix(in oklch, var(--accent) 22%, transparent) 0%, transparent 58%)",
            "radial-gradient(90% 60% at 100% 5%, color-mix(in oklch, var(--primary) 8%, transparent) 0%, transparent 50%)",
            "radial-gradient(70% 50% at 0% 80%, color-mix(in oklch, var(--accent) 10%, transparent) 0%, transparent 45%)",
          ].join(", "),
        }}
      />

      <div
        className={
          "relative w-full max-w-7xl min-h-screen flex flex-col " +
          "px-4 sm:px-6 lg:px-10 xl:px-14 " +
          "sm:border-x border-border/40 lg:shadow-[0_32px_120px_-48px_rgba(20,24,35,0.08)]"
        }
      >
        <motion.header
          className="pt-8 pb-6 sm:pt-10 sm:pb-8 lg:pt-12 lg:pb-10 flex items-center justify-between gap-4 max-w-[1600px] mx-auto w-full"
          initial={reduceMotion ? false : { opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: easeOut }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <OishiMark />
            <span className="font-display text-2xl sm:text-3xl lg:text-4xl tracking-tight truncate">
              Oishi
            </span>
          </div>
          <Link
            to="/onboarding"
            className="text-sm sm:text-base font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0 px-3 py-2 rounded-full hover:bg-secondary/80 -mr-2"
          >
            Sign in
          </Link>
        </motion.header>

        <main className="flex-1 pb-16 sm:pb-20 lg:pb-24 max-w-[1600px] mx-auto w-full">
          {/* Hero */}
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-12 xl:gap-16 items-start">
            <div className="min-w-0">
              <motion.p
                className="text-xs sm:text-sm uppercase tracking-[0.18em] text-muted-foreground"
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05, ease: easeOut }}
              >
                Autonomy without anxiety
              </motion.p>
              <motion.h1
                className="font-display text-[2.35rem] leading-[0.95] sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl mt-3 sm:mt-4 text-balance"
                initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1, ease: easeOut }}
              >
                Give your agent a wallet it{" "}
                <span className="text-accent-foreground decoration-accent/40 underline decoration-2 underline-offset-[0.15em]">
                  can&apos;t wreck
                </span>
                .
              </motion.h1>
              <motion.p
                className="text-muted-foreground text-base sm:text-lg mt-5 sm:mt-6 max-w-xl leading-relaxed"
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.18, ease: easeOut }}
              >
                Programmable caps, on-chain rules, and a reputation score, so your bot can pay for
                real work without turning into an expensive mistake.
              </motion.p>

              <motion.div
                className="mt-8 sm:mt-10 flex flex-col sm:flex-row flex-wrap gap-3"
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.26, ease: easeOut }}
              >
                <Link
                  to="/onboarding"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-ink text-ink-foreground px-6 sm:px-8 py-3.5 sm:py-4 text-sm font-medium shadow-[0_12px_40px_-16px_rgba(0,0,0,0.35)] hover:opacity-95 transition-opacity min-h-[3rem]"
                >
                  Open Oishi <ArrowRight className="size-4 shrink-0" strokeWidth={2.2} />
                </Link>
                <a
                  href="#how"
                  className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 sm:px-8 py-3.5 sm:py-4 text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors min-h-[3rem]"
                >
                  How it works
                </a>
              </motion.div>
            </div>

            <motion.section
              className={
                "mt-12 sm:mt-14 lg:mt-0 rounded-3xl bg-ink text-ink-foreground " +
                "p-6 sm:p-7 lg:p-8 xl:p-9 lg:sticky lg:top-24 xl:top-28"
              }
              aria-label="Example balance"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.98, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.15, ease: easeOut }}
            >
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-ink-foreground/55">
                <motion.span
                  className="size-1.5 rounded-full bg-accent shrink-0"
                  aria-hidden
                  animate={
                    reduceMotion ? undefined : { scale: [1, 1.25, 1], opacity: [1, 0.85, 1] }
                  }
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                />
                Agent-ready balance
              </div>
              <p className="font-display text-5xl sm:text-6xl md:text-7xl tabular mt-4 sm:mt-5 leading-none">
                $1,284<span className="text-ink-foreground/35">.20</span>
              </p>
              <p className="text-sm text-ink-foreground/55 mt-2 sm:mt-3">
                USDC · daily cap respected automatically
              </p>
              <div className="mt-6 sm:mt-8 h-2 rounded-full bg-ink-foreground/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-accent"
                  initial={reduceMotion ? false : { width: "0%" }}
                  whileInView={{ width: "60%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.1, delay: 0.2, ease: easeOut }}
                />
              </div>
              <p className="text-xs text-ink-foreground/50 mt-2 tabular">$30 of $50 used today</p>
            </motion.section>
          </div>

          {/* Partner marquee */}
          <FadeUp className="mt-12 sm:mt-14 lg:mt-16" delay={0.02}>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground text-center mb-3 sm:mb-4">
              Built on rails you already trust
            </p>
            <PartnerMarquee />
          </FadeUp>

          {/* Hook band */}
          <FadeUp className="mt-14 sm:mt-16 lg:mt-24" delay={0.04}>
            <div className="rounded-3xl border border-border bg-card/70 backdrop-blur-sm px-6 sm:px-10 py-8 sm:py-10 lg:py-12 text-center lg:text-left lg:flex lg:items-center lg:gap-12 xl:gap-16">
              <p className="font-display text-2xl sm:text-3xl lg:text-4xl leading-[1.12] text-balance lg:flex-1">
                LLMs don&apos;t understand money — they pattern-match it.{" "}
                <span className="text-muted-foreground">
                  Oishi is the adult in the room when code starts swiping the card.
                </span>
              </p>
              <div className="mt-6 lg:mt-0 flex flex-wrap justify-center lg:justify-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-foreground">
                  <Flame className="size-3.5 text-accent-foreground" strokeWidth={2.2} />
                  No surprise five-figure API bills
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-foreground">
                  <Sparkles className="size-3.5 text-accent-foreground" strokeWidth={2.2} />
                  Rules that actually enforce
                </span>
              </div>
            </div>
          </FadeUp>

          {/* Integration story */}
          <FadeUp className="mt-14 sm:mt-16 lg:mt-24" delay={0.06}>
            <h2 className="text-xs sm:text-sm uppercase tracking-[0.18em] text-muted-foreground mb-4 sm:mb-6">
              Speed meets liquidity
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              <div className="rounded-3xl bg-card border border-border p-6 sm:p-7 flex flex-col gap-4 h-full">
                <div className="flex items-center gap-3">
                  <span className="size-12 rounded-2xl bg-[#14151a] flex items-center justify-center shrink-0 p-2.5">
                    <img
                      src="/images/solanaLogoMark.svg"
                      alt=""
                      className="size-8"
                      width={32}
                      height={32}
                    />
                  </span>
                  <div>
                    <p className="font-medium text-foreground">Solana settlement</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Fast finality · native USDC
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your agent shouldn&apos;t wait on sluggish clears. Same chain your power users
                  already ape on — tuned for instant, cheap movement.
                </p>
              </div>
              <div className="rounded-3xl bg-card border border-border p-6 sm:p-7 flex flex-col gap-4 h-full">
                <div className="flex items-center gap-3">
                  <span className="size-12 rounded-2xl bg-[#14151a] flex items-center justify-center shrink-0 px-2">
                    <img
                      src="/images/logo_lifi_light.svg"
                      alt=""
                      className="h-6 w-auto max-w-[5.5rem]"
                      width={88}
                      height={24}
                    />
                  </span>
                  <div>
                    <p className="font-medium text-foreground">LI.FI routing</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Quotes &amp; bridges across ecosystems
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Stop hand-rolling swaps and bridge UX. Let liquidity find the shortest honest path
                  while Oishi keeps the spend envelope tight.
                </p>
              </div>
            </div>
          </FadeUp>

          {/* OKX agent payments: x402, MPP, APP */}
          <FadeUp className="mt-14 sm:mt-16 lg:mt-24" delay={0.07}>
            <div className="rounded-3xl border border-border bg-gradient-to-br from-card via-card to-accent/5 p-6 sm:p-8 lg:p-10">
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl mt-3 sm:mt-4 max-w-3xl leading-tight text-balance">
                Same vocabulary as the protocols teaching agents how to do business — not just fire
                HTTP requests.
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground mt-4 max-w-2xl leading-relaxed">
                OKX builds on open rails like{" "}
                <strong className="font-medium text-foreground">x402</strong> and{" "}
                <strong className="font-medium text-foreground">MPP</strong> (Machine Payments
                Protocol), then packages the full negotiate → pay → settle loop as negotiate → pay →
                settle loop as <strong className="font-medium text-foreground">APP</strong> (Agent
                Payments Protocol). Oishi meets agents where those standards already want to live.
              </p>
              <ul className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                <OkxProtocolCard
                  icon={<Code2 className="size-5" strokeWidth={2.2} />}
                  name="x402"
                  tag="Paid HTTP, machine-readable"
                  body="HTTP 402 responses carry structured payment requirements so tools and MCP callers discover price, prove funds, and settle — no bespoke checkout per API."
                  href="https://x402.org"
                  linkLabel="x402.org"
                />
                <OkxProtocolCard
                  icon={<Cpu className="size-5" strokeWidth={2.2} />}
                  name="MPP"
                  tag="Machine Payments Protocol"
                  body="A machine-native payment layer: software discovers terms, authorizes spends, and settles programmatically — the open standard that sits alongside x402 for automated commerce."
                  href="https://mpp.dev"
                  linkLabel="mpp.dev"
                />
                <OkxProtocolCard
                  icon={<Bot className="size-5" strokeWidth={2.2} />}
                  name="APP"
                  tag="Agent Payments Protocol"
                  body="OKX’s open standard for quote, method choice, signature, and settlement over HTTP, agent dialogue, or IM — from one-shot charges to metered sessions and escrow."
                  href="https://web3.okx.com/onchainos/dev-docs/payments/app"
                />
              </ul>
            </div>
          </FadeUp>

          {/* Truth bullets */}
          <FadeUp className="mt-14 sm:mt-16 lg:mt-24" delay={0.08}>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl max-w-3xl">
              Three truths every agent team learns the hard way — unless you wire Oishi first.
            </h2>
            <ul className="mt-8 sm:mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              <li className="rounded-3xl border border-dashed border-border/80 bg-muted/30 p-5 sm:p-6">
                <p className="text-sm font-semibold text-foreground">Permission is vague.</p>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  &ldquo;Don&apos;t spend too much&rdquo; isn&apos;t an API. Caps, schedules, and
                  allowlists are.
                </p>
              </li>
              <li className="rounded-3xl border border-dashed border-border/80 bg-muted/30 p-5 sm:p-6">
                <p className="text-sm font-semibold text-foreground">Reputation is invisible.</p>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Counterparties want proof your bot behaves. KYA scores turn history into trust.
                </p>
              </li>
              <li className="rounded-3xl border border-dashed border-border/80 bg-muted/30 p-5 sm:p-6">
                <p className="text-sm font-semibold text-foreground">
                  Chaos scales faster than you.
                </p>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  One bad tool call can drain a wallet. Rules on-chain mean panic becomes a pager,
                  not a post-mortem.
                </p>
              </li>
            </ul>
          </FadeUp>

          <section className="mt-14 sm:mt-16 lg:mt-24">
            <FadeUp>
              <h2 className="text-xs sm:text-sm uppercase tracking-[0.18em] text-muted-foreground mb-4 sm:mb-6 lg:mb-8">
                Why Oishi
              </h2>
            </FadeUp>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
              <Feature
                icon={<Wallet className="size-5" strokeWidth={2.2} />}
                title="One agent wallet"
                body="Native USDC with a handle your agent spends from — not a leaked shared hot wallet."
                index={0}
              />
              <Feature
                icon={<ShieldCheck className="size-5" strokeWidth={2.2} />}
                title="Programmable rules"
                body="Limits, verified recipients, approvals — the chain says no before your Slack does."
                index={1}
              />
              <Feature
                icon={<Zap className="size-5" strokeWidth={2.2} />}
                title="reputation"
                body="Behaviour becomes a score. Great agents look boring on purpose."
                index={2}
              />
            </ul>
          </section>

          <section
            id="security"
            className="mt-14 sm:mt-16 lg:mt-24 scroll-mt-20 sm:scroll-mt-24"
            aria-label="Security and trust"
          >
            <FadeUp>
              <p className="text-xs sm:text-sm uppercase tracking-[0.18em] text-muted-foreground">
                Security &amp; trust
              </p>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl mt-3 sm:mt-4 max-w-3xl leading-tight text-balance">
                Trust is the product. Autonomy is optional until you say so.
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg mt-4 sm:mt-5 max-w-2xl leading-relaxed">
                Oishi is built for teams who ship agents to production: keys stay in the user
                wallet, policies are explicit, and every meaningful move leaves a trail you can
                audit without trusting our servers.
              </p>
            </FadeUp>
            <ul className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <TrustPoint
                icon={<KeyRound className="size-5" strokeWidth={2.2} />}
                title="Non-custodial keys"
                body="Connect with Phantom or Solflare. Signing happens in the wallet you already use — we never receive or store private keys."
                index={0}
              />
              <TrustPoint
                icon={<Shield className="size-5" strokeWidth={2.2} />}
                title="Policy, not vibes"
                body="Spend caps, allowlists, and schedules are enforced as rules — readable constraints your team can review before an agent goes live."
                index={1}
              />
              <TrustPoint
                icon={<ScrollText className="size-5" strokeWidth={2.2} />}
                title="On-chain receipts"
                body="Activity maps to verifiable transfers and state. When something looks off, you follow the chain — not a black-box dashboard."
                index={2}
              />
              <TrustPoint
                icon={<Lock className="size-5" strokeWidth={2.2} />}
                title="Least privilege by default"
                body="Agents get bounded budgets and scoped permissions — not a blank cheque tied to your whole treasury."
                index={3}
              />
            </ul>
          </section>

          <section id="how" className="mt-14 sm:mt-16 lg:mt-24 scroll-mt-20 sm:scroll-mt-24">
            <FadeUp>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl">How it works</h2>
            </FadeUp>
            <div
              role="list"
              aria-label="How Oishi works"
              className="mt-6 sm:mt-8 flex flex-col md:flex-row md:items-stretch md:gap-0 lg:gap-1"
            >
              <Step
                className="flex-1 min-w-0"
                n={1}
                title="Connect"
                body="Phantom or Solflare. Keys never leave the wallet you trust."
                delay={0}
              />
              <div
                className="flex shrink-0 items-center justify-center py-3 md:py-0 md:w-[4.5rem] lg:w-28 md:self-start md:pt-11"
                aria-hidden="true"
              >
                <FlowConnectorVertical className="md:hidden" />
                <FlowConnectorHorizontal className="hidden md:block w-full max-w-none" />
              </div>
              <Step
                className="flex-1 min-w-0"
                n={2}
                title="Fund & cap"
                body="Bridge in with clear routes — then tighten the leash before the agent runs."
                icon={<RouteIcon className="size-4" />}
                delay={0.06}
              />
              <div
                className="flex shrink-0 items-center justify-center py-3 md:py-0 md:w-[4.5rem] lg:w-28 md:self-start md:pt-11"
                aria-hidden="true"
              >
                <FlowConnectorVertical className="md:hidden" />
                <FlowConnectorHorizontal className="hidden md:block w-full max-w-none" />
              </div>
              <Step
                className="flex-1 min-w-0"
                n={3}
                title="Let it spend"
                body="Every payment checked against rules, logged on-chain, boringly predictable."
                icon={<Bot className="size-4" />}
                delay={0.12}
              />
            </div>
          </section>

          <FadeUp>
            <section
              className={
                "mt-14 sm:mt-16 lg:mt-20 rounded-3xl bg-accent text-accent-foreground " +
                "p-6 sm:p-8 lg:p-10 text-center lg:text-left " +
                "lg:flex lg:items-center lg:justify-between lg:gap-10"
              }
            >
              <div className="lg:min-w-0 lg:flex-1">
                <p className="text-sm font-medium opacity-90">The boring outcome is the win</p>
                <p className="font-display text-2xl sm:text-3xl mt-2">
                  Go live before your next demo. Under a minute.
                </p>
              </div>
              <Link
                to="/onboarding"
                className={
                  "mt-5 lg:mt-0 inline-flex items-center justify-center gap-2 rounded-full " +
                  "bg-ink text-ink-foreground px-6 sm:px-8 py-3.5 sm:py-4 text-sm font-medium " +
                  "w-full sm:w-auto lg:w-auto lg:shrink-0 min-h-[3rem] hover:opacity-95 transition-opacity"
                }
              >
                Connect wallet
              </Link>
            </section>
          </FadeUp>
        </main>

        <footer className="py-8 sm:py-10 border-t border-border/60">
          <p className="text-xs sm:text-sm text-muted-foreground text-center max-w-lg mx-auto px-2">
            Oishi — programmable money for agents that ship without apology.
          </p>
        </footer>
      </div>
    </div>
  );
}

function OkxProtocolCard({
  icon,
  name,
  tag,
  body,
  href,
  linkLabel = "OKX docs",
}: {
  icon: ReactNode;
  name: string;
  tag: string;
  body: string;
  href: string;
  linkLabel?: string;
}) {
  return (
    <li className="rounded-2xl bg-background/80 border border-border/80 p-5 sm:p-6 flex flex-col h-full shadow-sm">
      <span className="size-11 shrink-0 rounded-2xl bg-secondary flex items-center justify-center text-foreground">
        {icon}
      </span>
      <p className="mt-4 font-display text-xl sm:text-2xl tracking-tight">{name}</p>
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mt-1">
        {tag}
      </p>
      <p className="text-sm text-muted-foreground mt-3 leading-relaxed flex-1">{body}</p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent-foreground hover:underline underline-offset-4"
      >
        {linkLabel}
        <ExternalLink className="size-3.5 shrink-0 opacity-80" strokeWidth={2.2} />
      </a>
    </li>
  );
}

/** Bezier geometry shared by stroke layers + SMIL motion (React Flow–style edge). */
const FLOW_EDGE_H_D = "M 3 22 C 28 2, 100 2, 125 22";
const FLOW_EDGE_V_D = "M 16 2 C 2 26, 30 68, 16 94";

function FlowConnectorHorizontal({ className = "" }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  const pathId = `how-flow-h-${useId().replace(/:/g, "")}`;

  return (
    <svg
      viewBox="0 0 128 28"
      fill="none"
      aria-hidden
      className={cn("h-[3.25rem] w-full text-foreground/25", className)}
      preserveAspectRatio="none"
    >
      <path
        d={FLOW_EDGE_H_D}
        className="landing-flow-edge-base"
        strokeWidth="2.5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={FLOW_EDGE_H_D}
        strokeWidth="2.25"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        fill="none"
        className="landing-flow-line-fg landing-flow-dash-animate"
      />
      <circle
        cx="3"
        cy="22"
        r="3.5"
        className="fill-card stroke-accent/50"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
      <circle
        cx="125"
        cy="22"
        r="3.5"
        className="fill-card stroke-accent/50"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
      <path id={pathId} d={FLOW_EDGE_H_D} fill="none" stroke="none" strokeWidth="0" />
      {!reduceMotion ? (
        <circle
          r="4"
          className="fill-accent landing-flow-pulse-glow"
          vectorEffect="non-scaling-stroke"
        >
          <animateMotion dur="2.35s" repeatCount="indefinite" rotate="auto" calcMode="linear">
            <mpath href={`#${pathId}`} />
          </animateMotion>
        </circle>
      ) : null}
    </svg>
  );
}

function FlowConnectorVertical({ className = "" }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  const pathId = `how-flow-v-${useId().replace(/:/g, "")}`;

  return (
    <svg
      viewBox="0 0 32 96"
      fill="none"
      aria-hidden
      className={cn("h-24 w-10 text-foreground/25", className)}
      preserveAspectRatio="xMidYMid meet"
    >
      <path
        d={FLOW_EDGE_V_D}
        className="landing-flow-edge-base"
        strokeWidth="2.5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={FLOW_EDGE_V_D}
        strokeWidth="2.25"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        fill="none"
        className="landing-flow-line-fg landing-flow-dash-animate"
      />
      <circle
        cx="16"
        cy="2"
        r="3.5"
        className="fill-card stroke-accent/50"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
      <circle
        cx="16"
        cy="94"
        r="3.5"
        className="fill-card stroke-accent/50"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
      <path id={pathId} d={FLOW_EDGE_V_D} fill="none" stroke="none" strokeWidth="0" />
      {!reduceMotion ? (
        <circle
          r="4"
          className="fill-accent landing-flow-pulse-glow"
          vectorEffect="non-scaling-stroke"
        >
          <animateMotion dur="2.35s" repeatCount="indefinite" rotate="auto" calcMode="linear">
            <mpath href={`#${pathId}`} />
          </animateMotion>
        </circle>
      ) : null}
    </svg>
  );
}

function PartnerMarquee() {
  const reduceMotion = useReducedMotion();
  const chunk = (
    <>
      <MarqueeItem label="Solana">
        <img
          src="/images/solanaLogoMark.svg"
          alt=""
          className="size-7 sm:size-8"
          width={32}
          height={32}
        />
      </MarqueeItem>
      <MarqueeItem label="LI.FI">
        <img
          src="/images/logo_lifi_light.svg"
          alt=""
          className="h-5 sm:h-6 w-auto max-w-[4.5rem]"
          width={72}
          height={24}
        />
      </MarqueeItem>
    </>
  );

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-card text-foreground py-4 sm:py-5 border border-border shadow-sm"
      role="region"
      aria-label="Technology partners"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-24 bg-gradient-to-r from-card to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-24 bg-gradient-to-l from-card to-transparent z-10" />
      <div
        className={
          reduceMotion
            ? "flex flex-wrap justify-center gap-10 sm:gap-14 px-6"
            : "flex w-max landing-marquee-track"
        }
      >
        {reduceMotion ? (
          <>
            {chunk}
            {chunk}
          </>
        ) : (
          <>
            <div className="flex items-center gap-10 sm:gap-16 pl-6 sm:pl-10 pr-4 shrink-0">
              {chunk}
              {chunk}
              {chunk}
            </div>
            <div
              className="flex items-center gap-10 sm:gap-16 pl-4 pr-6 sm:pr-10 shrink-0"
              aria-hidden
            >
              {chunk}
              {chunk}
              {chunk}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MarqueeItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-3 shrink-0">
      <span className="flex items-center justify-center size-10 sm:size-11 rounded-xl bg-secondary border border-border/60">
        {children}
      </span>
      <span className="text-sm font-medium tracking-tight text-foreground">{label}</span>
    </span>
  );
}

function FadeUp({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-72px" }}
      transition={{ duration: reduceMotion ? 0.15 : 0.48, delay, ease: easeOut }}
    >
      {children}
    </motion.div>
  );
}

function TrustPoint({
  icon,
  title,
  body,
  index,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  index: number;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.li
      className="rounded-3xl bg-card border border-border p-5 sm:p-6 flex gap-4 h-full"
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-48px" }}
      transition={{ duration: 0.42, delay: index * 0.06, ease: easeOut }}
    >
      <span className="size-11 shrink-0 rounded-2xl bg-secondary flex items-center justify-center text-foreground">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="font-medium text-foreground text-base">{title}</p>
        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{body}</p>
      </div>
    </motion.li>
  );
}

function Feature({
  icon,
  title,
  body,
  index,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  index: number;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.li
      className="rounded-3xl bg-card border border-border p-5 sm:p-6 flex gap-4 h-full"
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.42, delay: index * 0.07, ease: easeOut }}
    >
      <span className="size-11 shrink-0 rounded-2xl bg-secondary flex items-center justify-center text-foreground">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="font-medium text-foreground text-base">{title}</p>
        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{body}</p>
      </div>
    </motion.li>
  );
}

function Step({
  className,
  n,
  title,
  body,
  icon,
  delay = 0,
}: {
  className?: string;
  n: number;
  title: string;
  body: string;
  icon?: ReactNode;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      role="listitem"
      className={cn(
        "rounded-3xl bg-card border border-border p-5 sm:p-6 flex flex-row md:flex-col gap-4 h-full",
        className,
      )}
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.44, delay, ease: easeOut }}
    >
      <span
        className={
          "size-10 md:size-11 shrink-0 rounded-full bg-card text-foreground text-sm font-semibold " +
          "flex items-center justify-center tabular md:mb-1 border-2 border-accent/35 " +
          "shadow-sm ring-1 ring-border/70"
        }
      >
        {n}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium flex items-center gap-2 flex-wrap text-base">
          {title}
          {icon ? <span className="text-muted-foreground inline-flex">{icon}</span> : null}
        </p>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{body}</p>
      </div>
    </motion.div>
  );
}
