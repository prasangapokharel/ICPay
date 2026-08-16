"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { formatTokenAmount } from "@/lib/wallet-utils"
import type { TokenHolding } from "@/services/tokens"

export function SwapSuccessView({
  amountIn,
  amountOut,
  tokenIn,
  tokenOut,
  blockIndex,
  onDone,
}: {
  amountIn: bigint
  amountOut: bigint
  tokenIn: TokenHolding
  tokenOut: TokenHolding
  blockIndex: bigint
  onDone: () => void
}) {
  const t = useTranslations("swap")
  return (
    <div className="flex flex-col items-center gap-4 py-10 text-center">
      <h2 className="text-xl font-bold">{t("successTitle")}</h2>
      <p className="text-sm text-muted-foreground">{t("successBody")}</p>
      <p className="text-lg font-semibold tabular-nums">
        {formatTokenAmount(amountIn, tokenIn.decimals)} {tokenIn.symbol} →{" "}
        {formatTokenAmount(amountOut, tokenOut.decimals)} {tokenOut.symbol}
      </p>
      <p className="text-xs text-muted-foreground">
        {t("blockIndex")}: {blockIndex.toString()}
      </p>
      <Button className="mt-4 w-full max-w-xs" onClick={onDone}>
        {t("done")}
      </Button>
    </div>
  )
}
