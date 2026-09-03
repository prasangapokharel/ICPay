"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { E8S } from "@/lib/wallet/utils"
import { useIcpPrice } from "@/hooks/market/useIcpPrice"
import { useTokenHoldings } from "@/hooks/wallet/useWalletData"
import { useCustomLedgerIds } from "@/hooks/wallet/useCustomLedgerIds"
import { useTokenPrices } from "@/hooks/market/useTokenPrices"
import { useAuth } from "@/components/auth/auth-provider"
import { ICP_LEDGER_ID } from "@/services/tokens"
import { AssetTable } from "@/components/wallet/asset-table"
import { WalletOverviewCard } from "@/components/wallet/wallet-overview-card"
import { AppPage } from "@/components/layout/dashboard/app-page"

export default function WalletPage() {
  const t = useTranslations("wallet")
  const { identity } = useAuth()
  const principal = identity?.getPrincipal().toText()
  const { ids: customIds, add: addCustomId } = useCustomLedgerIds(principal)
  const { holdings, isLoading: holdingsLoading, refresh } = useTokenHoldings(customIds)
  const { price } = useIcpPrice()

  const nonIcpLedgerIds = useMemo(
    () => holdings.filter((h) => h.ledgerId !== ICP_LEDGER_ID).map((h) => h.ledgerId),
    [holdings]
  )
  const { prices } = useTokenPrices(nonIcpLedgerIds)

  const totalUsdValue = useMemo(() => {
    let total = 0
    let hasAny = false

    for (const h of holdings) {
      if (h.ledgerId === ICP_LEDGER_ID) {
        if (price) {
          total += (Number(h.balance) / Number(E8S)) * price.usd
          hasAny = true
        }
        continue
      }
      const tokenPrice = prices.get(h.ledgerId)
      if (tokenPrice) {
        const human = Number(h.balance) / 10 ** h.decimals
        total += human * tokenPrice.priceUsd
        hasAny = true
      }
    }

    return hasAny ? total : null
  }, [holdings, price, prices])

  const totalIcpValue = useMemo(() => {
    if (totalUsdValue === null || !price || price.usd <= 0) return null
    return totalUsdValue / price.usd
  }, [totalUsdValue, price])

  const existingLedgerIds = useMemo(
    () => [...new Set([...holdings.map((h) => h.ledgerId), ...customIds])],
    [holdings, customIds]
  )

  return (
    <AppPage title={t("title")} description={t("subtitle")}>
      <div className="space-y-6">
        <WalletOverviewCard
          totalUsdValue={totalUsdValue}
          totalIcpValue={totalIcpValue}
          loading={holdingsLoading && holdings.length === 0}
        />

        <AssetTable
          holdings={holdings}
          isLoading={holdingsLoading}
          existingLedgerIds={existingLedgerIds}
          onAddCustom={(ledgerId, meta) => {
            addCustomId(ledgerId, meta)
            void refresh()
          }}
        />
      </div>
    </AppPage>
  )
}
