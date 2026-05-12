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
      <header className="px-5 sm:px-6 lg:px-8 xl:px-10 pt-8 pb-4 lg:pt-10 lg:pb-6 flex items-start justify-between gap-4 flex-shrink-0">
        <div className="min-w-0">
          {subtitle ? (
            <p className="text-[11px] sm:text-xs uppercase tracking-[0.18em] text-muted-foreground mb-1">
              {subtitle}
            </p>
          ) : null}
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl leading-none text-foreground break-words">
            {title}
          </h1>
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </header>
      <main className="flex-1 min-h-0 flex flex-col px-5 sm:px-6 lg:px-8 xl:px-10 pb-32 sm:pb-36 lg:pb-10">
        {children}
      </main>
    </>
  );
}
