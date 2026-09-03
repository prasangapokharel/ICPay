"use client"

import { useEffect } from "react"
import { useTranslations } from "next-intl"
import { toast } from "@/components/ui/toast"
import { fillNoticeDescription } from "@/lib/market/fillNoticeCopy"
import { useTradeFillNotice } from "@/hooks/market/useTradeFills"

export function TradeFillAlert() {
  const t = useTranslations("marketTrade")
  const { notice, clear } = useTradeFillNotice()

  useEffect(() => {
    if (!notice) return
    const side = notice.isBuy ? t("swapBuy") : t("swapSell")
    toast.add({
      title: notice.kind === "filled" ? t("fillFilled") : t("fillFailed"),
      description: fillNoticeDescription({
        side,
        amount: notice.amount,
        decimals: notice.decimals,
        symbol: notice.symbol,
        at: notice.at,
      }),
      type: notice.kind === "filled" ? "success" : "error",
    })
    clear()
  }, [notice, clear, t])

  return null
}
