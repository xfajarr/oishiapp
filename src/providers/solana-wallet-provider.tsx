"use client";

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { clusterApiUrl } from "@solana/web3.js";
import { useMemo, type ReactNode } from "react";

import "@solana/wallet-adapter-react-ui/styles.css";

function pickEndpoint(): string {
  const custom = import.meta.env.VITE_SOLANA_RPC_URL;
  if (typeof custom === "string" && custom.length > 0) return custom;
  const net = import.meta.env.VITE_SOLANA_NETWORK;
  const network =
    net === "mainnet-beta"
      ? WalletAdapterNetwork.Mainnet
      : net === "testnet"
        ? WalletAdapterNetwork.Testnet
        : WalletAdapterNetwork.Devnet;
  return clusterApiUrl(network);
}

export function SolanaWalletProvider({ children }: { children: ReactNode }) {
  const endpoint = useMemo(() => pickEndpoint(), []);
  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
