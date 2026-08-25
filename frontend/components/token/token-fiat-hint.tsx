"use client"

import { useFiatValue } from "@/hooks/fiat/useFiatValue"
import { tokenUsdValue } from "@/lib/token/price"
import { useTokenRegistry } from "@/lib/token/registry"

type TokenFiatHintProps = {
  ledgerId: string
  amount: bigint
  decimals: number
  className?: string
}

export function TokenFiatHint({ ledgerId, amount, decimals, className }: TokenFiatHintProps) {
  const registry = useTokenRegistry()
  const usd = tokenUsdValue(amount, decimals, registry?.get(ledgerId)?.priceUsd)
  const fiat = useFiatValue(usd)

  if (fiat.formatted === null) return null

  return (
    <p className={className ?? "text-xs text-muted-foreground tabular-nums"}>
      ≈ {fiat.symbol}
      {fiat.formatted} {fiat.currency}
    </p>
  )
}
