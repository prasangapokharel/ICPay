"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { Money01Icon } from "@hugeicons/core-free-icons"
import { getWalletActor } from "@/services/wallet"
import { formatAmount, formatE8s } from "@/lib/wallet-utils"
import { useAuth } from "@/components/auth/auth-provider"
import type { DashboardData } from "@/services/types"

export default function WalletPage() {
  const { identity } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!identity) return
      try {
        const actor = await getWalletActor(identity)
        const result = await actor.getDashboard()
        if ("ok" in result) setData(result.ok)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [identity])

  if (loading) return <div className="flex justify-center py-12"><p className="text-muted-foreground">Loading...</p></div>
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
          <div className="text-4xl font-bold tracking-tight">{formatE8s(data.icpBalance)}</div>
          <p className="mt-1 text-sm text-primary-foreground/70">ICP</p>
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
