"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { Money01Icon } from "@hugeicons/core-free-icons"
import { formatAmount, formatE8s } from "@/lib/wallet-utils"
import { useDashboard, useTokenHoldings, useLiveBalance } from "@/hooks/use-wallet-data"
import { TokenList } from "@/components/wallet/token-list"

export default function WalletPage() {
  const t = useTranslations("wallet")
  const tc = useTranslations("common")
  // Shares the dashboard cache instead of calling getDashboard again: that is a
  // ~6.6s update call, and it already ran on the page the user came from.
  const { data, isLoading } = useDashboard()
  const { holdings, isLoading: holdingsLoading } = useTokenHoldings()
  const liveBalance = useLiveBalance()

  if (isLoading && !data) return <div className="flex justify-center py-12"><p className="text-muted-foreground">{tc("loading")}</p></div>
  if (!data) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>
      <Card className="bg-primary text-primary-foreground">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <HugeiconsIcon icon={Money01Icon} className="h-5 w-5" />
            {t("icpBalance")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold tracking-tight">{formatE8s(liveBalance ?? 0n)}</div>
          <p className="mt-1 text-sm text-primary-foreground/70">ICP</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">{t("tokens")}</CardTitle>
        </CardHeader>
        <CardContent>
          <TokenList holdings={holdings} isLoading={holdingsLoading} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">{t("accountDetails")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("username")}</span>
            <span className="font-mono">{data.user.username?.[0] ?? "─"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("principal")}</span>
            <span className="max-w-[200px] truncate font-mono text-xs">{data.principal.toText()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("displayName")}</span>
            <span>{data.user.displayName || "─"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("totalDeposits")}</span>
            <span className="font-mono">{formatAmount(data.totalDeposits)} ICP</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("totalWithdrawals")}</span>
            <span className="font-mono">{formatAmount(data.totalWithdrawals)} ICP</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("transfers")}</span>
            <span>{data.totalTransfers.toString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
