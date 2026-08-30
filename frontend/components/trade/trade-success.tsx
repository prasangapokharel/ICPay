"use client"

import { useEffect, useMemo, useRef } from "react"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { Tick02Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { requiredWalletDebit } from "@/lib/trade/fees"
import { formatTokenAmount } from "@/lib/wallet/utils"
import { playSuccessChime } from "@/lib/ui/successChime"
import type { TokenHolding } from "@/services/tokens"

export function TradeSuccessView({
  amountIn,
  amountOut,
  tokenIn,
  tokenOut,
  beforeIn,
  beforeOut,
  onDone,
}: {
  amountIn: bigint
  amountOut: bigint
  tokenIn: TokenHolding
  tokenOut: TokenHolding
  beforeIn: bigint
  beforeOut: bigint
  onDone: () => void
}) {
  const t = useTranslations("trade")
  const tc = useTranslations("common")

  const chimed = useRef(false)
  useEffect(() => {
    if (chimed.current) return
    chimed.current = true
    playSuccessChime()
  }, [])

  const { afterIn, afterOut } = useMemo(() => {
    const tokenDebit = requiredWalletDebit(amountIn, tokenIn.fee)
    return {
      afterIn: beforeIn > tokenDebit ? beforeIn - tokenDebit : 0n,
      afterOut: beforeOut + amountOut,
    }
  }, [amountIn, amountOut, beforeIn, beforeOut, tokenIn.fee])

  const paid = `${formatTokenAmount(amountIn, tokenIn.decimals)} ${tokenIn.symbol}`
  const received = `${formatTokenAmount(amountOut, tokenOut.decimals)} ${tokenOut.symbol}`

  return (
    <div className="flex flex-col items-center pt-6 text-center">
      <div className="animate-in fade-in zoom-in-75 mb-5 flex size-18 items-center justify-center rounded-full bg-success/10 duration-300 ease-out">
        <span className="flex size-13 items-center justify-center rounded-full bg-success text-background shadow-sm">
          <HugeiconsIcon icon={Tick02Icon} className="size-8" strokeWidth={3} />
        </span>
      </div>

      <h1 className="text-2xl font-bold tracking-tight">{t("successTitle")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t("successBody")}</p>

      <p className="mt-8 text-xs text-muted-foreground">{t("youReceive")}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums">{received}</p>
      <p className="mt-3 text-sm text-muted-foreground tabular-nums">
        {t("youPay")}: {paid}
      </p>

      <div className="mt-8 w-full border-t border-dashed pt-6 text-left">
        <p className="text-xs text-muted-foreground">{t("balanceAfter")}</p>
        <div className="mt-3 space-y-2 rounded-2xl bg-muted/50 p-4">
          <BalanceLine
            symbol={tokenIn.symbol}
            decimals={tokenIn.decimals}
            before={beforeIn}
            after={afterIn}
          />
          <BalanceLine
            symbol={tokenOut.symbol}
            decimals={tokenOut.decimals}
            before={beforeOut}
            after={afterOut}
          />
        </div>
      </div>

      <Button className="mt-8 w-full" onClick={onDone}>
        {tc("done")}
      </Button>
    </div>
  )
}

function BalanceLine({
  symbol,
  decimals,
  before,
  after,
}: {
  symbol: string
  decimals: number
  before: bigint
  after: bigint
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="font-medium">{symbol}</span>
      <span className="tabular-nums text-muted-foreground">
        {formatTokenAmount(before, decimals)} →{" "}
        <span className="font-medium text-foreground">{formatTokenAmount(after, decimals)}</span>
      </span>
    </div>
  )
}
