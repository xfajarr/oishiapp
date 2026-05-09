export function HoshiMark({ className = "" }: { className?: string }) {
  return (
    <div
      className={
        "inline-flex items-center justify-center size-9 rounded-full bg-ink text-ink-foreground font-display text-lg " +
        className
      }
      aria-label="Hoshi"
    >
      h
    </div>
  );
}
