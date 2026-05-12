import { createConfig, http, WagmiProvider } from "wagmi";
import { arbitrum, base, mainnet } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";

const projectId =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? "00000000000000000000000000000000";

const wagmiConfig = createConfig({
  chains: [arbitrum, mainnet, base],
  connectors: [injected(), walletConnect({ projectId })],
  transports: {
    [arbitrum.id]: http(),
    [mainnet.id]: http(),
    [base.id]: http(),
  },
  ssr: true,
});

const evmQueryClient = new QueryClient();

export function EvmWalletProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={evmQueryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

export { wagmiConfig };
