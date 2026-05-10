"use client";

import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import { ShellChrome } from "@/components/shell-chrome";
import { WalletGate } from "@/components/wallet-gate";

export const Route = createFileRoute("/_app")({
  component: AppShellLayout,
});

function AppShellLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const reduceMotion = useReducedMotion();
  const isFirstPaint = useRef(true);

  useEffect(() => {
    isFirstPaint.current = false;
  }, []);

  const pageEase = [0.22, 1, 0.36, 1] as const;
  const pageTransition = reduceMotion ? { duration: 0.14 } : { duration: 0.28, ease: pageEase };

  const skipEnter = isFirstPaint.current || reduceMotion;

  /** Opacity-only: Y/scale + shared layout elsewhere caused visible hitching (e.g. /fund vs tab indicator). */
  return (
    <WalletGate>
      <ShellChrome>
        {/*
          Enter-only: avoids AnimatePresence + Outlet mismatch (router updates outlet before exit finishes).
        */}
        <motion.div
          key={pathname}
          className="flex flex-col flex-1 min-h-0"
          initial={skipEnter ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={pageTransition}
        >
          <Outlet />
        </motion.div>
      </ShellChrome>
    </WalletGate>
  );
}
