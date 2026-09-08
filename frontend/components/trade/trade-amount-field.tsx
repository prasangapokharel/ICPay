"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TokenLogo } from "@/components/token/token-logo"
import { TokenFiatHint } from "@/components/token/token-fiat-hint"
import { formatTokenAmount } from "@/lib/wallet/utils"
import type { TokenHolding } from "@/services/tokens"
import { cn } from "@/lib/ui/utils"

export function TradeAmountField({
  label,
  token,
  amountText,
  fiatAmount,
  onAmountChange,
  onPickToken,
  readOnly,
  balance,
  maxHint,
  onMax,
  percentages,
  onPercent,
  className,
}: {
  label: string
  token: TokenHolding | null
  amountText: string
  fiatAmount?: bigint | null
  onPickToken: () => void
  onAmountChange?: (v: string) => void
  readOnly?: boolean
  balance?: bigint
  maxHint?: bigint
  onMax?: () => void
  percentages?: readonly number[]
  onPercent?: (n: number) => void
  className?: string
}) {
  const t = useTranslations("trade")

  return (
    <div className={cn("px-4 py-4 sm:px-5 sm:py-5", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {!readOnly && token && balance !== undefined && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="tabular-nums">
              {t("balance")}: {formatTokenAmount(balance, token.decimals)}
            </span>
            {onMax && maxHint !== undefined && maxHint > 0n && (
              <button
                type="button"
                className="font-semibold text-primary hover:underline"
                onClick={onMax}
              >
                {t("max")}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={onPickToken}
          className="flex shrink-0 items-center gap-2 rounded-full border border-border/60 bg-background py-1.5 pl-1.5 pr-3 text-sm font-semibold shadow-sm transition-colors hover:bg-muted/50"
        >
          {token ? <TokenLogo token={token} className="size-8" /> : null}
          <span>{token?.symbol ?? t("selectToken")}</span>
        </button>

        {readOnly ? (
          <p className="min-w-0 flex-1 truncate text-right text-[clamp(1.5rem,6vw,2rem)] font-semibold tabular-nums tracking-tight">
            {amountText}
          </p>
        ) : (
          <Input
            inputMode="decimal"
            value={amountText}
            onChange={(e) => onAmountChange?.(e.target.value)}
            placeholder="0"
            className="h-auto min-w-0 flex-1 border-0 bg-transparent px-0 text-right text-[clamp(1.5rem,6vw,2rem)] font-semibold tracking-tight shadow-none focus-visible:ring-0"
          />
        )}
      </div>

      {token && fiatAmount !== null && fiatAmount !== undefined && fiatAmount > 0n && (
        <div className="mt-1.5 flex justify-end">
          <TokenFiatHint ledgerId={token.ledgerId} amount={fiatAmount} decimals={token.decimals} />
        </div>
      )}

      {!readOnly && percentages && onPercent && (
        <div className="mt-3 grid grid-cols-4 gap-1.5">
          {percentages.map((p) => (
            <Button
              key={p}
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 rounded-lg bg-muted/40 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => onPercent(p)}
            >
              {p}%
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
