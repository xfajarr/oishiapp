/**
 * Hook: sign and send Solana transactions via the connected wallet.
 * Uses wallet adapter's native sendTransaction which handles signing internally.
 */
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Transaction, VersionedTransaction } from "@solana/web3.js";
import { useCallback } from "react";

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

/** v0+ transactions start with 0x80 (version mask). Legacy does not. */
function deserializeTx(txBytes: Uint8Array): Transaction | VersionedTransaction {
  if (txBytes.length > 0 && txBytes[0] === 0x80) {
    return VersionedTransaction.deserialize(txBytes);
  }
  return Transaction.from(txBytes);
}

function isWalletError(err: unknown): err is { message?: string; error?: unknown; logs?: unknown } {
  return typeof err === "object" && err !== null && "name" in err;
}

function enrichError(err: unknown): Error {
  if (isWalletError(err)) {
    const w = err as { message?: string; error?: unknown; logs?: unknown };
    const parts: string[] = [];
    if (w.message) parts.push(w.message);
    const inner = w.error;
    if (inner instanceof Error) {
      parts.push(inner.message);
    } else if (typeof inner === "string" && inner) {
      parts.push(inner);
    } else if (inner != null) {
      try {
        parts.push(JSON.stringify(inner));
      } catch {
        /* skip */
      }
    }
    if (w.logs != null) {
      try {
        parts.push(`logs: ${JSON.stringify(w.logs)}`);
      } catch {
        /* skip */
      }
    }
    const msg = [...new Set(parts)].filter(Boolean).join(" — ");
    const out = new Error(msg || "WalletSendTransactionError");
    out.cause = err;
    return out;
  }
  return err instanceof Error ? err : new Error(String(err));
}

export function useSolanaTx() {
  const { publicKey, sendTransaction, connected } = useWallet();
  const { connection } = useConnection();

  const signAndSend = useCallback(
    async (serializedTx: string): Promise<{ signature: string }> => {
      if (!publicKey || !connected) {
        throw new Error("Wallet not connected");
      }
      if (!sendTransaction) {
        throw new Error("Wallet does not support sendTransaction. Try Phantom or Solflare.");
      }

      const txBytes = base64ToBytes(serializedTx);
      const transaction = deserializeTx(txBytes);

      // For legacy (Anchor) transactions: refresh the blockhash against the client's
      // own RPC so the tx is not stale by the time the user approves in the wallet.
      if (transaction instanceof Transaction) {
        const { blockhash } = await connection.getLatestBlockhash("finalized");
        transaction.recentBlockhash = blockhash;
      }

      try {
        // skipPreflight=true: Phantom runs its own internal simulation on its own
        // RPC (not our connection) which returns "Unexpected error" when the program
        // is on devnet but Phantom checks mainnet, or when the tx has been mutated
        // (blockhash refresh above). We already verified freshness so it is safe.
        const signature = await sendTransaction(transaction, connection, {
          skipPreflight: true,
          maxRetries: 5,
        });

        await connection.confirmTransaction(signature, "confirmed");
        return { signature };
      } catch (err: unknown) {
        throw enrichError(err);
      }
    },
    [publicKey, connected, sendTransaction, connection],
  );

  return {
    signAndSend,
    ready: !!(publicKey && connected && sendTransaction),
  };
}
