"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowUpDownIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
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
  const [open, setOpen] = useState(false)
  const slippagePct = (Number(DEFAULT_SLIPPAGE_BPS) / 100).toFixed(0)
  const receive = quote
    ? `${formatTokenAmount(quote.amountOut, outDecimals)} ${receiveSymbol}`
    : "—"

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] text-muted-foreground">{t("youReceive")}</p>
          <p className="truncate text-sm font-semibold tabular-nums">
            {quoting ? <Spinner className="size-3" /> : receive}
          </p>
        </div>
        <CollapsibleTrigger
          render={
            <Button variant="ghost" size="icon" className="size-8 shrink-0">
              <HugeiconsIcon icon={ArrowUpDownIcon} className="size-4" strokeWidth={2} />
              <span className="sr-only">{t("youReceive")}</span>
            </Button>
          }
        />
      </div>
      <CollapsibleContent className="flex flex-col gap-2">
        {quote ? (
          <div className="flex items-center justify-between rounded-md border px-3 py-2 text-[11px]">
            <span className="text-muted-foreground">{t("poolFee")}</span>
            <span className="tabular-nums font-medium">
              {formatTokenAmount(quote.swapFee, payDecimals)} {paySymbol}
            </span>
          </div>
        ) : null}
        <div className="flex items-center justify-between rounded-md border px-3 py-2 text-[11px]">
          <span className="text-muted-foreground">{t("slippage")}</span>
          <span className="font-medium">{slippagePct}%</span>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
