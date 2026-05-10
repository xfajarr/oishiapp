/**
 * Oishi Backend API client.
 * Supports JWT sessions: sign wallet once → get token → no more popups.
 */
import bs58 from "bs58";

const TOKEN_KEY = "oishi_session_token";

/** Avoid `https://host//api/...` when env has trailing slash (breaks proxies + preflight/CORS). */
function stripTrailingSlashes(base: string): string {
  return base.trim().replace(/\/+$/, "");
}

const API_BASE = stripTrailingSlashes(
  import.meta.env.VITE_OISHI_API_URL ?? "http://localhost:3001",
);
const API = `${API_BASE}/api`;

// ── Types ───────────────────────────────────────────────────────────────
export interface BackendAgent {
  id: string;
  owner: string;
  walletPublicKey: string;
  handle: string;
  displayName: string;
  strategyId: string;
  commonRules: {
    dailyCapUsd: number;
    maxPerTxUsd: number;
    notifyOnBlock: boolean;
    quietHoursEnabled: boolean;
  };
  specificRules: Record<string, number | boolean>;
  status: "active" | "paused" | "stopped" | "blocked";
  kyaIdentityPda: string | null;
  kyaReputationScore: number;
  attestationCount: number;
  totalEarnings: number;
  totalTxCount: number;
  cycleCount: number;
  createdAt: number;
  updatedAt: number;
  lastActiveAt: number | null;
}

export interface CreateAgentPayload {
  displayName: string;
  handle: string;
  strategyId: string;
  commonRules?: BackendAgent["commonRules"];
  specificRules?: Record<string, number | boolean>;
}

export interface AgentContext {
  agentId: string;
  sessionId: string;
  state: {
    solBalance: number;
    usdcBalance: number;
    solUsd: number;
    usdcUsd: number;
    dailySpent: number;
    dailyResetAt: number;
    lastCycleAt: number | null;
    positions: Record<string, unknown>;
  };
  memory: Record<string, unknown>;
  decisionCount: number;
  messageCount: number;
  updatedAt: number;
}

export interface AgentDecision {
  id: string;
  action: string;
  params: Record<string, unknown>;
  reasoning: string;
  status: "executed" | "blocked" | "error";
  blockReason?: string;
  timestamp: number;
}

export interface StrategyInfo {
  id: string;
  protocol: string;
  name: string;
  risk: string;
  category: string;
  abbrev: string;
}

// ── Token management ────────────────────────────────────────────────────
function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}
function setStoredToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {}
}
export function clearStoredToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {}
}
export function getSessionToken(): string | null {
  return getStoredToken();
}

// ── Wallet signer (set by hook) ─────────────────────────────────────────
let signMessageFn: ((msg: Uint8Array) => Promise<Uint8Array>) | null = null;
export function setOishiSigner(fn: (msg: Uint8Array) => Promise<Uint8Array>) {
  signMessageFn = fn;
}

// ── Login (sign once → get JWT) ─────────────────────────────────────────
export async function login(wallet: string): Promise<{ token: string; wallet: string }> {
  if (!signMessageFn) throw new Error("Wallet not connected. Cannot sign.");

  const message = JSON.stringify({
    domain: "Oishi Agent Platform",
    statement: "Sign this message to authenticate with Oishi and create a persistent session.",
    timestamp: Date.now(),
  });

  const messageBytes = new TextEncoder().encode(message);
  const sigBytes = await signMessageFn(messageBytes);
  const signature = bs58.encode(sigBytes);

  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-oishi-wallet": wallet,
    },
    body: JSON.stringify({ message, signature }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Login failed");

  setStoredToken(data.token);
  return data;
}

// ── API request helper ──────────────────────────────────────────────────
async function apiRequest<T>(
  path: string,
  method: string,
  wallet?: string,
  body?: unknown,
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  // 1. Try Bearer token (persistent session)
  const token = getStoredToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // 2. Fall back to wallet signature for dev mode
  if (!token && wallet && signMessageFn) {
    const msg = JSON.stringify({
      domain: "Oishi Agent Platform",
      statement: `Sign this message to authenticate with Oishi for: ${method} ${path}`,
      timestamp: Date.now(),
      body: body ? JSON.stringify(body).slice(0, 200) : undefined,
    });
    const sigBytes = await signMessageFn(new TextEncoder().encode(msg));
    headers["x-oishi-wallet"] = wallet;
    headers["x-oishi-signature"] = bs58.encode(sigBytes);
    headers["x-oishi-message"] = msg;
  }

  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (res.status === 401) {
    clearStoredToken();
  }

  if (!res.ok) throw new Error(data.error ?? `API error ${res.status}`);
  return data as T;
}

