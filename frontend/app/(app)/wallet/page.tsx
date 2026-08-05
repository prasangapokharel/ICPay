"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { Money01Icon } from "@hugeicons/core-free-icons"
import { formatAmount, E8S } from "@/lib/wallet-utils"
import { useIcpPrice } from "@/lib/use-icp-price"
import { useFiatValue } from "@/lib/fiat/use-fiat-value"
import {
  useDashboard,
  useTokenHoldings,
  useLiveBalance,
  useSelfCustodyPinned,
} from "@/hooks/use-wallet-data"
import { TokenList } from "@/components/wallet/token-list"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function WalletPage() {
  const t = useTranslations("wallet")
  const tc = useTranslations("common")
  // Shares the dashboard cache instead of calling getDashboard again: that is a
  // ~6.6s update call, and it already ran on the page the user came from.
  const { data, isLoading } = useDashboard()
  const { holdings, isLoading: holdingsLoading } = useTokenHoldings()
  const selfCustody = useSelfCustodyPinned()

  // Only worth flagging when the amount actually exceeds the fee, since anything
  // below it cannot be moved and the notice would be a dead end.
  const hasOutside = holdings.some(
    (h) => (selfCustody?.get(h.ledgerId) ?? 0n) > h.fee
  )
  const liveBalance = useLiveBalance()
  const { price } = useIcpPrice()

  // A zero balance is "worth nothing", not "worthless": a fraction of a cent
  // keeps extra precision so it does not collapse to "$0.00" and read as empty.
  const usd = price ? (Number(liveBalance ?? 0n) / Number(E8S)) * price.usd : null
  // Quoted in the currency chosen in settings, not always dollars. Placed above
  // the early returns below: it is a hook and cannot run conditionally.
  const fiat = useFiatValue(usd)

  if (isLoading && !data) return <div className="flex justify-center py-12"><p className="text-muted-foreground">{tc("loading")}</p></div>
  if (!data) return null

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
          <div className="text-3xl font-extrabold tracking-tight tabular-nums">
            {formatAmount(liveBalance ?? 0n)}{" "}
            <span className="text-lg font-semibold">ICP</span>
          </div>
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
          <TokenList holdings={holdings} isLoading={holdingsLoading} />
        </CardContent>
      </Card>
    </div>
  )
}
