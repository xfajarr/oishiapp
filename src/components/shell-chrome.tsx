import { Link, useLocation } from "@tanstack/react-router";
import { useWallet } from "@solana/wallet-adapter-react";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  Bot,
  Home,
  LayoutGrid,
  MessageSquare,
  Rocket,
  Settings,
  UserCircle,
  Wallet,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useUiAgent } from "@/hooks/use-ui-agent";
import { OishiMark } from "./oishi-mark";

const leftTabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/marketplace", label: "Strategies", icon: LayoutGrid },
] as const;

const rightTabs = [
  { to: "/activity", label: "Activity", icon: Activity },
  { to: "/profile", label: "Profile", icon: UserCircle },
] as const;

const navSpring = { type: "spring" as const, stiffness: 460, damping: 36, mass: 0.62 };

export function ShellChrome({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { connected, publicKey } = useWallet();
  const { hasAgent, isLoading: agentLoading } = useUiAgent();

  return (
    <div className="min-h-screen w-full flex bg-background relative">
      {/* Background gradient */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-60"
        aria-hidden
        style={{
          background: [
            "radial-gradient(120% 90% at 50% -15%, color-mix(in oklch, var(--accent) 22%, transparent) 0%, transparent 58%)",
            "radial-gradient(90% 60% at 100% 5%, color-mix(in oklch, var(--primary) 8%, transparent) 0%, transparent 50%)",
            "radial-gradient(70% 50% at 0% 80%, color-mix(in oklch, var(--accent) 10%, transparent) 0%, transparent 45%)",
          ].join(", "),
        }}
      />

      {/* Desktop sidebar — hidden on mobile/tablet */}
      <DesktopSidebar
        pathname={pathname}
        connected={!!connected}
        hasAgent={!!hasAgent && !agentLoading}
      />

      {/* Mobile bottom nav — hidden on desktop */}
      <nav
        className="fixed z-50 left-1/2 -translate-x-1/2 w-[calc(100%-1rem)] max-w-[420px] pointer-events-none bottom-[max(1rem,env(safe-area-inset-bottom,0px))] lg:hidden"
        aria-label="App navigation"
      >
        <div className="pointer-events-auto">
          <BottomNav pathname={pathname} />
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 min-h-screen flex flex-col">
        {/* Mobile: constrained column. Desktop: full width with max-width */}
        <div className="w-full max-w-[440px] mx-auto sm:max-w-[500px] flex flex-col flex-1 lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl lg:mx-0">
          <div className="flex-1 flex flex-col">{children}</div>
        </div>
      </main>
    </div>
  );
}

function DesktopSidebar({
  pathname,
  connected,
  hasAgent,
}: {
  pathname: string;
  connected: boolean;
  hasAgent: boolean;
}) {
  const launchActive = pathname === "/launch";
  const navTargets = [...leftTabs, ...rightTabs];

  return (
    <aside className="hidden lg:flex flex-col w-[260px] xl:w-[280px] shrink-0 bg-background border-r border-border/40 sticky top-0 h-screen overflow-y-auto no-scrollbar">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-border/40">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="size-9 rounded-xl bg-ink flex items-center justify-center shrink-0 group-hover:bg-accent transition-colors">
            <Bot className="size-5 text-ink-foreground" strokeWidth={1.8} />
          </div>
          <span className="font-display text-2xl tracking-tight">Oishi</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-0.5" aria-label="Desktop navigation">
        <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-medium px-4 mb-2">
          Main
        </p>
        {navTargets.map((item) => {
          const active = pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                active
                  ? "bg-accent/10 text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
              )}
            >
              <Icon className="size-[18px] shrink-0" strokeWidth={2} />
              {item.label}
              {active && <span className="ml-auto size-1.5 rounded-full bg-accent" />}
            </Link>
          );
        })}

        <div className="pt-5 mt-4 border-t border-border/40">
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-medium px-4 mb-2">
            Actions
          </p>
          <Link
            to="/fund"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          >
            <Wallet className="size-[18px] shrink-0" strokeWidth={2} />
            Fund agent
          </Link>
          <Link
            to="/profile"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          >
            <Settings className="size-[18px] shrink-0" strokeWidth={2} />
            Settings
          </Link>
        </div>
      </nav>

      {/* Launch CTA */}
      <div className="p-4 border-t border-border/40">
        <Link
          to="/launch"
          search={{ tab: launchActive ? "active" : hasAgent ? "active" : "new" }}
          className={cn(
            "flex items-center justify-center gap-2.5 w-full py-3 rounded-2xl text-sm font-semibold transition-all duration-150",
            "bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm",
            launchActive && "ring-2 ring-accent/40",
          )}
        >
          {hasAgent ? (
            <>
              <MessageSquare className="size-[17px]" strokeWidth={2.2} />
              Ask your agent
            </>
          ) : (
            <>
              <Rocket className="size-[17px]" strokeWidth={2.2} />
              Launch agent
            </>
          )}
        </Link>

        {/* Agent status indicator */}
        {hasAgent && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/50">
            <span className="size-2 rounded-full bg-accent animate-pulse shrink-0" />
            <span className="text-xs text-muted-foreground">Agent active</span>
            <Zap className="size-3 ml-auto text-accent shrink-0" />
          </div>
        )}
      </div>
    </aside>
  );
}

