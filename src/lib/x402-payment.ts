/**
 * x402 payment client for Oishi.
 * Calculates total cost for skills, strategies, and tools.
 * Executes USDC transfer on Solana mainnet.
 */
import { PublicKey, Connection, Transaction } from "@solana/web3.js";
import { getAssociatedTokenAddress, createTransferCheckedInstruction } from "@solana/spl-token";

// Mainnet USDC
const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const TREASURY = new PublicKey("BmdYGSjmPg7oFCjpxf88pRjeu4yMi6bhnVWYsH3W2o6A");
const RPC_URL = "https://api.mainnet-beta.solana.com";

export interface PaymentQuote {
  totalUsd: number;
  items: { name: string; price: number; bundled: boolean }[];
  description: string;
}

/**
 * Calculate total cost for an agent launch.
 * Includes skill price + any non-bundled strategies + non-bundled tools.
 */
export function calculateTotal(items: { name: string; priceUsd: number }[]): number {
  return items.reduce((sum, item) => sum + item.priceUsd, 0);
}

/**
 * Execute payment via USDC transfer.
 * Returns the transaction signature.
 */
export async function payWithUsdc(
  wallet: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  amountUsd: number,
): Promise<{ signature: string }> {
  const connection = new Connection(RPC_URL, "confirmed");

  const fromATA = await getAssociatedTokenAddress(USDC_MINT, wallet.publicKey);
  const toATA = await getAssociatedTokenAddress(USDC_MINT, TREASURY);
  const amount = Math.floor(amountUsd * 1_000_000);

  const tx = new Transaction().add(
    createTransferCheckedInstruction(fromATA, USDC_MINT, toATA, wallet.publicKey, amount, 6),
  );

  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = wallet.publicKey;

  const signature = await wallet.sendTransaction(tx, connection);
  await connection.confirmTransaction(signature, "confirmed");

  return { signature };
}
