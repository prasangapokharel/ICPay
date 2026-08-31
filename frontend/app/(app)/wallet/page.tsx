"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { formatAmount, E8S } from "@/lib/wallet/utils"
import { useIcpPrice } from "@/hooks/market/useIcpPrice"
import { useFiatValue } from "@/hooks/fiat/useFiatValue"
import { useTokenHoldings } from "@/hooks/wallet/useWalletData"
import { useCustomLedgerIds } from "@/hooks/wallet/useCustomLedgerIds"
import { useAuth } from "@/components/auth/auth-provider"
import { ICP_LEDGER_ID } from "@/services/tokens"
import { ICP_LOGO } from "@/lib/token/icon"
import { TokenList } from "@/components/wallet/token-list"
import { Skeleton } from "@/components/ui/skeleton"
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
  const fiat = useFiatValue(usd)

  const existingLedgerIds = useMemo(
    () => [...new Set([...holdings.map((h) => h.ledgerId), ...customIds])],
    [holdings, customIds]
  )

  return (
    <AppPage title={t("title")} description={t("subtitle")}>
      <div className="relative overflow-hidden rounded-3xl bg-primary p-5 text-primary-foreground shadow-lg sm:p-6">
        <div className="relative z-10 flex justify-end">
          <span className="liquid-glass-primary flex items-center gap-1.5 rounded-full px-3 py-1.5">
            <Image src={ICP_LOGO} alt="ICP" width={16} height={16} className="size-4" />
            <span className="text-[11px] font-semibold tracking-wide">{t("icpBalance")}</span>
          </span>
        </div>

        <div className="relative z-10 mt-4">
          {liveBalance === undefined ? (
            <Skeleton className="h-10 w-44 bg-primary-foreground/20" />
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-[clamp(1.75rem,9vw,2.75rem)] font-semibold leading-tight tracking-tight tabular-nums">
                {formatAmount(liveBalance)}
              </span>
              <span className="text-sm font-medium text-primary-foreground/60">ICP</span>
            </div>
          )}
        </div>

        <div className="relative z-10 mt-4 flex items-end justify-between gap-3">
          <span className="liquid-glass-primary rounded-full px-2.5 py-1 text-sm font-medium tabular-nums">
            {fiat.formatted === null ? "\u00a0" : `≈ ${fiat.symbol}${fiat.formatted} ${fiat.currency}`}
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-primary-foreground/40">
            Internet Computer
          </span>
        </div>
      </div>

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
