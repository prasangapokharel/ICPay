"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { Money01Icon } from "@hugeicons/core-free-icons"
import { formatAmount, E8S } from "@/lib/wallet-utils"
import { useIcpPrice } from "@/lib/use-icp-price"
import { useFiatValue } from "@/lib/fiat/use-fiat-value"
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
      <Card className="bg-primary text-primary-foreground">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium tracking-wide text-primary-foreground/80">
            {t("icpBalance")}
          </CardTitle>
          <HugeiconsIcon icon={Money01Icon} className="h-4 w-4 opacity-80" />
        </CardHeader>
        <CardContent className="space-y-1">
          {/* The card owns its own loading state now. Gating the whole page on
              the balance would put every section behind the slowest one, which
              is what made the wallet look empty for seconds after a refresh. */}
          {liveBalance === undefined ? (
            <Skeleton className="h-9 w-40 bg-primary-foreground/20" />
          ) : (
            <div className="text-3xl font-extrabold tracking-tight tabular-nums">
              {formatAmount(liveBalance)}{" "}
              <span className="text-lg font-semibold">ICP</span>
            </div>
          )}
          <p className="text-xs font-medium text-primary-foreground/70">
            {fiat.formatted === null
              ? "\u00a0"
              : `≈ ${fiat.symbol}${fiat.formatted} ${fiat.currency}`}
          </p>
        </CardContent>
      </Card>
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
