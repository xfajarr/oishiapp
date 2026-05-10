import type { ReactNode } from "react";

export function AppPage({
  title,
  subtitle,
  right,
  children,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <>
      <header className="px-6 pt-8 pb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          {subtitle ? (
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-1">
              {subtitle}
            </p>
          ) : null}
          <h1 className="font-display text-4xl leading-none text-foreground break-words">
            {title}
          </h1>
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </header>
      <main className="flex-1 min-h-0 flex flex-col px-5 pb-32">{children}</main>
    </>
  );
}
