# Oishi — Deep Audit: What Exists vs What's Missing

> Full codebase audit. Every file read. Every hardcoded value traced. Every no-op button documented.

---

## 1. What Actually Exists (more than expected)

The frontend is further along than the initial review suggested. New discoveries:

| Discovery | Detail |
|---|---|
| **Launch wizard exists** | `_app.launch.tsx` — full 3-step flow (Identity → Strategy → Rules). Explicitly documented as "Prototype: nothing is written on-chain." |
| **Marketplace exists** | `_app.marketplace.tsx` — 8 strategy cards with category filter |
| **Strategy system exists** | `src/data/agent-strategies.ts` — 8 strategies defined, each with rules forms |
| **Handle validation exists** | `src/lib/oishi-handle.ts` — normalize, validate, `.oishi` suffix (client-only) |
| **Strategy components** | `src/components/strategy/` — 3 files: picker card, rules forms, protocol tile |
| **Profile combines routes** | `/agent` and `/rules` both redirect to `/profile` which has identity + KYA + rules |
| **Landing page is polished** | 856 lines — hero, features, protocol cards, animated how-it-works, client logos |
| **8 strategies defined** | polymarket, meteora, kamino, sanctum, drift, jupiter, raydium, marginfi |

### Routes (actual)

| Route | File | Status |
|---|---|---|
| `/` | `__root.tsx` | Shell wrapper (providers, Error/404) |
| `/landing` | `landing.tsx` | Marketing page — complete |
| `/onboarding` | `onboarding.tsx` | Wallet connect — **REAL** (only real integration) |
| `/_app/` | `_app.index.tsx` | Dashboard — **all hardcoded** |
| `/_app/activity` | `_app.activity.tsx` | Activity log — **5 hardcoded items** |
| `/_app/agent` | `_app.agent.tsx` | **Redirect** → `/profile` |
| `/_app/fund` | `_app.fund.tsx` | Bridge page — **100% simulated** |
| `/_app/launch` | `_app.launch.tsx` | Launch wizard — **prototype only** |
| `/_app/marketplace` | `_app.marketplace.tsx` | Strategy cards — **hardcoded data** |
| `/_app/profile` | `_app.profile.tsx` | Agent identity + rules — **all hardcoded, buttons no-op** |
| `/_app/rules` | `_app.rules.tsx` | **Redirect** → `/profile` |

### Defined strategies (src/data/agent-strategies.ts)

| ID | Protocol | Name | Risk | Category |
|---|---|---|---|---|
| `polymarket` | Polymarket | Prediction mark | High | Trading |
| `meteora` | Meteora | Dynamic LP | Medium | Liquidity |
| `kamino` | Kamino | Lend & earn | Low | Yield |
| `sanctum` | Sanctum | Liquid stake | Low | Staking |
| `drift` | Drift | Perps & spots | High | Trading |
| `jupiter` | Jupiter | Swap & DCA | Medium | Trading |
| `raydium` | Raydium | AMM LP | Medium | Liquidity |
| `marginfi` | marginfi | Lend & borrow | High | Yield |

Note: These differ slightly from our spec. Frontend uses `.oishi` handle suffix (not `.hoshi`).

---

## 2. Everything That's Hardcoded

### Dashboard (`_app.index.tsx`)
```typescript
balance: "$1,284.20"           // Fake
dailyCap: "$50"                // Fake
spent: "$30 / $50" (60%)       // Fake
KYA: "A · 824", "+18"          // Fake
handle: "@alice.oishi"         // Fake
3 activity items               // Fake
30-bar KYA visual              // Fake (formula-generated)
```

### Activity (`_app.activity.tsx`)
```typescript
5 items, all with fake:
  - tx hashes ("5Hx8…fQ2A")
  - amounts ("$30.00")
  - times ("Just now", "2 min ago")
  - counterparts ("@freelancer.oishi")
  - No links to Solscan
```

### Fund (`_app.fund.tsx`)
```typescript
ETH price: $3,185              // Hardcoded
feeBps: 14                     // Hardcoded
Network fees: $1.12/$0.08/$0.21 // Hardcoded
ETA: 48s/35s/28s              // Hardcoded
Bridge simulation: setTimeout chain // Entirely fake
LI.FI logo: decorative only    // Image, no SDK
```

### Profile (`_app.profile.tsx`)
```typescript
handle: "@alice.oishi"         // Fake
address: "7Hk2…q9PfR"         // Fake
KYA: 824, Tier A               // Fake
Stats: 142 payments            // Fake
Capabilities: 3 hardcoded      // Fake
Rules: local useState only     // Not persisted
Verified recipients: 3         // Hardcoded
```

