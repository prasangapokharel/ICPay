"use client"

import { useTranslations } from "next-intl"
import { IcpayTokenCard } from "@/components/icpay/icpay-token-card"

export default function IcpayTokenPage() {
  const t = useTranslations("icpayToken")

  return (
    <div className="space-y-4 pt-2">
      <div>
        <h1 className="text-xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>
      <IcpayTokenCard />
    </div>
  )
}
