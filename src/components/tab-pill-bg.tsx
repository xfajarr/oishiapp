import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const spring = { type: "spring" as const, stiffness: 420, damping: 34, mass: 0.7 };

/** Sliding highlight behind a segment control; pair with LayoutGroup and unique layoutId per screen. */
export function TabPillBg({
  show,
  layoutId,
  className,
}: {
  show: boolean;
  layoutId: string;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  if (!show) return null;
  return (
    <motion.div
      layoutId={layoutId}
      className={cn(
        "absolute inset-0 z-0 bg-background shadow-sm border border-border/60",
        className,
      )}
      transition={reduceMotion ? { duration: 0.12 } : spring}
      aria-hidden
    />
  );
}
