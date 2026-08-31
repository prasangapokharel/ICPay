"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { useAuth } from "@/components/auth/auth-provider"
import { TradeForm, type TradeSuccess } from "@/components/trade/trade-form"
import { TradeSuccessView } from "@/components/trade/trade-success"
import { useApplyTradeBalances } from "@/hooks/trade/useTrade"
import { AppPage } from "@/components/layout/dashboard/app-page"
import { Skeleton } from "@/components/ui/skeleton"

function TradePageContent() {
  const t = useTranslations("trade")
  const { identity } = useAuth()
  const applyTradeBalances = useApplyTradeBalances()
  const params = useSearchParams()
  const [done, setDone] = useState<TradeSuccess | null>(null)

  const from = params.get("from")
  const to = params.get("to")

  if (done) {
    return (
      <AppPage>
        <div className="mx-auto w-full max-w-md">
          <TradeSuccessView
            amountIn={done.amountIn}
            amountOut={done.amountOut}
            tokenIn={done.tokenIn}
            tokenOut={done.tokenOut}
            beforeIn={done.beforeIn}
            beforeOut={done.beforeOut}
            onDone={() => setDone(null)}
          />
        </div>
      </AppPage>
    )
  }

  return (
    <AppPage title={t("title")} description={t("subtitle")}>
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
          })
          setDone(result)
        }}
      />
    </AppPage>
  )
}

function TradePageFallback() {
  return (
    <AppPage>
      <div className="mx-auto w-full max-w-md space-y-4">
        <Skeleton className="h-44 w-full rounded-3xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-12 w-full rounded-full" />
      </div>
    </AppPage>
  )
}

export default function TradePage() {
  return (
    <Suspense fallback={<TradePageFallback />}>
      <TradePageContent />
    </Suspense>
  )
}
