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
import { TokenAvatar } from "./token-avatar"

export function TradeOrderQuote({
  quote,
  quoting,
  paySymbol,
  receiveSymbol,
  payDecimals,
  outDecimals,
  payLedgerId,
  payLogoUrl,
  receiveLedgerId,
  receiveLogoUrl,
}: {
  quote: TradeQuoteResult | undefined
  quoting: boolean
  paySymbol: string
  receiveSymbol: string
  payDecimals: number
  outDecimals: number
  payLedgerId?: string
  payLogoUrl?: string | null
  receiveLedgerId?: string
  receiveLogoUrl?: string | null
}) {
  const t = useTranslations("marketTrade")
  const slippagePct = (Number(DEFAULT_SLIPPAGE_BPS) / 100).toFixed(0)

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{t("youReceive")}</p>
        <div className="flex items-center gap-1.5 truncate text-sm font-semibold tabular-nums">
          {quoting ? (
            <Spinner className="size-3" />
          ) : quote ? (
            <>
              <span>{formatTokenAmount(quote.amountOut, outDecimals)}</span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-foreground">
                <TokenAvatar
                  symbol={receiveSymbol}
                  ledgerId={receiveLedgerId}
                  logoUrl={receiveLogoUrl}
                  className="size-3.5"
                />
                <span>{receiveSymbol}</span>
              </span>
            </>
          ) : (
            "—"
          )}
        </div>
      </div>
      <Popover>
        <PopoverTrigger
          aria-label={t("youReceive")}
          className="inline-flex size-7 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
        >
          <HugeiconsIcon icon={InformationCircleIcon} className="size-4" strokeWidth={1.75} />
        </PopoverTrigger>
        <PopoverContent align="end" className="w-56 gap-2 p-3">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">{t("takerFee")}</span>
            <span className="font-medium text-foreground">0.15% ({t("taker")})</span>
          </div>
          {quote ? (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">{t("poolFee")}</span>
              <span className="inline-flex items-center gap-1 tabular-nums font-medium text-foreground">
                <span>{formatTokenAmount(quote.swapFee, payDecimals)}</span>
                <TokenAvatar
                  symbol={paySymbol}
                  ledgerId={payLedgerId}
                  logoUrl={payLogoUrl}
                  className="size-3"
                />
                <span>{paySymbol}</span>
              </span>
            </div>
          ) : null}
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">{t("slippage")}</span>
            <span className="font-medium text-foreground">{slippagePct}%</span>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
