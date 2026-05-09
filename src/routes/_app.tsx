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
  const pageTransition = reduceMotion ? { duration: 0.15 } : { duration: 0.38, ease: pageEase };

  const skipEnter = isFirstPaint.current || reduceMotion;

  return (
    <WalletGate>
      <ShellChrome>
        {/*
          Enter-only: avoids AnimatePresence + Outlet mismatch (router updates outlet before exit finishes).
        */}
        <motion.div
          key={pathname}
          className="flex flex-col flex-1"
          initial={skipEnter ? false : { opacity: 0, y: 16, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={pageTransition}
        >
          <Outlet />
        </motion.div>
      </ShellChrome>
    </WalletGate>
  );
}
