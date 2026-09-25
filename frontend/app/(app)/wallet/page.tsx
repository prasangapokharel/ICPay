"use client"

import { useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { E8S } from "@/lib/wallet/utils"
import { useIcpPrice } from "@/hooks/market/useIcpPrice"
import { useTokenHoldings } from "@/hooks/wallet/useWalletData"
import { useCustomLedgerIds } from "@/hooks/wallet/useCustomLedgerIds"
import { useAuth } from "@/components/auth/auth-provider"
import { ICP_LEDGER_ID, type TokenHolding } from "@/services/tokens"
import { TokenList } from "@/components/wallet/token-list"
import { WalletBalanceCard } from "@/components/wallet/wallet-balance-card"
import { TokenDetailDrawer } from "@/components/wallet/token-detail-drawer"
import { AppPage } from "@/components/layout/dashboard/app-page"

export default function WalletPage() {
  const t = useTranslations("wallet")
  const searchParams = useSearchParams()
  const { identity } = useAuth()
  const principal = identity?.getPrincipal().toText()
  const { ids: customIds, add: addCustomId } = useCustomLedgerIds(principal)
  const { holdings, isLoading: holdingsLoading, refresh } = useTokenHoldings(customIds)
  const liveBalance = holdings.find((h) => h.ledgerId === ICP_LEDGER_ID)?.balance
  const { price } = useIcpPrice()
  const usd = price ? (Number(liveBalance ?? 0n) / Number(E8S)) * price.usd : null

  const [selectedToken, setSelectedToken] = useState<TokenHolding | null>(null)
  const [closedManually, setClosedManually] = useState(false)

  const tokenQuery = searchParams.get("token")
  const activeToken = useMemo(() => {
    if (selectedToken) return selectedToken
    if (!closedManually && tokenQuery && holdings.length > 0) {
      return holdings.find((h) => h.ledgerId === tokenQuery) ?? null
    }
    return null
  }, [selectedToken, closedManually, tokenQuery, holdings])

  const drawerOpen = activeToken !== null

  const handleSelectToken = (token: TokenHolding) => {
    setClosedManually(false)
    setSelectedToken(token)
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `/wallet?token=${token.ledgerId}`)
    }
  }

  const handleDrawerChange = (open: boolean) => {
    if (!open) {
      setClosedManually(true)
      setSelectedToken(null)
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", "/wallet")
      }
    }
  }

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
        onSelectToken={handleSelectToken}
        onAddCustom={(ledgerId, meta) => {
          addCustomId(ledgerId, meta)
          void refresh()
        }}
      />

      <TokenDetailDrawer
        open={drawerOpen}
        onOpenChange={handleDrawerChange}
        token={selectedToken}
      />
    </AppPage>
  )
}

