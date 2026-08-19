"use client"

import { useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/auth-provider"
import { useIcpaySale } from "@/hooks/icpay/useIcpaySale"
import { BuyIcpayDrawer } from "@/components/icpay/buy-icpay-drawer"
import { PresaleStatsPanel } from "@/components/icpay/presale-stats-panel"

export function IcpayPresaleCard({ symbol }: { symbol: string }) {
  const t = useTranslations("buyIcpay")
  const { identity } = useAuth()
  const { sale, isLoading } = useIcpaySale()
  const [buyOpen, setBuyOpen] = useState(false)

  return (
    <section className="space-y-4">
      <PresaleStatsPanel
        sale={sale}
        symbol={symbol}
        isLoading={isLoading}
        progressLabel={(percent) => t("progress", { percent })}
        remainingLabel={(amount, sym) => t("remaining", { amount, symbol: sym })}
        raisedLabel={(icp) => t("raised", { icp })}
        inactiveLabel={t("soldOut")}
      />

      {identity ? (
        <Button className="w-full" disabled={!sale?.active} onClick={() => setBuyOpen(true)}>
          {sale?.active ? t("openBuy") : t("soldOut")}
        </Button>
      ) : (
        <Button className="w-full" nativeButton={false} render={<Link href="/login" />}>
          {t("loginToBuy")}
        </Button>
      )}

      <BuyIcpayDrawer open={buyOpen} onOpenChange={setBuyOpen} symbol={symbol} />
    </section>
  )
}
