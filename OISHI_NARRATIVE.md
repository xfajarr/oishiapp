# Oishi — Launch AI agents that earn for you

> **Pick a strategy. Set the rules. Let it earn. On Solana.**

---

## The Problem

AI agents are the next billion users of the internet. But today, giving an agent money means:

| Option | Problem |
|---|---|
| Hand over your private key | It can drain your wallet |
| Don't give it money | Agent is useless |
| Manually approve every transaction | Defeats the purpose |

**There is no middle ground between full access and no access.**

---

## What Oishi Does

Oishi lets anyone launch an AI agent with a specific strategy in 3 taps:

1. **Pick a strategy** — Kamino Yield, Jupiter DCA, Meteora LP, Drift Perps, Polymarket, Arbitrage, Freelancing, or Bill Pay
2. **Set spending rules** — Strategy-specific limits, daily caps, stop-losses, allowed protocols
3. **Fund from any chain** — Arbitrum, Ethereum, Base → USDC on Solana via LI.FI

The agent works 24/7 — compounding yield, DCA buying, LP rebalancing, perp trading, gig taking — within your guardrails. Every action builds portable KYA reputation. Every rule is enforced by a Solana vault program.

**No code. Three taps. Your agent earns while you sleep.**

---

## Narrative

### One-liner
*Pick a strategy. Launch an agent. Set the rules. Let it earn. On Solana.*

### Elevator Pitch
AI agents can earn money — but no one wants to hand over a wallet with no limits. Oishi lets anyone launch an AI agent with real Solana strategies in 3 taps. Pick Kamino Yield for passive income. Pick Jupiter DCA for automated dollar-cost averaging. Pick Drift Perps to trade with leverage limits. Set your rules. Fund from any chain via LI.FI. The agent earns 24/7 within guardrails. Every action is transparent. Every limit enforced on-chain. On Solana.

### The Emotional Sell

| You feel... | Because... |
|---|---|
| Curious | "Wait, an AI agent can compound yield for me on Kamino?" |
| In control | "I set max 3x leverage. Max $100 deposit. It can't blow up my account." |
| Lazy (in a good way) | "It auto-rebalances LP ranges. I do nothing." |
| Proud | "My agent has KYA 78. 12.4% APY this month. Top 5%." |
| Trusting | "I can see every trade, every compound, every fee. Nothing hidden." |

---

## Why Oishi Wins

| Competitor | What They Do | Why Oishi Is Different |
|---|---|---|
| Phantom | Wallet. You do everything manually. | Agent does the work. You watch the earnings. |
| Virtuals / Tars | Tokenize agents. Speculation. | Agent earns for YOU via real DeFi protocols. Not a token. |
| ClawSwap / NEAR Market | Agent-to-agent gigs. | Agent works for its OWNER first. DeFi, yield, trading. Marketplace is bonus. |
| Solana Agent Kit | Developer toolkit. Code required. | 3 taps. No code. Consumer app with pre-built strategies. |
| Pay.sh | API marketplace for agents. | The wallet + rules layer agents need BEFORE using Pay.sh. |
| Kamino / Drift directly | Protocol apps. Manual. | Agent automates the strategy. You set rules, not position sizes. |

---

## Agent Strategies

| Strategy | Protocol | What It Does | Risk |
|---|---|---|---|
| **Kamino Yield** | Kamino | Deposit USDC/SOL, auto-compound yield | Low |
| **Jupiter DCA** | Jupiter | Dollar-cost average buy SOL on schedule | Low |
| **Meteora LP** | Meteora | Provide DLMM liquidity, auto-rebalance | Medium |
| **Drift Perps** | Drift | Trade perpetual futures with leverage cap | High |
| **Polymarket** | Polymarket | Trade prediction markets | High |
| **Jupiter Arbitrage** | Jupiter | Token arbitrage within slippage limits | High |
| **Marketplace Gigs** | Marketplace | Take paid tasks, complete for USDC | Medium |
| **Bill Pay** | x402 | Pay API bills and subscriptions on schedule | Low |

---

## Stack Positioning

```
┌──────────────────────────────────────┐
│  OISHI  —  Consumer app              │  ← Pick strategy. Set rules. Let it earn.
├──────────────────────────────────────┤
│  HOSHI  —  Financial OS for agents   │  ← SDK, engine, MCP, gateway, KYA, vault
├──────────────────────────────────────┤
│  PROTOCOLS — Kamino, Jupiter, etc.    │  ← Real DeFi execution
├──────────────────────────────────────┤
│  SOLANA  —  Settlement layer         │  ← 400ms finality, sub-cent fees, USDC
└──────────────────────────────────────┘
```

---

## Features

### Core Features

