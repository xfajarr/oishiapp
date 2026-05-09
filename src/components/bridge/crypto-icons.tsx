"use client";

import { cn } from "@/lib/utils";

type IconProps = { className?: string };

/** Ethereum (glyph) */
export function IconEthereum({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-5 shrink-0", className)} aria-hidden>
      <path
        fill="#627EEA"
        d="M16 4.2L9.2 16.4l6.8 3.8 6.8-3.8L16 4.2zm-6.8 13.4L16 27.8l6.8-10.2L16 20l-6.8-2.4z"
      />
    </svg>
  );
}

/** Arbitrum One (simplified mark) */
export function IconArbitrum({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-5 shrink-0", className)} aria-hidden>
      <circle cx="16" cy="16" r="15" fill="#1C2E45" />
      <path
        fill="#28A0F0"
        d="M16 7l7.2 12.4h-4L16 13.2l-3.2 6.2h-4L16 7zm-6.8 14.8h4.1l1.9-3.5 1.9 3.5h4.1L16 11.6 9.2 21.8z"
      />
    </svg>
  );
}

/** Solana (official mark from public assets) */
export function IconSolana({ className }: IconProps) {
  return (
    <img
      src="/images/solanaLogoMark.svg"
      alt=""
      width={20}
      height={18}
      className={cn("size-5 shrink-0 object-contain", className)}
      aria-hidden
    />
  );
}

/** Base (simplified) */
export function IconBase({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-5 shrink-0", className)} aria-hidden>
      <circle cx="16" cy="16" r="15" fill="#0052FF" />
      <circle cx="16" cy="16" r="7" fill="none" stroke="white" strokeWidth="2.2" opacity=".95" />
    </svg>
  );
}

/** USDC (Streamline asset from public) */
export function IconUSDC({ className }: IconProps) {
  return (
    <img
      src="/images/Usdc--Streamline-Cryptocurrency.svg"
      alt=""
      width={20}
      height={20}
      className={cn("size-5 shrink-0 object-contain", className)}
      aria-hidden
    />
  );
}

/** USDT */
export function IconUSDT({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-5 shrink-0", className)} aria-hidden>
      <circle cx="16" cy="16" r="16" fill="#26A17B" />
      <path fill="#fff" d="M11 11h10v2.2h-3.5V23h-2.9V13.2H11V11z" />
    </svg>
  );
}

/** LI.FI (brand asset from public) */
export function IconLifi({ className }: IconProps) {
  return (
    <img
      src="/images/logo_lifi_light.svg"
      alt=""
      width={28}
      height={28}
      className={cn("size-5 shrink-0 object-contain", className)}
      aria-hidden
    />
  );
}
