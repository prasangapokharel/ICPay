"use client"

import { cn } from "@/lib/ui/utils"
import { rememberedTokenLogo, usableTokenLogo } from "@/lib/market/tokenLogo"
import { resolveTokenIcon } from "@/lib/token/icon"

export function TokenAvatar({
  symbol,
  ledgerId,
  logoUrl,
  className,
}: {
  symbol: string
  ledgerId?: string
  logoUrl?: string | null
  className?: string
}) {
  const src =
    usableTokenLogo(logoUrl) ??
    (ledgerId ? rememberedTokenLogo(ledgerId) : null) ??
    (ledgerId ? resolveTokenIcon(ledgerId) : undefined) ??
    null

  if (src) {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted",
          className
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className="size-full object-contain p-[7%]" />
      </span>
    )
  }

  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold",
        className
      )}
      aria-hidden
    >
      {symbol.slice(0, 1).toUpperCase()}
    </span>
  )
}
