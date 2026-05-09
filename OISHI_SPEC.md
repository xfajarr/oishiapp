# Oishi — Feature Spec & Build Plan

## Narrative
Launch an AI agent that works for you. Pick a strategy — Kamino yield, Jupiter DCA, Meteora LP, Drift perps, Polymarket, freelancing. Set the rules. Fund from any chain. Let it earn. On Solana.

---

## Agent Strategies (8 total)

Each agent is launched with ONE strategy. Users pick a protocol + strategy at creation time. Rules are strategy-aware.

| # | Strategy | Protocol | What It Does | Risk |
|---|---|---|---|---|
| 1 | **Kamino Yield** | Kamino | Deposit USDC/SOL, auto-compound yield | Low |
| 2 | **Jupiter DCA** | Jupiter | Dollar-cost average buy SOL on schedule | Low |
| 3 | **Meteora LP** | Meteora | Provide DLMM liquidity, auto-rebalance | Medium |
| 4 | **Drift Perps** | Drift | Trade perpetual futures with leverage cap | High |
| 5 | **Polymarket** | Polymarket | Trade prediction markets | High |
| 6 | **Jupiter Arbitrage** | Jupiter | Token arbitrage within slippage limits | High |
| 7 | **Marketplace Gigs** | Marketplace | Take paid tasks, complete for USDC | Medium |
| 8 | **Bill Pay** | x402 | Pay API bills and subscriptions on schedule | Low |

### Strategy-Specific Rules

| Strategy | Common Rules | Unique Rules |
|---|---|---|
| Kamino Yield | Max deposit, daily limit | Min APY threshold, auto-compound toggle, allowed vaults |
| Jupiter DCA | Max deposit, daily limit | Amount per buy, frequency (daily/weekly/monthly), max total |
| Meteora LP | Max deposit, daily limit | Max LP amount, pool allowlist, rebalance interval |
| Drift Perps | Max deposit, daily limit | Max position size, max leverage (1x-10x), stop-loss %, allowed markets |
| Polymarket | Max deposit, daily limit | Max bet size, max daily bets, allowed markets/categories |
| Jupiter Arbitrage | Max deposit, daily limit | Max swap size, max slippage %, allowed tokens, min profit threshold |
| Marketplace Gigs | Max deposit, daily limit | Max gig value, auto-accept toggle, allowed categories |
| Bill Pay | Max deposit, daily limit | Allowed vendors, max per-payment, payment schedule |

---

## What Already Exists

| Page | Route | UI | Data | Actions |
|---|---|---|---|---|
| Landing | `/` (public) | ✅ Full page with stats, features, CTA | Hardcoded | "Launch your agent" CTA → onboarding |
| Onboarding | `/onboarding` | ✅ Wallet connect (Phantom + Solflare) | Real wallet adapter | Connect → redirect to app |
| Dashboard | `/_app/` | ✅ Balance card, cap bar, KYA, activity | **All hardcoded** | Quick action links only |
| Rules | `/_app/rules` | ✅ Sliders, toggles, recipient list | **All hardcoded** | Save button **no-op** |
| Fund | `/_app/fund` | ✅ Chain/token select, route viz, progress | **Simulated only** | Bridge button simulates animation |
| Activity | `/_app/activity` | ✅ Grouped list with status icons | **5 hardcoded items** | None |
| Agent Profile | `/_app/agent` | ✅ Identity card, KYA, stats, badges | **All hardcoded** | Share button no-op |

---

## What We Build

### Phase 1 — Fix existing pages (make them real)

#### 1.1 Theme & Shell
- [ ] **Remove gradient** from `ShellChrome` — replace with solid `#0A0A0B`
- [ ] **Switch to dark theme** — update CSS variables in `styles.css`: `--background: oklch(0.06 0.01 260)`, `--foreground: oklch(0.98 0 0)`, etc.
- [ ] **Update font** — Geist → system font stack (no external font dependency for hackathon)
- [ ] Remove `Instrument Serif` and `JetBrains Mono` font imports
- [ ] Update bottom nav: Home · Launch(+) · Marketplace · Activity · Agent

