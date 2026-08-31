"use client"

import { useTranslations } from "next-intl"
import { formatTokenAmount } from "@/lib/wallet/utils"
import type { TokenHolding } from "@/services/tokens"

export function TradeFeeSummary({
  tokenIn,
  tokenOut,
  serviceFee,
  poolFee,
  depositFee,
  totalDebit,
  rate,
}: {
  tokenIn: TokenHolding
  tokenOut: TokenHolding
  serviceFee: bigint | null
  poolFee: bigint | null
  depositFee: bigint
  totalDebit: bigint | null
  rate: string | null
}) {
  const t = useTranslations("trade")

  return (
    <div className="rounded-2xl border border-border/50 bg-muted/20 px-4 py-3 text-xs">
      {rate && (
        <div className="mb-2 flex items-center justify-between gap-3 border-b border-border/40 pb-2 text-foreground">
          <span className="text-muted-foreground">{t("rate")}</span>
          <span className="text-right font-medium tabular-nums">
            1 {tokenIn.symbol} ≈ {rate} {tokenOut.symbol}
          </span>
        </div>
      )}

      <div className="space-y-1 text-muted-foreground">
        <FeeRow label={t("serviceFee")} value={serviceFee} token={tokenIn} />
        {poolFee !== null && <FeeRow label={t("poolFee")} value={poolFee} token={tokenIn} />}
        <FeeRow label={t("depositFee")} value={depositFee} token={tokenIn} />
      </div>

      {totalDebit !== null && (
        <div className="mt-2 flex justify-between border-t border-border/40 pt-2 font-medium text-foreground">
          <span>{t("totalDebit")}</span>
          <span className="tabular-nums">
            {formatTokenAmount(totalDebit, tokenIn.decimals)} {tokenIn.symbol}
          </span>
        </div>
      )}

      <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground/80">{t("feeNote")}</p>
    </div>
  )
}

function FeeRow({
  label,
  value,
  token,
}: {
  label: string
  value: bigint | null
  token: TokenHolding
}) {
  if (value === null) return null
  return (
    <div className="flex justify-between gap-3 py-0.5">
      <span>{label}</span>
      <span className="tabular-nums">
        {formatTokenAmount(value, token.decimals)} {token.symbol}
      </span>
    </div>
  )
}
