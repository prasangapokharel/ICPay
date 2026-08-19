"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { useAuth } from "@/components/auth/auth-provider"
import { SwapForm, type SwapSuccess } from "@/components/swap/swap-form"
import { SwapSuccessView } from "@/components/swap/swap-success"
import { useApplySwapBalances } from "@/hooks/wallet/useWalletData"

export default function SwapPage() {
  const t = useTranslations("swap")
  const { identity } = useAuth()
  const applySwapBalances = useApplySwapBalances()
  const params = useSearchParams()
  const [done, setDone] = useState<SwapSuccess | null>(null)

  const from = params.get("from")
  const to = params.get("to")

  if (done) {
    return (
      <SwapSuccessView
        amountIn={done.amountIn}
        amountOut={done.amountOut}
        tokenIn={done.tokenIn}
        tokenOut={done.tokenOut}
        blockIndex={done.blockIndex}
        beforeIn={done.beforeIn}
        beforeOut={done.beforeOut}
        icpFee={done.icpFee}
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
      <SwapForm
        identity={identity}
        initialTokenIn={from}
        initialTokenOut={to}
        onSuccess={(result) => {
          applySwapBalances({
            tokenInId: result.tokenIn.ledgerId,
            tokenOutId: result.tokenOut.ledgerId,
            amountIn: result.amountIn,
            amountOut: result.amountOut,
            tokenInFee: result.tokenIn.fee,
            icpFee: result.icpFee,
          })
          setDone(result)
        }}
      />
    </div>
  )
}
