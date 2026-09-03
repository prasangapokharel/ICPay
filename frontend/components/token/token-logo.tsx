"use client"

import type { TokenHolding } from "@/services/tokens"
import { useTokenRegistry } from "@/lib/token/registry"
import { resolveTokenIcon } from "@/lib/token/icon"
import { cn } from "@/lib/ui/utils"

type TokenLogoProps = {
  token: Pick<TokenHolding, "ledgerId" | "symbol" | "logo">
  className?: string
}

export function TokenLogo({ token, className = "size-9" }: TokenLogoProps) {
  const registry = useTokenRegistry()
  const src = resolveTokenIcon(token.ledgerId, token.logo, registry)

  if (!src) {
    return (
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold uppercase text-muted-foreground",
          className
        )}
      >
        {token.symbol.slice(0, 2)}
      </span>
    )
  }

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