// ── Public endpoints ────────────────────────────────────────────────────
export async function fetchStrategies(): Promise<StrategyInfo[]> {
  const res = await fetch(`${API}/agents/_strategies`);
  return (await res.json()).strategies;
}

// ── Agent CRUD ──────────────────────────────────────────────────────────
export async function createAgent(
  wallet: string,
  payload: CreateAgentPayload,
): Promise<BackendAgent> {
  return (await apiRequest<{ agent: BackendAgent }>("/agents", "POST", wallet, payload)).agent;
}
export async function listAgents(wallet: string): Promise<BackendAgent[]> {
  return (await apiRequest<{ agents: BackendAgent[] }>("/agents", "GET", wallet)).agents;
}
export async function getAgent(wallet: string, agentId: string): Promise<BackendAgent> {
  return (await apiRequest<{ agent: BackendAgent }>(`/agents/${agentId}`, "GET", wallet)).agent;
}
export async function updateAgentRules(
  wallet: string,
  agentId: string,
  rules: { commonRules?: any; specificRules?: Record<string, number | boolean> },
): Promise<BackendAgent> {
  return (
    await apiRequest<{ agent: BackendAgent }>(`/agents/${agentId}/rules`, "PUT", wallet, rules)
  ).agent;
}
export async function pauseAgent(wallet: string, agentId: string): Promise<BackendAgent> {
  return (await apiRequest<{ agent: BackendAgent }>(`/agents/${agentId}/pause`, "POST", wallet))
    .agent;
}
export async function resumeAgent(wallet: string, agentId: string): Promise<BackendAgent> {
  return (await apiRequest<{ agent: BackendAgent }>(`/agents/${agentId}/resume`, "POST", wallet))
    .agent;
}
export async function stopAgent(wallet: string, agentId: string): Promise<void> {
  await apiRequest(`/agents/${agentId}`, "DELETE", wallet);
}

// ── Agent run / context ─────────────────────────────────────────────────
export async function chatWithAgent(
  wallet: string,
  agentId: string,
  message: string,
): Promise<{ reply: string }> {
  return apiRequest(`/agents/${agentId}/chat`, "POST", wallet, { message });
}

export async function runAgentCycle(wallet: string, agentId: string): Promise<unknown> {
  return apiRequest(`/agents/${agentId}/run`, "POST", wallet);
}

export async function getAgentContext(wallet: string, agentId: string): Promise<AgentContext> {
  return apiRequest(`/agents/${agentId}/context`, "GET", wallet);
}
export async function getAgentDecisions(
  wallet: string,
  agentId: string,
  limit = 20,
): Promise<{ decisions: AgentDecision[]; total: number }> {
  return apiRequest(`/agents/${agentId}/decisions?limit=${limit}`, "GET", wallet);
}

// ── On-chain registration ───────────────────────────────────────────────
export async function getRegisterAgentTx(
  wallet: string,
  agentId: string,
): Promise<{
  transaction: string;
  pda: string;
  handle: string;
  programId: string;
  estimatedFee: string;
}> {
  return apiRequest(`/onchain/register-agent/${agentId}`, "POST", wallet);
}

export interface AgentBalance {
  agentId: string;
  wallet: string;
  sol: number;
  solUsd: number;
  explorerUrl: string;
}

export async function getAgentBalance(wallet: string, agentId: string): Promise<AgentBalance> {
  return apiRequest(`/agents/${agentId}/balance`, "GET", wallet);
}

export async function fundAgent(
  wallet: string,
  agentId: string,
  amountSol: number,
): Promise<{ transaction: string; from: string; to: string; amountSol: number }> {
  return apiRequest(`/onchain/fund-agent/${agentId}`, "POST", wallet, { amountSol });
}

export async function getAgentSkills(wallet: string, agentId: string): Promise<any> {
  return apiRequest(`/agents/${agentId}/skills`, "GET", wallet);
}
