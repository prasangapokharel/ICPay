"use client"

import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { InformationCircleIcon } from "@hugeicons/core-free-icons"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Spinner } from "@/components/ui/spinner"
import { formatTokenAmount } from "@/lib/wallet/utils"
import { DEFAULT_SLIPPAGE_BPS } from "@/lib/trade/fees"
import type { TradeQuoteResult } from "@/services/trade/types"

export function TradeOrderQuote({
  quote,
  quoting,
  paySymbol,
  receiveSymbol,
  payDecimals,
  outDecimals,
}: {
  quote: TradeQuoteResult | undefined
  quoting: boolean
  paySymbol: string
  receiveSymbol: string
  payDecimals: number
  outDecimals: number
}) {
  const t = useTranslations("marketTrade")
  const slippagePct = (Number(DEFAULT_SLIPPAGE_BPS) / 100).toFixed(0)
  const receive = quote
    ? `${formatTokenAmount(quote.amountOut, outDecimals)} ${receiveSymbol}`
    : "—"

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{t("youReceive")}</p>
        <p className="truncate text-sm font-semibold tabular-nums">
          {quoting ? <Spinner className="size-3" /> : receive}
        </p>
      </div>
      <Popover>
        <PopoverTrigger
          aria-label={t("youReceive")}
          className="inline-flex size-7 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
        >
          <HugeiconsIcon icon={InformationCircleIcon} className="size-4" strokeWidth={1.75} />
        </PopoverTrigger>
        <PopoverContent align="end" className="w-56 gap-2 p-3">
          {quote ? (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">{t("poolFee")}</span>
              <span className="tabular-nums font-medium">
                {formatTokenAmount(quote.swapFee, payDecimals)} {paySymbol}
              </span>
            </div>
          ) : null}
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">{t("slippage")}</span>
            <span className="font-medium">{slippagePct}%</span>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