#### 1.2 Dashboard (`/_app/`)
- [ ] **Agent identity header** — handle, strategy badge (e.g., "Kamino Yield"), strategy icon
- [ ] **Real wallet balance** — query SOL + USDC via `@solana/web3.js` `Connection.getBalance()` + `getTokenAccountBalance()`
- [ ] **Real KYA score** — query `hoshi-kya` program PDA via `@coral-xyz/anchor`
- [ ] **Real daily cap** — read from vault program (policy config PDA)
- [ ] **Strategy status** — live indicator: "Active · Auto-compounding" or "Paused · Daily limit reached"
- [ ] **Real activity feed** — query recent transactions from Solana RPC or SDK `getReceipts()`
- [ ] **Quick actions:** Fund · Rules · Activity (links to respective pages)
- [ ] Empty state before agent creation: "No agent yet" → CTA to `/launch`
- [ ] Empty state after agent creation but no balance: "Fund your agent" → CTA to `/fund`

#### 1.3 Rules (`/_app/rules`)
- [ ] **Strategy badge** at top: shows agent's active strategy (e.g., "Kamino Yield · Low Risk")
- [ ] **Wire save button** — builds and signs transaction calling vault program `set_policy`
- [ ] **Load existing rules** — query vault program on mount, populate all fields
- [ ] **Common rules section:** max deposit slider, daily limit slider, approval threshold toggle + amount input, pause agent toggle (emergency stop)
- [ ] **Strategy-specific rules section** — shows only rules relevant to agent's strategy (see strategy-specific rules table above)
- [ ] **Recipient allowlist** — search by address or KYA handle, add/remove, resolve `.hoshi` → pubkey inline
- [ ] Show save confirmation / tx hash / Solscan link after save
- [ ] Show "policy active" indicator (green shield with last-updated timestamp)
- [ ] Toggle "Pause agent" — calls vault `pause_agent`, shows red banner when paused
- [ ] Toggle "Change strategy" — stores intent, requires re-initialization (prompt user to re-launch)

#### 1.4 Fund (`/_app/fund`)
- [ ] **Add `@lifi/sdk`** dependency
- [ ] **Real quote** — call `@lifi/sdk` `getQuote()` or `GET /v1/quote` REST API
- [ ] **Route visualization** — show real route: source chain → bridge name → Solana
- [ ] **Execute bridge** — build transaction via LI.FI SDK
- [ ] **Real progress tracking** — poll `/v1/status` for bridge status
- [ ] Handle: no route found, insufficient balance on source chain, bridge timeout
- [ ] **Connect EVM wallet** for source chain (Wagmi or ethers for Arbitrum/Ethereum/Base)
- [ ] After bridge completion: update Solana balance, add to activity feed

#### 1.5 Activity (`/_app/activity`)
- [ ] **Real transaction history** — query from SDK `getReceipts()` or Solana RPC `getSignaturesForAddress()`
- [ ] Filter by type (sent/received/swapped/bridged/blocked)
- [ ] Date range filter
- [ ] Expandable rows with tx hash, block number, fee
- [ ] Export CSV (client-side)
- [ ] Stats bar: total sent, received, fees, tx count

#### 1.6 Agent Profile (`/_app/agent`)
- [ ] **Agent identity** — handle, display name, owner address (truncated with copy), strategy badge with protocol logo
- [ ] **Real KYA score gauge** — live data from on-chain `reputation_score`, colored arc (Red <25, Yellow 25-70, Green >70, Gold >90)
- [ ] **Strategy card** — protocol name, strategy description, active rules summary (e.g., "Kamino · Auto-compounding ON · Min 5% APY")
- [ ] **Performance stats** — total earnings (SOL + USDC), 7d return %, successful tx count, 0 disputes
- [ ] **Real badge logic** — compute from attestation count, account age, tx volume, strategy-specific milestones (e.g., "10 Kamino Compounds", "100 DCA Buys")
- [ ] **"Publish to marketplace" toggle** — writes to KYA program `metadata_uri` field, marks agent as public
- [ ] **7-day KYA chart** — from stored snapshots or computed on-chain (simulated for demo with real-looking data)
- [ ] Share handle button → copy `@handle.hoshi` to clipboard
- [ ] "View on Solscan" link to KYA Identity PDA