function BottomNav({ pathname }: { pathname: string }) {
  const reduceMotion = useReducedMotion();
  const launchActive = pathname === "/launch";

  const { connected, publicKey } = useWallet();
  const { hasAgent, isLoading: agentLoading } = useUiAgent();
  const fabAsksAgent = connected && !!publicKey && !agentLoading && hasAgent;

  const navTargets = [...leftTabs, ...rightTabs];
  const navActive = navTargets.some((t) => t.to === pathname);

  const renderTab = (item: { to: string; label: string; icon: LucideIcon }) => {
    const active = pathname === item.to;
    const Icon = item.icon;
    return (
      <Link
        key={item.to}
        to={item.to}
        className={cn(
          "relative shrink-0 basis-0 flex flex-1 items-center justify-center gap-1 min-h-[44px] min-w-0 py-2 px-1 rounded-full",
          active
            ? "text-accent-foreground max-w-none"
            : "text-ink-foreground/70 hover:text-ink-foreground max-w-[4.75rem]",
        )}
      >
        {active && navActive ? (
          <motion.div
            layoutId="oishi-bottom-nav-pill"
            className="absolute inset-0 rounded-full bg-accent shadow-none"
            transition={reduceMotion ? { duration: 0.12 } : navSpring}
          />
        ) : null}
        <motion.span
          className="relative z-10 flex items-center justify-center gap-1 px-0.5"
          whileTap={reduceMotion ? undefined : { scale: 0.94 }}
        >
          <Icon className="size-[17px] shrink-0" strokeWidth={2.05} />
          {active ? (
            <motion.span
              initial={reduceMotion ? false : { opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: reduceMotion ? 0.1 : 0.22,
                delay: reduceMotion ? 0 : 0.05,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="text-[11px] font-medium truncate tracking-tight hidden sm:inline max-w-[4.75rem]"
            >
              {item.label}
            </motion.span>
          ) : null}
        </motion.span>
      </Link>
    );
  };

  return (
    <motion.div
      className="relative pt-1.5"
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <LayoutGroup id="oishi-bottom-nav">
        <div className="relative rounded-[2rem] bg-ink/95 text-ink-foreground backdrop-blur-md px-1.5 py-1 flex items-stretch min-h-[54px] shadow-[0_12px_40px_-12px_rgba(0,0,0,0.45)] gap-0 border border-white/[0.06]">
          <div className="flex flex-1 min-w-0 items-center justify-evenly gap-0.5 px-0.5">
            {leftTabs.map(renderTab)}
          </div>

          <div
            className="w-[clamp(4rem,12vw,4.75rem)] sm:w-[4.5rem] shrink-0 flex items-center justify-center"
            aria-hidden="true"
          />

          <div className="flex flex-1 min-w-0 items-center justify-evenly gap-0.5 px-0.5">
            {rightTabs.map(renderTab)}
          </div>
        </div>
      </LayoutGroup>

      <div className="pointer-events-auto absolute left-1/2 top-1.5 -translate-x-1/2 -translate-y-[22%]">
        {fabAsksAgent ? (
          <motion.div whileTap={reduceMotion ? undefined : { scale: 0.92 }}>
            <Link
              to="/launch"
              search={{ tab: "active" }}
              aria-label="Ask your agent"
              className={cn(
                "flex size-[3.25rem] sm:size-14 items-center justify-center rounded-full bg-accent text-accent-foreground",
                "shadow-[0_10px_28px_-10px_color-mix(in_oklch,var(--accent)_55%,transparent)]",
                "hover:bg-accent/90 transition-[transform,background-color]",
              )}
            >
              <MessageSquare className="size-[1.15rem] sm:size-5" strokeWidth={2.25} />
            </Link>
          </motion.div>
        ) : (
          <motion.div whileTap={reduceMotion ? undefined : { scale: 0.92 }}>
            <Link
              to="/launch"
              search={{ tab: "new" }}
              aria-label="Launch agent"
              aria-current={launchActive ? "page" : undefined}
              className={cn(
                "flex size-[3.25rem] sm:size-14 items-center justify-center rounded-full bg-accent text-accent-foreground",
                "shadow-[0_10px_28px_-10px_color-mix(in_oklch,var(--accent)_55%,transparent)]",
                "hover:bg-accent/90 transition-[transform,background-color]",
                launchActive && "ring-[3px] ring-ink/35 scale-[1.03]",
              )}
            >
              <Rocket className="size-[1.15rem] sm:size-5" strokeWidth={2.25} />
            </Link>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