### Launch (`_app.launch.tsx`)
```typescript
All 8 strategies: data only    // No on-chain registration
Strategy-specific rules:       // local state, not persisted
"Launch agent": console.log    // Nothing on-chain
Fee text explicitly says:      // "not charged in this prototype"
```

---

## 3. Buttons That Do Nothing (no-ops)

| Location | Button | Severity |
|---|---|---|
| Profile | "Copy" (wallet address) | Medium |
| Profile | "Share agent handle" | Medium |
| Profile | "Manage" (recipients) | Medium |
| **Profile** | **"Save rules on-chain"** | **CRITICAL** |
| Launch | "Launch agent" (step 3) | **CRITICAL** |
| Fund | "Review & bridge" (simulated) | **CRITICAL** |
| Dashboard | Activity rows (not clickable) | Low |
| Activity | Tx hashes (no Solscan link) | Low |

---

## 4. Frontend Gaps (frontend-only work)

### Theme
- [ ] **No dark theme** — `styles.css` has only `:root` block, no `.dark` class
  - App currently uses warm cream background (`oklch(0.97 0.012 95)`)
  - Need: `#0A0A0B` background, `#FAFAFA` text
- [ ] **ShellChrome has gradient background** — 3 radial gradients on fixed bg layer
  - Replace with solid `#0A0A0B`
- [ ] **Font imports** — Google Fonts (Geist, Instrument Serif, JetBrains Mono)
  - Replace with system font stack for hackathon (no external dependency)
- [ ] **Twitter tag** — `@Lovable` in meta tags → should be Oishi
- [ ] **Title tag** — `"Oishi — A bank account for your AI agent"` → update to new narrative

### Bottom Nav
- [ ] Current tabs: `Home | Market | Launch(+) | Activity | Profile`
- [ ] Missing 'Marketplace' as labeled tab (shown as "Market")
- [ ] Missing 'Rules' as separate tab (redirects to profile)
- [ ] Center `Launch(+)` button always shows — should be conditional (hide if agent exists)

### Dashboard
- [ ] **No real wallet balance** — `useWallet()` not used; no `connection.getBalance()`
- [ ] **No agent check** — doesn't check if user has launched agent; shows fake data regardless
- [ ] **No strategy status** — doesn't show which strategy agent is running
- [ ] **No real activity** — 3 fake items; needs Solana RPC `getSignaturesForAddress()`
- [ ] **Empty states missing** — "No agent yet" / "No balance yet"

### Rules (in Profile page)
- [ ] **"Save rules on-chain" button no-op** — most critical missing feature
- [ ] **Strategy-specific rules** — not loaded from strategy config, shown as generic toggles
- [ ] **No strategy badge** at top of rules section
- [ ] **No "Pause agent" toggle** for emergency stop
- [ ] **Recipient allowlist** — "Manage" button no-op, hardcoded 3 entries

### Fund/Bridge
- [ ] **No LI.FI SDK** — `@lifi/sdk` NOT in package.json
- [ ] **Quote is fake math** — `amount / ETH_USD` with hardcoded ETH price
- [ ] **Progress is setTimeout animation** — 4 steps on timers, no real bridge status
- [ ] **No wallet signing** — bridge flow never triggers wallet confirmation
- [ ] **No SPL token account** — doesn't check/create USDC ATA on Solana
- [ ] **No post-bridge balance update** — success doesn't refresh Solana balances
- [ ] **Source chain wallet** — only Phantom/Solflare connected; no EVM wallet (MetaMask, Wagmi)

### Activity
- [ ] **No real tx history** — 5 hardcoded items
- [ ] **No filters** — type, date range, token
- [ ] **No pagination** — 5 items, no load more
- [ ] **No export** — CSV button missing
- [ ] **No stats bar** — total sent/received/fees
- [ ] **Tx hashes not clickable** — no Solscan link

### Agent Profile
- [ ] **Identity is fake** — `@alice.oishi`, `7Hk2…q9PfR`, letter "a" avatar
- [ ] **KYA score fake** — 824, Tier A
- [ ] **No on-chain data** — doesn't query KYA program for real identity/score
- [ ] **No earnings data** — no P&L chart, no strategy performance
- [ ] **"Publish to marketplace" toggle** — missing, profile page has no marketplace visibility toggle
- [ ] **Copy functionality** — Copy button next to address has no `onClick`
- [ ] **Share functionality** — "Share agent handle" button has no `onClick`

