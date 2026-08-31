"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { E8S } from "@/lib/wallet/utils"
import { useIcpPrice } from "@/hooks/market/useIcpPrice"
import { useTokenHoldings } from "@/hooks/wallet/useWalletData"
import { useCustomLedgerIds } from "@/hooks/wallet/useCustomLedgerIds"
import { useAuth } from "@/components/auth/auth-provider"
import { ICP_LEDGER_ID } from "@/services/tokens"
import { TokenList } from "@/components/wallet/token-list"
import { WalletBalanceCard } from "@/components/wallet/wallet-balance-card"
import { AppPage } from "@/components/layout/dashboard/app-page"

export default function WalletPage() {
  const t = useTranslations("wallet")
  const { identity } = useAuth()
  const principal = identity?.getPrincipal().toText()
  const { ids: customIds, add: addCustomId } = useCustomLedgerIds(principal)
  const { holdings, isLoading: holdingsLoading, refresh } = useTokenHoldings(customIds)
  const liveBalance = holdings.find((h) => h.ledgerId === ICP_LEDGER_ID)?.balance
  const { price } = useIcpPrice()
  const usd = price ? (Number(liveBalance ?? 0n) / Number(E8S)) * price.usd : null

  const existingLedgerIds = useMemo(
    () => [...new Set([...holdings.map((h) => h.ledgerId), ...customIds])],
    [holdings, customIds]
  )

  return (
    <AppPage title={t("title")} description={t("subtitle")}>
      <WalletBalanceCard balance={liveBalance} usdValue={usd} />

      <TokenList
        holdings={holdings}
        isLoading={holdingsLoading}
        existingLedgerIds={existingLedgerIds}
        onAddCustom={(ledgerId, meta) => {
          addCustomId(ledgerId, meta)
          void refresh()
        }}
      />
    </AppPage>
  )
}
