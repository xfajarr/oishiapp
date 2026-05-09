import { Link, useLocation } from "@tanstack/react-router";
import { Home, Shield, Activity, Sparkles } from "lucide-react";
import { motion, LayoutGroup } from "framer-motion";
import type { ReactNode } from "react";

const tabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/rules", label: "Rules", icon: Shield },
  { to: "/activity", label: "Activity", icon: Activity },
  { to: "/agent", label: "Agent", icon: Sparkles },
] as const;

export function AppShell({
  children,
  title,
  subtitle,
  right,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen w-full flex justify-center bg-background">
      {/* Phone-frame container — looks great on mobile, centered on desktop */}
      <div className="relative w-full max-w-[440px] min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="px-6 pt-8 pb-4 flex items-start justify-between">
          <div>
            {subtitle && (
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-1">
                {subtitle}
              </p>
            )}
            <h1 className="font-display text-4xl leading-none text-foreground">
              {title}
            </h1>
          </div>
          {right}
        </header>

        {/* Content */}
        <main className="flex-1 px-5 pb-32">{children}</main>

        {/* Bottom nav */}
        <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[408px] z-50">
          <LayoutGroup id="bottom-nav">
            <div className="bg-ink text-ink-foreground rounded-full px-2 py-2 flex items-center justify-between shadow-[0_8px_30px_-8px_rgba(0,0,0,0.35)]">
              {tabs.map(({ to, label, icon: Icon }) => {
                const active = pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    className="relative flex items-center gap-2 px-4 py-2.5 rounded-full transition-colors"
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-full bg-accent"
                        transition={{ type: "spring", stiffness: 500, damping: 38 }}
                      />
                    )}
                    <span
                      className={[
                        "relative z-10 inline-flex items-center gap-2",
                        active ? "text-accent-foreground" : "text-ink-foreground/70",
                      ].join(" ")}
                    >
                      <Icon className="size-4" strokeWidth={2.2} />
                      {active && <span className="text-xs font-medium">{label}</span>}
                    </span>
                  </Link>
                );
              })}
            </div>
          </LayoutGroup>
        </nav>
      </div>
    </div>
  );
}
