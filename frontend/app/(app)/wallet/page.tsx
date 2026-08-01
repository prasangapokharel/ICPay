"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { Money01Icon } from "@hugeicons/core-free-icons"
import { formatAmount, formatE8s } from "@/lib/wallet-utils"
import { useDashboard, useTokenHoldings, useLiveBalance } from "@/hooks/use-wallet-data"
import { TokenList } from "@/components/wallet/token-list"

export default function WalletPage() {
  // Shares the dashboard cache instead of calling getDashboard again: that is a
  // ~6.6s update call, and it already ran on the page the user came from.
  const { data, isLoading } = useDashboard()
  const { holdings, isLoading: holdingsLoading } = useTokenHoldings()
  const liveBalance = useLiveBalance()

  if (isLoading && !data) return <div className="flex justify-center py-12"><p className="text-muted-foreground">Loading...</p></div>
  if (!data) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Wallet</h1>
        <p className="text-sm text-muted-foreground">Your wallet overview</p>
      </div>
      <Card className="bg-primary text-primary-foreground">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <HugeiconsIcon icon={Money01Icon} className="h-5 w-5" />
            ICP Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold tracking-tight">{formatE8s(liveBalance ?? data.icpBalance)}</div>
          <p className="mt-1 text-sm text-primary-foreground/70">ICP</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          <TokenList holdings={holdings} isLoading={holdingsLoading} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Account Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Username</span>
            <span className="font-mono">{data.user.username?.[0] ?? "─"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Principal</span>
            <span className="max-w-[200px] truncate font-mono text-xs">{data.principal.toText()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Display Name</span>
            <span>{data.user.displayName || "─"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Deposits</span>
            <span className="font-mono">{formatAmount(data.totalDeposits)} ICP</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Withdrawals</span>
            <span className="font-mono">{formatAmount(data.totalWithdrawals)} ICP</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Transfers</span>
            <span>{data.totalTransfers.toString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
