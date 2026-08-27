"use client"

import { useTranslations } from "next-intl"
import { Spinner } from "@/components/ui/spinner"
import { useIcpayStats } from "@/hooks/icpay/useIcpayStats"
import { IcpayTokenCard } from "@/components/icpay/icpay-token-card"

export default function IcpayTokenPage() {
  const t = useTranslations("icpayToken")
  const { stats, isLoading } = useIcpayStats()

  if (isLoading && !stats) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pt-2">
      <div>
        <h1 className="text-xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>
      <IcpayTokenCard />
    </div>
  )
}
