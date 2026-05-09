import { Link, useLocation } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { Activity, Home, LayoutGrid, Rocket, UserCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const leftTabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/marketplace", label: "Market", icon: LayoutGrid },
] as const;

const rightTabs = [
  { to: "/activity", label: "Activity", icon: Activity },
  { to: "/profile", label: "Profile", icon: UserCircle },
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
      </div>

      {/*
        Keep nav outside the backdrop-blur column: blur creates a containing block, so fixed
        descendants anchor to the (possibly very tall) column instead of the viewport.
      */}
      <nav
        className="fixed z-50 left-1/2 -translate-x-1/2 w-[calc(100%-1rem)] max-w-[420px] pointer-events-none bottom-[max(1rem,env(safe-area-inset-bottom,0px))]"
        aria-label="App navigation"
      >
        <div className="pointer-events-auto">
          <BottomNav pathname={pathname} />
        </div>
      </nav>
    </div>
  );
}

function BottomNav({ pathname }: { pathname: string }) {
  const reduceMotion = useReducedMotion();
  const launchActive = pathname === "/launch";

  const renderTab = (item: { to: string; label: string; icon: LucideIcon }) => {
    const active = pathname === item.to;
    const Icon = item.icon;
    return (
      <Link
        key={item.to}
        to={item.to}
        className={cn(
          "relative shrink-0 flex items-center justify-center gap-1.5 py-2.5 px-2 sm:px-2.5 rounded-full min-w-0 flex-1 max-w-[5.5rem]",
          active ? "text-accent-foreground" : "text-ink-foreground/70 hover:text-ink-foreground",
        )}
      >
        {active ? (
          <motion.div
            layoutId="shell-nav-pill"
            className="absolute inset-0 rounded-full bg-accent shadow-none"
            transition={
              reduceMotion
                ? { duration: 0.2 }
                : { type: "spring", stiffness: 420, damping: 34, mass: 0.7 }
            }
          />
        ) : null}
        <span className="relative z-10 flex items-center justify-center gap-2 px-0.5">
          <Icon className="size-[15px] sm:size-4 shrink-0" strokeWidth={2.2} />
          {active ? (
            <motion.span
              initial={reduceMotion ? false : { opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: reduceMotion ? 0.1 : 0.22,
                delay: reduceMotion ? 0 : 0.05,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="text-xs font-medium truncate hidden sm:inline"
            >
              {item.label}
            </motion.span>
          ) : null}
        </span>
      </Link>
    );
  };

  return (
    <div className="relative pt-1.5">
      <div className="relative rounded-full bg-ink/95 text-ink-foreground backdrop-blur-md px-1 py-1 flex items-stretch gap-0 min-h-[52px] shadow-[0_12px_40px_-12px_rgba(0,0,0,0.45)]">
        <div className="flex flex-1 min-w-0 items-center justify-stretch gap-0">
          {leftTabs.map(renderTab)}
        </div>

        <div
          className="w-[3.25rem] sm:w-14 shrink-0 flex items-center justify-center"
          aria-hidden="true"
        />

        <div className="flex flex-1 min-w-0 items-center justify-stretch gap-0">
          {rightTabs.map(renderTab)}
        </div>
      </div>

      <div className="pointer-events-auto absolute left-1/2 top-2 -translate-x-1/2 -translate-y-[18%]">
        <Link
          to="/launch"
          aria-label="Launch agent"
          aria-current={launchActive ? "page" : undefined}
          className={cn(
            "flex size-[3.25rem] sm:size-14 items-center justify-center rounded-full bg-accent text-accent-foreground",
            "shadow-[0_10px_28px_-10px_color-mix(in_oklch,var(--accent)_55%,transparent)]",
            "hover:bg-accent/90 active:scale-[0.96] transition-[transform,background-color]",
            launchActive && "ring-[3px] ring-ink/35 scale-[1.03]",
          )}
        >
          <Rocket className="size-[1.15rem] sm:size-5" strokeWidth={2.25} />
        </Link>
      </div>
    </div>
  );
}