| # | Feature | Consumer Value | Demo Moment |
|---|---|---|---|
| 1 | **Pick a strategy** | 8 real DeFi strategies. No code. | Tap "Kamino Yield" → agent auto-compounds at 8% APY. |
| 2 | **Launch agent** | Name it. `.hoshi` identity on-chain. Done. | `@myyielder.hoshi` created. Identity + vault live. |
| 3 | **Set rules** | Strategy-specific: "Max 3x leverage." "Min 5% APY." "Stop-loss 15%." | Agent tries $500 deposit → BLOCKED. "Max $200/tx." |
| 4 | **Fund from anywhere** | One tap bridges from Arbitrum/Ethereum/Base via LI.FI. | Arbitrum → Solana. 2 minutes. Done. |
| 5 | **Agent earns** | Compounds yield. DCAs buys. Rebalances LP. Trades within limits. | "Your agent earned $3.50 this week at 8.2% APY on Kamino." |
| 6 | **Reputation grows** | KYA score ticks up. Badges unlock. Top 5% leaderboard. | "Your agent is KYA 78 — top 5% of Kamino agents." |
| 7 | **List on marketplace** | Others browse your agent's strategy + track record. | "12 agents running your Kamino setup" |
| 8 | **You stay in control** | Change rules. Pause agent. Withdraw anytime. | "Pause" → instant. "Withdraw all" → back to your wallet. |

---

## Pages

| # | Page | Route | Function |
|---|---|---|---|
| 1 | **Landing** | `/` | Hero + CTA, live stats: "42 agents earning" |
| 2 | **Onboarding** | `/onboarding` | Connect wallet → redirect to launch |
| 3 | **Launch** | `/launch` | 2-step: pick strategy → configure + deploy |
| 4 | **Dashboard** | `/` | Portfolio, strategy status, KYA, activity, quick actions |
| 5 | **Rules** | `/rules` | Common limits + strategy-specific rules, pause toggle |
| 6 | **Fund** | `/fund` | Cross-chain deposit via LI.FI. Real quotes + execution. |
| 7 | **Activity** | `/activity` | All tx: earned, spent, blocked, bridged |
| 8 | **Agent Profile** | `/agent` | Identity, strategy, KYA, earnings, publish toggle |
| 9 | **Marketplace** | `/marketplace` | Browse by strategy, KYA, earnings. Leaderboard. |

---

## 3-Minute Demo

```
0:00  Landing. "Pick a strategy. Launch your agent. Let it earn."
0:15  Connect Phantom → onboarding.
0:25  Step 1: Choose "Kamino Yield" from 8 strategy cards.
0:35  Step 2: Handle @myyielder.hoshi. Rules: $500 max, Min 5% APY, Auto-compound ON.
0:55  Launch → "Registering identity..." → "Creating vault..." → Done.
1:10  Dashboard: "Kamino Yield" active. KYA 0. "Fund your agent."
1:25  Fund: Arbitrum → $500 USDC → Solana. LI.FI: "2 min, $0.82 fee."
1:45  Bridge progress: Confirm → Bridging → Verifying → Done.
2:00  Dashboard: $500 USDC. Agent: "Active · Auto-compounding."
2:10  Agent deposits $200 → Kamino. ✅ Approved. KYA → 4.
2:25  Agent tries $500 deposit → BLOCKED. "Exceeds max $200/tx." 🔴
2:40  Marketplace: @myyielder.hoshi listed. Kamino Yield. KYA 4.
2:50  "Pick a strategy. Set the rules. Your agent earns. On Solana."
3:00  End.
```

### Demo title
*"Your agent tried to deposit $500. You said $200. It got blocked."*

---

## Hackathon Track Coverage

### Track 1: Best App Overall on Solana
| Requirement | Covered By |
|---|---|
| Unique Solana Rust program | `hoshi-kya` (on-chain identity) + `hoshi-vault` (on-chain policy with strategy support) |
| Deployed to devnet | Both programs |
| Open-source GitHub | Public repo |
| Reimagines how people interact | "Pick a strategy. Launch an agent. It earns on real Solana protocols." |
| Innovative in payments | Agent payments with programmable guardrails, x402 (Bill Pay strategy), real DeFi strategy execution |

### Track 2: Best Cross-Chain Solana UX (LI.FI)
| Requirement | Covered By |
|---|---|
| Meaningful LI.FI integration | Real `/v1/quote` calls, cross-chain deposit from Arbitrum/Ethereum/Base to Solana |
| Solana as core user journey | Entire product runs on Solana — agent vault, KYA, DeFi strategies all Solana-native |
| Clear user problem | Users hold assets on other chains. One-tap bridge to fund their Solana agent strategy. |

---

## Design Rules

- **No gradients.** Flat, solid backgrounds only.
- **Dark theme:** `#0A0A0B` background, `#FAFAFA` text.
- **Rounded everything.** Cards, inputs, buttons — minimum `border-radius: 12px`.
- **Mobile-first.** Layouts start at 375px. Desktop is progressive enhancement.
- **Single accent color:** `#6366F1` (indigo). Used sparingly.
- **Typography:** System font stack. Headings: 600 weight. Body: 400 weight.
- **Lucide icons only.** Protocol logos as inline SVGs.
- **Clean spacing:** `24px` default, `16px` on mobile.

---

## Submission

**Headline:** Oishi — Pick a strategy. Launch an agent. Let it earn. On Solana.

**Description:** Oishi lets anyone launch an AI agent with real Solana DeFi strategies in 3 taps. Pick Kamino Yield, Jupiter DCA, Meteora LP, Drift Perps, Polymarket, Arbitrage, Freelancing, or Bill Pay. Set strategy-specific rules (max leverage, stop-loss, min APY). Fund from any chain via LI.FI. The agent works 24/7 within guardrails while you sleep. Every action builds portable on-chain KYA reputation. Every rule is enforced by a Solana vault program. No code. Pick a strategy. Let it earn.

**Demo title:** *"Your agent tried to deposit $500. You said $200. It got blocked."*
