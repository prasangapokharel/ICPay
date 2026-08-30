"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { useAuth } from "@/components/auth/auth-provider"
import { TradeForm, type TradeSuccess } from "@/components/trade/trade-form"
import { TradeSuccessView } from "@/components/trade/trade-success"
import { useApplyTradeBalances } from "@/hooks/trade/useTrade"

export default function TradePage() {
  const t = useTranslations("trade")
  const { identity } = useAuth()
  const applyTradeBalances = useApplyTradeBalances()
  const params = useSearchParams()
  const [done, setDone] = useState<TradeSuccess | null>(null)

  const from = params.get("from")
  const to = params.get("to")

  if (done) {
    return (
      <TradeSuccessView
        amountIn={done.amountIn}
        amountOut={done.amountOut}
        tokenIn={done.tokenIn}
        tokenOut={done.tokenOut}
        beforeIn={done.beforeIn}
        beforeOut={done.beforeOut}
        onDone={() => setDone(null)}
      />
    )
  }

  return (
    <div className="space-y-6 pt-2">
      <div>
        <h1 className="text-xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>
      <TradeForm
        identity={identity}
        initialTokenIn={from}
        initialTokenOut={to}
        onSuccess={(result) => {
          applyTradeBalances({
            tokenInId: result.tokenIn.ledgerId,
            tokenOutId: result.tokenOut.ledgerId,
            amountIn: result.amountIn,
            amountOut: result.amountOut,
            tokenInFee: result.tokenIn.fee,
          })
          setDone(result)
        }}
      />
    </div>
  )
}
