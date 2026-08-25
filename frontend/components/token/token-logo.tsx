"use client"

import Image from "next/image"
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
    <Image
      src={src}
      alt=""
      width={56}
      height={56}
      unoptimized
      className={cn("shrink-0 rounded-full object-contain", className)}
    />
  )
}
