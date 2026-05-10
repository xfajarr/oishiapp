import { useWallet } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useAgentByOwner, getTier, type AgentIdentity } from "@/hooks/use-solana-data";
import { useOishiBackend } from "@/hooks/use-oishi-backend";

/**
 * Merges on-chain KYA identity with the first backend agent for this wallet.
 */
export function useUiAgent() {
  const { publicKey, connected } = useWallet();
  const { data: agent, isLoading: agentLoading } = useAgentByOwner(publicKey ?? null);
  const { api, isReady: backendReady } = useOishiBackend();
  const { data: backendAgents, isLoading: backendAgentsLoading } = useQuery({
    queryKey: ["oishi", "backend-agents", publicKey?.toBase58()],
    queryFn: async () => {
      if (!api) return [];
      try {
        return await api.listAgents();
      } catch {
        return [];
      }
    },
    enabled: backendReady,
    staleTime: 10_000,
    refetchInterval: 30_000,
  });
  const backendAgent = backendAgents?.[0] ?? null;

  const uiAgent = useMemo((): AgentIdentity | null => {
    if (agent) return agent;
    if (!backendAgent || !publicKey) return null;
    const b = backendAgent;
    const handle = b.handle.replace(/^@/, "");
    return {
      handle,
      displayName: b.displayName,
      owner: publicKey,
      reputationScore: b.kyaReputationScore,
      attestationCount: b.attestationCount,
      tier: getTier(b.kyaReputationScore),
      metadataUri: "",
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
    };
  }, [agent, backendAgent, publicKey]);

  const hasAgent = Boolean(uiAgent);
  const isLoading = agentLoading || backendAgentsLoading;

  return { uiAgent, hasAgent, isLoading, connected, publicKey, agent, backendAgent };
}