### Launch
- [ ] **"Launch agent" only `console.log`** — no on-chain tx, no PDA creation, no identity registration
- [ ] **Handle availability** — `oishi-handle.ts` validates format but NEVER checks chain for duplicates
- [ ] **No fee display** — says "~0.003 SOL" but doesn't calculate from actual solana rent
- [ ] **No progress indicator** — no tx submission, no confirmation, no redirect on success
- [ ] **Strategy config not stored** — all rules discarded after console.log

### Marketplace
- [ ] **No real agent data** — shows strategy descriptions, not actual deployed agents
- [ ] **No filters/sort** — only category filter, no sort by KYA/earnings
- [ ] **No deployed agent count** — doesn't query chain for number of agents
- [ ] **No leaderboard** — no top-earning/performing agents
- [ ] **Strategy cards link to launch** — but launch doesn't deploy

### Landing Page
- [ ] **CTA copy** — needs update to match new narrative
- [ ] **Balance preview** — shows `$1,284.20` hardcoded
- [ ] **"Sign in" link** — goes to `/onboarding` but should CTA to launch

---

## 5. Missing Packages

### Need to install
```json
{
  "@lifi/sdk": "^3.x",              // LI.FI bridge integration
  "@lifi/widget": "^3.x",           // Optional: embeddable bridge UI
  "@coral-xyz/anchor": "^0.30.1",  // Solana Anchor program client
  "@solana/spl-token": "^0.4.x",   // SPL token operations (ATA creation)
  "bs58": "^6.x",                   // Base58 encode/decode (PDA derivation)
  "wagmi": "^2.x",                  // EVM wallet connection (for source chain)
  "viem": "^2.x",                   // EVM chain interactions
  "@tanstack/react-table": "^8.x"   // Activity table (needed for filters/pagination)
}
```

### Should remove (hackathon simplification)
- Google Fonts (Geist, Instrument Serif, JetBrains Mono) → system stack
- `input-otp` (unused)
- `embla-carousel-react` (landing page only, could simplify)
- `@cloudflare/vite-plugin` (if we skip Cloudflare Workers deployment for hackathon)

---

## 6. Backend / On-Chain Gaps

### Solana Programs Needed

#### 6.1 KYA Identity Program (exists: `programs/hoshi-kya/`)
- Status: **Working program** at `7QaaaMxxPavk8KRZwS5WwbPzPmRkXPtjFmfxh2M8ev1Z`
- Instructions: `initialize_registry`, `claim_handle`, `update_reputation`, `resolve_handle`
- What's needed:
  - [ ] Deploy to devnet (currently only configured for localnet)
  - [ ] Add `metadata_uri` field for marketplace listing
  - [ ] Add query to list all agents (for marketplace)
  - [ ] Client-side integration: create JS SDK bindings for oishiapp

#### 6.2 Vault Program (need to build: `programs/hoshi-vault/`)
- Status: **Does not exist**
- Instructions needed:
  - `initialize_agent` — create agent PDA with owner, strategy_id, policy config, KYA link
  - `set_strategy_config` — write strategy-specific config per strategy_id
  - `set_policy` — update limits, allowlists, toggles
  - `execute_payment` — enforce rules, transfer if passes, reset daily counter
  - `update_reputation` — adjust KYA score (hoshi_issuer only)
  - `pause_agent` — emergency stop
  - `withdraw_all` — owner withdraw
  - `update_strategy` — change strategy (re-init config)
- Account structs:
  ```rust
  AgentVault {
    owner: Pubkey,
    kya_identity: Pubkey,
    strategy_id: u8,  // Kamino=1, DCA=2, Meteora=3, Drift=4, Polymarket=5, Arbitrage=6, Gigs=7, BillPay=8
    policy_config: PolicyConfig,  // max_per_tx, daily_limit, approval_threshold, paused, last_daily_reset
    strategy_config: [u8; 64],   // union buffer per strategy
    recipient_allowlist: Vec<Pubkey>,
    protocol_allowlist: Vec<Pubkey>,
    bump: u8,
    _reserved: [u8; 128],
  }
  ```

