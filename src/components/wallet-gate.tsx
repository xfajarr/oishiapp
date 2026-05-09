"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

/**
 * Sends unauthenticated users to `/onboarding`. Mount only inside routes that require a wallet.
 */
export function WalletGate({ children }: { children: ReactNode }) {
  const { connected, connecting } = useWallet();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (connecting) return;
    if (connected) return;
    const safeRedirect =
      pathname && pathname !== "/onboarding" && pathname.startsWith("/") ? pathname : "/";
    navigate({
      to: "/onboarding",
      search: { redirect: safeRedirect },
      replace: true,
    });
  }, [mounted, connected, connecting, navigate, pathname]);

  if (!mounted || !connected) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background px-6">
        <div className="size-9 rounded-full border-2 border-muted border-t-foreground animate-spin" />
        <p className="mt-4 text-sm text-muted-foreground">Preparing your wallet…</p>
      </div>
    );
  }

  return <>{children}</>;
}