### Phase 2 — New pages

#### 2.1 Launch Agent (`/_app/launch`) — 2-step flow

**Step 1 — Choose Strategy**
- [ ] 8 strategy cards in a scrollable grid (2 columns on mobile)
- [ ] Each card shows: protocol logo/icon, strategy name, risk badge (Low/Med/High), estimated APY/return, 1-line description
- [ ] Selected card highlights with indigo border
- [ ] CTA: "Continue" (disabled until selection)

**Step 2 — Configure Agent**
- [ ] Handle input (must end with `.hoshi`, validated on blur with live check: "Checking..." → "Available" / "Taken")
- [ ] Display name input
- [ ] Strategy name shown (from selection, non-editable)
- [ ] Strategy-specific rules UI:
  - **Common rules (all strategies):** Max deposit slider, daily limit slider, require approval above __ USDC toggle
  - **Kamino Yield:** Min APY % input, auto-compound toggle, allowed vaults multi-select
  - **Jupiter DCA:** Amount per buy input, frequency selector (Daily/Weekly/Monthly), max total input
  - **Meteora LP:** Max LP amount input, pool allowlist multiselect, rebalance interval selector
  - **Drift Perps:** Max position input, leverage slider (1x-10x), stop-loss % input, market allowlist
  - **Polymarket:** Max bet input, max daily bets input, allowed categories checkboxes
  - **Jupiter Arbitrage:** Max swap input, max slippage % input, token allowlist, min profit threshold
  - **Marketplace Gigs:** Max gig value input, auto-accept toggle, category checkboxes
  - **Bill Pay:** Allowed vendors input (URLs), max per-payment, payment schedule (Daily/Weekly/Monthly)
- [ ] Fee breakdown: "KYA registration (~0.003 SOL) + Vault creation (~0.005 SOL) = ~0.008 SOL"
- [ ] Back button to change strategy
- [ ] **"Launch Agent" button:**
  - Calls `hoshi-kya` `claim_handle` instruction (create on-chain identity)
  - Calls vault program `initialize_agent` instruction (create vault with strategy + rules)
  - Progress indicator: "Registering @handle.hoshi..." → "Creating vault..." → "Done!"
  - Success: redirects to dashboard with agent
- [ ] Error states: handle taken, insufficient SOL, wallet rejected tx, RPC timeout
- [ ] Back navigation preserves strategy selection (local state)

#### 2.2 Marketplace (`/_app/marketplace`)
- [ ] **Agent cards** — grid (2 cols mobile): protocol logo, handle, strategy badge (e.g., "Kamino Yield"), KYA score (colored tier), earnings, 7d performance
- [ ] **Sort by**: KYA score, total earnings, 7d return, recently active
- [ ] **Filter by**: strategy/protocol (Kamino, Jupiter, Meteora, Drift, Polymarket, Gigs, Bill Pay), KYA tier (Gold/Green/Yellow/Red), risk level
- [ ] **Agent detail modal**: full profile, strategy description, rules summary, P&L chart, KYA history, "Copy strategy" button (pre-fills launch flow)
- [ ] **Leaderboard bar top**: "Top Yielding This Week" — 3 agents sorted by 7d return %
- [ ] **Live stat**: "42 agents earning" (from program query)
- [ ] Empty state: "No agents published yet. Be the first to list yours!"
- [ ] Data source: query all KYA identity accounts filtering by `metadata_uri` set (published), or seeded demo data

#### 2.3 Landing (`/`) — Update
- [ ] Already exists but needs:
  - Update copy to match narrative
  - "Launch your agent" CTA → `/onboarding?redirect=/_app/launch`
  - Show live stat: "X agents launched" (from KYA program count)

### Phase 3 — On-Chain Programs