#### 6.3 Strategy Config Schemas (per strategy_id)
| ID | Strategy | Config Fields |
|---|---|---|
| 1 | Kamino Yield | `min_apy_bps: u16`, `auto_compound: bool`, `allowed_vaults: [Pubkey; 4]` |
| 2 | Jupiter DCA | `amount_per_buy: u64`, `frequency_secs: u32`, `max_total: u64` |
| 3 | Meteora LP | `max_lp_amount: u64`, `pool_allowlist: [Pubkey; 4]`, `rebalance_interval_secs: u32` |
| 4 | Drift Perps | `max_position: u64`, `max_leverage_bps: u16`, `stop_loss_bps: u16` |
| 5 | Polymarket | `max_bet: u64`, `max_daily_bets: u8`, `allowed_markets: [Pubkey; 8]` |
| 6 | Jupiter Arbitrage | `max_swap: u64`, `max_slippage_bps: u16`, `min_profit_bps: u16` |
| 7 | Marketplace Gigs | `max_gig_value: u64`, `auto_accept: bool`, `allowed_categories: [u8; 8]` |
| 8 | Bill Pay (x402) | `max_per_payment: u64`, `payment_schedule_secs: u32`, `allowed_vendors: [Pubkey; 8]` |

---

## 7. Backend Services Needed

### 7.1 API Endpoints
No backend API exists currently. Minimum needed:

| Endpoint | Purpose | Data Source |
|---|---|---|
| `GET /api/agent/:handle` | Get agent profile | KYA + vault PDAs |
| `GET /api/agent/:handle/activity` | Transaction history | Solana RPC `getSignaturesForAddress` |
| `GET /api/agent/:handle/rules` | Current rules | Vault PDA |
| `GET /api/marketplace/agents` | List published agents | KYA PDAs with metadata_uri |
| `POST /api/agent/register` | Register agent (tx building) | KYA + vault (or direct client-side tx) |

For hackathon: these can be direct client-side Solana RPC calls (no server needed).

### 7.2 Strategy Execution Engine
- Status: **Does not exist**
- For hackathon demo: **simulate** via pre-scripted transactions
- Post-hackathon: Hoshi MCP server + LLM-based execution loop

### 7.3 LI.FI Integration
- Status: **Not started**
- [ ] Install `@lifi/sdk`
- [ ] Replace simulated quote with `getQuote()`
- [ ] Replace simulated bridge with `executeRoute()` or build tx
- [ ] Add status polling with `getStatus()`
- [ ] Handle token approval (for ERC-20 on source chain)
- [ ] Handle Solana SPL ATA creation before bridge lands

---

## 8. Frontend Features to Build (summary)

### Priority 0 — Makes the demo real (12h)
1. **Dark theme** — update `styles.css`, remove gradients, system fonts
2. **Real wallet balance** — `connection.getBalance()` + `getTokenAccountBalance()` on dashboard
3. **Real KYA data** — query KYA program PDA on profile and dashboard
4. **Real LI.FI quote** — replace simulated math with `@lifi/sdk` `getQuote()` on fund page
5. **Save rules** — build + sign vault program `set_policy` transaction
6. **Launch agent** — build + sign KYA `claim_handle` + vault `initialize_agent` transactions

### Priority 1 — WOW factor (8h)
7. **Real activity** — `getSignaturesForAddress()` + `getParsedTransactions()` on activity page
8. **Strategy-specific rules** — load from vault PDA, show relevant UI per strategy
9. **Marketplace live data** — query KYA PDAs for published agents
10. **Copy/share functionality** — wire clipboard API + Web Share API

### Priority 2 — Polish (4h)
11. **Empty states** — no agent, no balance, no activity
12. **Error states** — tx failed, RPC timeout, insufficient balance
13. **Loading skeletons** — replace spinner with skeleton cards
14. **Landing copy update** — match new narrative
15. **Nav conditional** — hide Launch if agent exists, show Rules instead

### Priority 3 — Stretch (6h)
16. **EVM wallet** — Wagmi for source chain connection on fund page
17. **Bridge execution** — real LI.FI `executeRoute()` with wallet signing
18. **Export CSV** — client-side download from activity data
19. **Leaderboard** — top agents by KYA/earnings

---

## 9. Total Build Estimate

| Layer | Tasks | Est. Hours |
|---|---|---|
| Frontend fixes (existing pages) | Theme, data, wiring | 12h |
| Frontend new features | EVM wallet, empty states, polish | 6h |
| Solana program (vault) | Anchor program + tests | 8h |
| Solana program (KYA updates) | metadata_uri, deployment | 2h |
| LI.FI integration | SDK install, quote, execute | 4h |
| Strategy config schemas | Rust structs, JS bindings | 2h |
| Testing + demo prep | Full flow, error cases | 6h |
| **Total** | | **~40h** |
