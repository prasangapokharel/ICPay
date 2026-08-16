"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { useAuth } from "@/components/auth/auth-provider"
import { SwapForm, type SwapSuccess } from "@/components/swap/swap-form"
import { SwapSuccessView } from "@/components/swap/swap-success"
import { useRefreshWallet } from "@/hooks/use-wallet-data"

export default function SwapPage() {
  const t = useTranslations("swap")
  const { identity } = useAuth()
  const refreshWallet = useRefreshWallet()
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
          refreshWallet()
          setDone(result)
        }}
      />
    </div>
  )
}