#### 3.1 `hoshi-vault` (new Anchor program)
- [ ] **Account struct:** `AgentVault` — owner (Pubkey), kya_identity (Pubkey), strategy_id (u8, enum: Kamino=1, DCA=2, Meteora=3, Drift=4, Polymarket=5, Arbitrage=6, Gigs=7, BillPay=8), policy_config (max_per_tx, daily_limit, approval_threshold, paused, last_daily_reset), strategy_config (union buffer per strategy type), recipient_allowlist (vec<Pubkey>), protocol_allowlist (vec<Pubkey>), bump
- [ ] `initialize_agent` — creates Agent PDA with owner, strategy_id, kya_identity PDA link, default policy
- [ ] `set_strategy_config` — writes strategy-specific config bytes (different schema per strategy_id: Kamino gets min_apy+auto_compound, Drift gets max_leverage+stop_loss, etc.)
- [ ] `set_policy` — updates: max_per_tx, daily_limit, approval_threshold, recipient_allowlist, protocol_allowlist
- [ ] `execute_payment` — checks all policy constraints + strategy constraints, transfers funds if passes, resets daily counter on new day, emits event
- [ ] `update_reputation` — adjusts KYA score delta (called by `hoshi_issuer` only)
- [ ] `pause_agent` — emergency stop, prevents all `execute_payment`
- [ ] `withdraw_all` — owner-only, transfers all funds back to owner
- [ ] `update_strategy` — owner can change strategy (re-initializes strategy_config)
- [ ] Deploy to **devnet**
- [ ] Tests: positive cases, policy violations, strategy-specific enforcement, pause enforcement, daily reset

#### 3.2 Update `hoshi-kya` (if needed)
- [ ] Add `metadata_uri` field support for marketplace listing
- [ ] Add query instruction to list all agents (for marketplace)

### Phase 4 — Agent Execution (simulated for demo)

For the hackathon demo, agent execution is simulated via a pre-scripted sequence:
- [ ] `execute_payment` instruction called manually (simulated as agent action)
- [ ] Policy violation triggered by submitting a tx that exceeds vault limits
- [ ] KYA score updated after each successful payment

Post-hackathon, this becomes the MCP + LLM execution loop.

---

## Dependencies to Add

```json
{
  "@coral-xyz/anchor": "^0.30.1",
  "@lifi/sdk": "^3.x",
  "wagmi": "^2.x",
  "viem": "^2.x",
  "@tanstack/react-table": "^8.x",
  "bs58": "^6.x"
}
```

---

## Data Sources

| Data | Source | Method |
|---|---|---|---|
| SOL balance | `@solana/web3.js` | `connection.getBalance(pubkey)` |
| USDC balance | `@solana/web3.js` | `connection.getTokenAccountBalance(ata)` |
| KYA identity | `hoshi-kya` program | Anchor `program.account.identityAccount.fetch(pda)` |
| KYA reputation | `hoshi-kya` program | Same as above, field `reputationScore` |
| Vault policy + strategy | `hoshi-vault` program | Anchor `program.account.agentVault.fetch(pda)` |
| Transaction history | Solana RPC | `connection.getSignaturesForAddress(pubkey)` + `getParsedTransactions(sigs)` |
| LI.FI quote | `@lifi/sdk` or REST API | `getQuote({ fromChain, toChain, fromToken, toToken, fromAmount })` |
| LI.FI status | `@lifi/sdk` or REST API | `getStatus({ txHash })` |
| Marketplace agents | `hoshi-kya` program | Iterate all `IdentityAccount` PDAs with metadata_uri set (or seeded data for demo) |
| Agent earnings | Simulated (demo) or derived from tx history | Compute from on-chain token account balance changes |

---

## Routes Update

| Route | Page | Status |
|---|---|---|
| `/` | Landing | ✅ Exists, needs copy update |
| `/onboarding` | Wallet connect | ✅ Done |
| `/_app/` | Dashboard | 🛠 Fix data |
| `/_app/launch` | Launch agent | 🆕 Build |
| `/_app/rules` | Policy rules | 🛠 Fix data + wire save |
| `/_app/fund` | Cross-chain deposit | 🛠 Replace simulation with LI.FI SDK |
| `/_app/activity` | Transaction history | 🛠 Fix data |
| `/_app/agent` | Agent profile | 🛠 Fix data |
| `/_app/marketplace` | Agent marketplace | 🆕 Build |

