"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { formatAmount, E8S } from "@/lib/wallet-utils"
import { useIcpPrice } from "@/hooks/use-icp-price"
import { useFiatValue } from "@/hooks/use-fiat-value"
import { useTokenHoldings, useSelfCustodyPinned } from "@/hooks/use-wallet-data"
import { ICP_LEDGER_ID } from "@/services/tokens"
import { TokenList } from "@/components/wallet/token-list"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function WalletPage() {
  const t = useTranslations("wallet")
  const { holdings, isLoading: holdingsLoading } = useTokenHoldings()
  const selfCustody = useSelfCustodyPinned()

  // Only worth flagging when the amount actually exceeds the fee, since anything
  // below it cannot be moved and the notice would be a dead end.
  const hasOutside = holdings.some(
    (h) => (selfCustody?.get(h.ledgerId) ?? 0n) > h.fee
  )
  // Read out of the sweep this page already runs rather than through
  // useLiveBalance: that hook keys its own SWR entry, so ICP was fetched twice in
  // parallel on every visit. ICP is pinned, so the row is always present.
  const liveBalance = holdings.find((h) => h.ledgerId === ICP_LEDGER_ID)?.balance
  const { price } = useIcpPrice()

  // A zero balance is "worth nothing", not "worthless": a fraction of a cent
  // keeps extra precision so it does not collapse to "$0.00" and read as empty.
  const usd = price ? (Number(liveBalance ?? 0n) / Number(E8S)) * price.usd : null
  // Quoted in the currency chosen in settings, not always dollars.
  const fiat = useFiatValue(usd)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* ICP balance, styled as a physical card: metallic chip, glass ICP pill,
          embossed amount, glass fiat pill in the footer. */}
      <div className="relative rounded-3xl bg-primary p-5 text-primary-foreground shadow-lg">
        <div className="relative z-10 flex items-center justify-between">
          <span className="relative flex h-7 w-9 overflow-hidden rounded-md bg-gradient-to-br from-amber-200 via-yellow-300 to-amber-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),inset_0_-1px_2px_rgba(120,80,10,0.4),0_1px_2px_rgba(0,0,0,0.25)]">
            <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-amber-800/30" />
            <span className="absolute inset-y-0 left-1/3 w-px bg-amber-800/30" />
            <span className="absolute inset-y-0 left-2/3 w-px bg-amber-800/30" />
            <span className="absolute left-0 top-1/2 h-2.5 w-full -translate-y-1/2 rounded-[2px] border border-amber-800/25" />
          </span>

          <span className="liquid-glass-primary flex items-center gap-1.5 rounded-full px-3 py-1.5">
            <Image src="/images/logo/logo.png" alt="ICP" width={16} height={16} className="size-4" />
            <span className="text-[11px] font-semibold tracking-wide">
              {t("icpBalance")}
            </span>
          </span>
        </div>

        <div className="relative z-10 mt-8">
          {/* The card owns its own loading state. Gating the whole page on the
              balance would put every section behind the slowest one, which is
              what made the wallet look empty for seconds after a refresh. */}
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

        <div className="relative z-10 mt-6 flex items-end justify-between">
          <span className="liquid-glass-primary rounded-full px-2.5 py-1 text-sm font-medium tabular-nums">
            {fiat.formatted === null
              ? "\u00a0"
              : `≈ ${fiat.symbol}${fiat.formatted} ${fiat.currency}`}
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-primary-foreground/40">
            Internet Computer
          </span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">{t("tokens")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {hasOutside && (
            <Alert>
              <AlertDescription>{t("selfCustodyNotice")}</AlertDescription>
            </Alert>
          )}
          <TokenList holdings={holdings} isLoading={holdingsLoading} outside={selfCustody} />
        </CardContent>
      </Card>
    </div>
  )
}