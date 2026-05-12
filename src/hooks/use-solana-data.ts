import { useConnection as useConnectionRaw } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

// Safe: never throws even without a provider (SSR / route matching)
function useConnection() {
  try {
    return useConnectionRaw();
  } catch {
    return { connection: null as unknown as import("@solana/web3.js").Connection, endpoint: "" };
  }
}

// ── KYA Program ──────────────────────────────────────────────────────
const KYA_PROGRAM_ID = new PublicKey("7QaaaMxxPavk8KRZwS5WwbPzPmRkXPtjFmfxh2M8ev1Z");
const USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"); // devnet USDC

// ── PDA derivation ───────────────────────────────────────────────────
async function findIdentityPda(handle: string): Promise<PublicKey> {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("identity"), Buffer.from(handle.replace(".hoshi", ""))],
    KYA_PROGRAM_ID,
  );
  return pda;
}

async function findWalletIndexPda(owner: PublicKey): Promise<PublicKey> {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("wallet"), owner.toBuffer()],
    KYA_PROGRAM_ID,
  );
  return pda;
}

// ── Deserialize KYA IdentityAccount ──────────────────────────────────
// Struct: handle (32 bytes str), owner (32), display_name (64), metadata_uri (200),
//          reputation_score (i64=8), attestation_count (u64=8), created_at (i64=8),
//          updated_at (i64=8), bump (1), _padding (7)
// Discriminator: 8 bytes
function deserializeIdentityAccount(data: Buffer) {
  if (data.length < 8 + 1 + 32 + 32) return null;
  let offset = 8; // skip Anchor discriminator

  // handle: 4 byte len prefix + 32 bytes string
  const handleLen = data.readUInt32LE(offset);
  offset += 4;
  const handle = data.subarray(offset, offset + handleLen).toString("utf8");
  offset += 32;

  // owner
  const owner = new PublicKey(data.subarray(offset, offset + 32));
  offset += 32;

  // display_name: 4 byte len + 64 bytes
  const nameLen = data.readUInt32LE(offset);
  offset += 4;
  const displayName = data.subarray(offset, offset + nameLen).toString("utf8");
  offset += 64;

  // metadata_uri: 4 byte len + 200 bytes
  const metaLen = data.readUInt32LE(offset);
  offset += 4;
  const metadataUri = data.subarray(offset, offset + metaLen).toString("utf8");
  offset += 200;

  // reputation_score (i64 LE)
  const reputationScore = Number(data.readBigInt64LE(offset));
  offset += 8;

  // attestation_count (u64 LE)
  const attestationCount = Number(data.readBigUInt64LE(offset));
  offset += 8;

  // created_at (i64 LE)
  const createdAt = Number(data.readBigInt64LE(offset));
  offset += 8;

  // updated_at (i64 LE)
  const updatedAt = Number(data.readBigInt64LE(offset));
  // offset += 8;

  return {
    handle: handle + ".hoshi",
    owner,
    displayName,
    metadataUri,
    reputationScore,
    attestationCount,
    createdAt,
    updatedAt,
  };
}

// ── Types ─────────────────────────────────────────────────────────────
export interface AgentIdentity {
  handle: string;
  displayName: string;
  owner: PublicKey;
  reputationScore: number;
  attestationCount: number;
  tier: "gold" | "green" | "yellow" | "red";
  metadataUri: string;
  createdAt: number;
  updatedAt: number;
}

export interface WalletBalances {
  sol: number;
  usdc: number;
  solUsd: number;
  usdcUsd: number;
}

// ── Tier from score ───────────────────────────────────────────────────
export function getTier(score: number): AgentIdentity["tier"] {
  if (score >= 90) return "gold";
  if (score >= 70) return "green";
  if (score >= 25) return "yellow";
  return "red";
}

// ── Hooks ─────────────────────────────────────────────────────────────

/** Fetch agent identity by handle (e.g., "alice.hoshi" without @) */
export function useAgentByIdentity(handle: string | null) {
  const { connection } = useConnection();

  return useQuery({
    queryKey: ["kya", "identity", handle],
    queryFn: async (): Promise<AgentIdentity | null> => {
      if (!handle || !connection) return null;
      const cleanHandle = handle.replace("@", "").replace(".hoshi", "");
      try {
        const pda = await findIdentityPda(cleanHandle);
        const account = await connection.getAccountInfo(pda);
        if (!account) return null;
        const parsed = deserializeIdentityAccount(Buffer.from(account.data));
        if (!parsed) return null;
        return { ...parsed, tier: getTier(parsed.reputationScore) };
      } catch {
        return null;
      }
    },
    enabled: !!handle && !!connection,
    staleTime: 30_000,
  });
}

/** Fetch agent identity by wallet owner pubkey */
export function useAgentByOwner(owner: PublicKey | null) {
  const { connection } = useConnection();

  return useQuery({
    queryKey: ["kya", "wallet-index", owner?.toBase58()],
    queryFn: async (): Promise<AgentIdentity | null> => {
      if (!owner || !connection) return null;
      try {
        const walletPda = await findWalletIndexPda(owner);
        const walletAccount = await connection.getAccountInfo(walletPda);
        if (!walletAccount) return null;
        // WalletIndex has: owner (32), handle (str 32), bump (1)
        // Read handle from offset 8+32 = 40: 4 byte len + 32 bytes string
        const data = Buffer.from(walletAccount.data);
        const handleLen = data.readUInt32LE(8 + 32);
        const handle = data.subarray(8 + 32 + 4, 8 + 32 + 4 + handleLen).toString("utf8");

        const identityPda = await findIdentityPda(handle);
        const identityAccount = await connection.getAccountInfo(identityPda);
        if (!identityAccount) return null;
        const parsed = deserializeIdentityAccount(Buffer.from(identityAccount.data));
        if (!parsed) return null;
        return { ...parsed, tier: getTier(parsed.reputationScore) };
      } catch {
        return null;
      }
    },
    enabled: !!owner && !!connection,
    staleTime: 30_000,
  });
}

/** Fetch wallet balances (SOL + USDC) in native units and USD */
export function useBalances(owner: PublicKey | null) {
  const { connection } = useConnection();

  return useQuery({
    queryKey: ["solana", "balances", owner?.toBase58()],
    queryFn: async (): Promise<WalletBalances> => {
      if (!owner || !connection) return { sol: 0, usdc: 0, solUsd: 0, usdcUsd: 0 };

      const [solLamports, tokenAccounts] = await Promise.all([
        connection.getBalance(owner),
        connection.getParsedTokenAccountsByOwner(owner, { mint: USDC_MINT }),
      ]);

      const sol = solLamports / 1e9;
      const usdc = tokenAccounts.value[0]?.account?.data?.parsed?.info?.tokenAmount?.uiAmount ?? 0;

      // Approximate USD prices (SOL ~$130 devnet, USDC ~$1)
      const solUsd = sol * 130;
      const usdcUsd = usdc;

      return { sol, usdc, solUsd, usdcUsd };
    },
    enabled: !!owner && !!connection,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

/** Fetch recent transaction signatures for an address */
export function useRecentTransactions(owner: PublicKey | null, limit = 10) {
  const { connection } = useConnection();

  return useQuery({
    queryKey: ["solana", "txs", owner?.toBase58(), limit],
    queryFn: async () => {
      if (!owner || !connection) return [];
      const sigs = await connection.getSignaturesForAddress(owner, { limit });
      return sigs;
    },
    enabled: !!owner && !!connection,
    staleTime: 20_000,
    refetchInterval: 60_000,
  });
}
