import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { OishiMark } from "@/components/oishi-mark";
import { useEffect } from "react";
import { ArrowRight } from "lucide-react";

type OnboardingSearch = {
  redirect?: string;
};

function parseRedirect(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  if (!raw.startsWith("/") || raw.startsWith("//")) return undefined;
  if (raw === "/onboarding") return "/";
  return raw;
}

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Connect wallet — Oishi" },
      { name: "description", content: "Connect a Solana wallet to use Oishi." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): OnboardingSearch => ({
    redirect: parseRedirect(search.redirect),
  }),
  component: OnboardingPage,
});

function OnboardingPage() {
  const { redirect } = Route.useSearch();
  const { connected, publicKey, disconnect } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (!connected) return;
    const to = redirect ?? "/";
    navigate({ to, replace: true });
  }, [connected, redirect, navigate]);

  return (
    <div className="min-h-screen w-full flex justify-center bg-background relative">
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.85]"
        aria-hidden
        style={{
          background: [
            "radial-gradient(120% 90% at 50% -15%, color-mix(in oklch, var(--accent) 22%, transparent) 0%, transparent 58%)",
            "radial-gradient(90% 60% at 100% 5%, color-mix(in oklch, var(--primary) 8%, transparent) 0%, transparent 50%)",
          ].join(", "),
        }}
      />

      <div className="relative w-full max-w-[440px] min-h-screen flex flex-col items-center justify-center px-6 py-16 sm:border-x border-border/40">
        <OishiMark className="size-12 text-2xl mb-8" />

        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground text-center">
          Step one
        </p>
        <h1 className="font-display text-4xl text-foreground text-center mt-2 leading-tight">
          Connect your Solana wallet
        </h1>
        <p className="text-sm text-muted-foreground text-center mt-3 max-w-sm">
          Oishi keeps funds and rules on-chain. Connect with Phantom or Solflare to continue.
        </p>

        <div className="mt-10 w-full max-w-xs flex flex-col items-center gap-4">
          <div
            className={
              "w-full flex justify-center [&_.wallet-adapter-button-trigger]:!rounded-full " +
              "[&_.wallet-adapter-button-trigger]:!bg-ink [&_.wallet-adapter-button-trigger]:!text-ink-foreground " +
              "[&_.wallet-adapter-button-trigger]:hover:!opacity-90"
            }
          >
            <WalletMultiButton />
          </div>

          {publicKey ? (
            <>
              <p className="text-xs font-mono text-muted-foreground text-center break-all">
                {publicKey.toBase58().slice(0, 4)}…{publicKey.toBase58().slice(-4)}
              </p>
              <button
                type="button"
                onClick={() => disconnect()}
                className="text-xs text-muted-foreground underline-offset-2 hover:underline"
              >
                Disconnect
              </button>
            </>
          ) : null}
        </div>

        <div className="mt-16 flex items-center gap-2 text-xs text-muted-foreground">
          <ArrowRight className="size-3.5" />
          <span>After you approve, you&apos;ll enter the app automatically.</span>
        </div>
      </div>
    </div>
  );
}