---

## Bottom Nav Update

```
Home  ·  Launch(+)  ·  Marketplace  ·  Activity  ·  Agent
```

The `Launch(+)` is a prominent button (indigo pill, `+` icon).
- If user has NO agent: shows "Launch" (CTA to `/launch`)
- If user HAS agent: shows strategy icon instead of "+", links to `/rules`

---

## Design Rules (strict)

| Rule | Value |
|---|---|
| Background | `#0A0A0B` solid |
| Text | `#FAFAFA` |
| Accent | `#6366F1` (indigo) |
| Border radius | 12px minimum, 16px cards |
| Font | System stack |
| Icons | Lucide only |
| Mobile-first | 375px baseline, max 440px container |
| Gradients | **None** |
| Spacing | 24px desktop, 16px mobile |

---

## Build Order

| Order | Task | Owner | Est. Time | Dependency |
|---|---|---|---|---|---|
| 1 | Fix theme (dark + no gradients) | Frontend | 30m | None |
| 2 | Fix bottom nav | Frontend | 30m | #1 |
| 3 | Build `hoshi-vault` program (with strategy support) | Solana | 8h | None |
| 4 | Deploy `hoshi-vault` to devnet | Solana | 1h | #3 |
| 5 | Wire dashboard real data | Frontend | 3h | #4 |
| 6 | Wire rules page + on-chain save + strategy rules | Frontend | 4h | #4 |
| 7 | Build launch page (2-step strategy picker) | Frontend | 5h | #4 |
| 8 | Wire fund page real LI.FI | Frontend | 4h | None |
| 9 | Wire activity real data | Frontend | 2h | #4 |
| 10 | Wire agent profile real data + strategy card | Frontend | 3h | #4 |
| 11 | Build marketplace page (strategy filter) | Frontend | 4h | #4 |
| 12 | Update landing copy | Frontend | 1h | None |
| 13 | Strategy icons + protocol logos | Frontend | 1h | #7 |
| 14 | Full flow testing + demo prep | Both | 4h | All |
| **Total** | | | **~40h** | |

---

## Key Integration Points

```
User → Oishi UI → @solana/wallet-adapter (sign tx)
                → @coral-xyz/anchor (KYA + vault programs)
                → @solana/web3.js (balance, history)
                → @lifi/sdk (cross-chain quotes + bridge)
                → Solana Devnet (all on-chain state)
                → Strategy config stored in vault PDA per strategy_id
```

---

## Demo Script (final)

```
0:00  Landing page. "Pick a strategy. Launch your agent. Let it earn." CTA.
0:15  Connect Phantom. First-time → onboarding.
0:25  Step 1 — Choose strategy. Scroll through 8 cards. Pick "Kamino Yield."
0:35  Step 2 — Configure. Handle: @myyielder.hoshi. Rules: Max $500 deposit, Min 5% APY, Auto-compound ON.
0:55  Launch. "Registering @myyielder.hoshi..." → "Creating vault..." → Done.
1:10  Dashboard: Agent "Kamino Yield" active. Balance $0. KYA 0. "Fund your agent" CTA.
1:25  Fund: Arbitrum → $500 USDC → Solana. LI.FI quote: "~2 min, $0.82 fee." Execute.
1:45  Bridge progress: Confirm → Bridging → Verifying → Done.
2:00  Dashboard: $500 USDC. Agent status: "Active · Auto-compounding."
2:10  Agent deposits $200 into Kamino. Tx approved. ✅ KYA → 4.
2:25  Agent tries to deposit remaining $500 → BLOCKED. "Exceeds max deposit $200 per tx." 🔴
2:40  Marketplace: @myyielder.hoshi listed. Strategy: Kamino Yield. KYA 4. Min 5% APY.
2:50  "Pick a strategy. Set the rules. Your agent earns. On Solana."
3:00  End.
```

### Demo title
*"Your agent tried to deposit $500. You said $200. It got blocked."*
