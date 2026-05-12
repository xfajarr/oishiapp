/**
 * React hook: connects Solana wallet to Oishi backend.
 * Signs once → JWT stored in localStorage → Bearer on all later requests.
 * Effect deps do NOT include `signMessage` reference (wallet adapters often
 * give a new function each render and would re-trigger login endlessly).
 */
import { useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  setOishiSigner,
  login,
  clearStoredToken,
  getSessionToken,
  createAgent,
  listAgents,
  getAgent,
  updateAgentRules,
  pauseAgent,
  resumeAgent,
  stopAgent,
  runAgentCycle,
  chatWithAgent,
  getAgentContext,
  getAgentDecisions,
  getAgentSkills,
  fetchStrategies,
  getRegisterAgentTx,
  getAgentBalance,
  fundAgent,
  payAgent,
  registerAgentOnChain as registerAgent,
  confirmKyaRegistration,
} from "@/lib/oishi-api";
import type { CreateAgentPayload, BackendAgent } from "@/lib/oishi-api";

// Module-level flag persists across StrictMode remounts
let _loginInProgress = false;

export function useOishiBackend() {
  const { publicKey, signMessage, connected } = useWallet();
  const wallet = publicKey?.toBase58() ?? null;
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getSessionToken()));
  const [authError, setAuthError] = useState<string | null>(null);

  const signMessageRef = useRef(signMessage);
  useEffect(() => {
    signMessageRef.current = signMessage;
  }, [signMessage]);

  useEffect(() => {
    if (signMessage) {
      setOishiSigner((msg) => signMessageRef.current!(msg));
    }
  }, [signMessage]);

  const prevWallet = useRef<string | null>(null);
  useEffect(() => {
    if (wallet && prevWallet.current && prevWallet.current !== wallet) {
      clearStoredToken();
      setIsAuthenticated(false);
      _loginInProgress = false;
    }
    prevWallet.current = wallet;
    _loginInProgress = false;
  }, [wallet]);

  const canSign = Boolean(signMessage);
  const loginInFlight = useRef(false);

  useEffect(() => {
    if (!connected || !wallet) {
      if (!connected) {
        setIsAuthenticated(false);
        clearStoredToken();
        _loginInProgress = false;
      }
      return;
    }

    if (getSessionToken()) {
      setIsAuthenticated(true);
      setAuthError(null);
      return;
    }

    if (!canSign || _loginInProgress) return;

    let cancelled = false;
    _loginInProgress = true;
    setAuthError(null);

    (async () => {
      try {
        await login(wallet);
        if (!cancelled) {
          setIsAuthenticated(true);
        }
      } catch (err) {
        if (!cancelled) {
          setAuthError(err instanceof Error ? err.message : "Authentication failed");
          setIsAuthenticated(false);
        }
      } finally {
        loginInFlight.current = false;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [connected, wallet, canSign]);

  const manualLogin = useCallback(async () => {
    if (!wallet) return;
    setAuthError(null);
    _loginInProgress = true;
    try {
      await login(wallet);
      setIsAuthenticated(true);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Authentication failed");
      setIsAuthenticated(false);
    }
    _loginInProgress = false;
  }, [wallet]);

  const api = useMemo(() => {
    if (!wallet) return null;
    return {
      createAgent: (payload: CreateAgentPayload) => createAgent(wallet, payload),
      listAgents: () => listAgents(wallet),
      getAgent: (agentId: string) => getAgent(wallet, agentId),
      updateAgentRules: (
        agentId: string,
        rules: {
          commonRules?: BackendAgent["commonRules"];
          specificRules?: Record<string, number | boolean>;
        },
      ) => updateAgentRules(wallet, agentId, rules),
      pauseAgent: (agentId: string) => pauseAgent(wallet, agentId),
      resumeAgent: (agentId: string) => resumeAgent(wallet, agentId),
      stopAgent: (agentId: string) => stopAgent(wallet, agentId),
      runAgentCycle: (agentId: string) => runAgentCycle(wallet, agentId),
      chatWithAgent: (agentId: string, message: string) => chatWithAgent(wallet, agentId, message),
      getAgentContext: (agentId: string) => getAgentContext(wallet, agentId),
      getAgentDecisions: (agentId: string, limit?: number) =>
        getAgentDecisions(wallet, agentId, limit),
      getAgentSkills: (agentId: string) => getAgentSkills(wallet, agentId),
      getRegisterAgentTx: (agentId: string) => getRegisterAgentTx(wallet, agentId),
      getAgentBalance: (agentId: string) => getAgentBalance(wallet, agentId),
      fundAgent: (agentId: string, amountSol: number) => fundAgent(wallet, agentId, amountSol),
      payAgent: (agentId: string, signature: string, amountUsd: number) =>
        payAgent(wallet, agentId, signature, amountUsd),
      registerAgent: (agentId: string) => registerAgent(wallet, agentId),
      confirmKyaRegistration: (agentId: string, payload: any) =>
        confirmKyaRegistration(wallet, agentId, payload),
      fetchStrategies,
    };
    _loginInProgress = false;
  }, [wallet]);

  return {
    wallet,
    connected,
    isAuthenticated,
    authError,
    api,
    login: manualLogin,
    isReady: connected && !!signMessage && !!wallet && isAuthenticated,
  };
}
