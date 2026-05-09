import { Link, useLocation } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { Home, Shield, Activity, Bot } from "lucide-react";
import type { ReactNode } from "react";

const tabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/rules", label: "Rules", icon: Shield },
  { to: "/activity", label: "Activity", icon: Activity },
  { to: "/agent", label: "Agent", icon: Bot },
] as const;

export function ShellChrome({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen w-full flex justify-center bg-background relative">
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.85]"
        aria-hidden
        style={{
          background: [
            "radial-gradient(120% 90% at 50% -15%, color-mix(in oklch, var(--accent) 22%, transparent) 0%, transparent 58%)",
            "radial-gradient(90% 60% at 100% 5%, color-mix(in oklch, var(--primary) 8%, transparent) 0%, transparent 50%)",
            "radial-gradient(70% 50% at 0% 80%, color-mix(in oklch, var(--accent) 10%, transparent) 0%, transparent 45%)",
          ].join(", "),
        }}
      />

      <div className="relative w-full max-w-[440px] min-h-screen bg-background/80 backdrop-blur-[2px] flex flex-col sm:border-x border-border/40 sm:shadow-[0_32px_120px_-48px_rgba(20,24,35,0.28)]">
        {children}

        <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[408px] z-50">
          <BottomNav pathname={pathname} />
        </nav>
      </div>
    </div>
  );
}

function BottomNav({ pathname }: { pathname: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="bg-ink/95 text-ink-foreground backdrop-blur-md rounded-full px-2 py-2 flex items-center justify-between shadow-[0_12px_40px_-12px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.06)_inset]">
      {tabs.map(({ to, label, icon: Icon }) => {
        const active = pathname === to;
        return (
          <Link
            key={to}
            to={to}
            className={[
              "relative flex flex-1 items-center justify-center gap-2 py-2.5 rounded-full min-w-0",
              active
                ? "text-accent-foreground"
                : "text-ink-foreground/70 hover:text-ink-foreground",
            ].join(" ")}
          >
            {active ? (
              <motion.div
                layoutId="shell-nav-pill"
                className="absolute inset-0 rounded-full bg-accent shadow-[0_1px_0_rgba(255,255,255,0.2)_inset]"
                transition={
                  reduceMotion
                    ? { duration: 0.2 }
                    : { type: "spring", stiffness: 420, damping: 34, mass: 0.7 }
                }
              />
            ) : null}
            <span className="relative z-10 flex items-center gap-2 px-1">
              <Icon className="size-4 shrink-0" strokeWidth={2.2} />
              {active ? (
                <motion.span
                  initial={reduceMotion ? false : { opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: reduceMotion ? 0.1 : 0.22,
                    delay: reduceMotion ? 0 : 0.05,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="text-xs font-medium truncate"
                >
                  {label}
                </motion.span>
              ) : null}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
