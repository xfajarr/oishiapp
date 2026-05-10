/**
 * Hook: sign and send Solana transactions via the connected wallet.
 * Uses wallet adapter's native sendTransaction which handles signing internally.
 */
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";
import { useCallback } from "react";

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
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
      const transaction = Transaction.from(txBytes);

      // wallet-adapter's sendTransaction triggers the wallet popup
      // and handles signing internally (signTransaction + send in one step)
      const signature = await sendTransaction(transaction, connection);

      // Confirm
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      await connection.confirmTransaction(
        { signature, blockhash, lastValidBlockHeight },
        "confirmed",
      );

      return { signature };
    },
    [publicKey, connected, sendTransaction, connection],
  );

  return {
    signAndSend,
    ready: !!(publicKey && connected && sendTransaction),
  };
}
