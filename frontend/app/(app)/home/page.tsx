"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { BalanceCard } from "@/components/dashboard/balance-card"
import { DashboardActions } from "@/components/dashboard/dashboard-actions"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { UsernamePrompt } from "@/components/dashboard/username-prompt"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatE8s } from "@/lib/wallet/utils"
import { useIcpPrice } from "@/hooks/market/useIcpPrice"
import { useDashboard, useLiveBalance } from "@/hooks/wallet/useWalletData"

export default function DashboardPage() {
  const { price } = useIcpPrice()
  const { data, error, isLoading } = useDashboard()
  const liveBalance = useLiveBalance()
  const [hidden, setHidden] = useState(false)
  const t = useTranslations()

  if (isLoading && !data) return <DashboardSkeleton />

  if (error && !data) {
    return (
      <div className="pt-6">
        <Alert variant="destructive">
          <AlertDescription>
            {error instanceof Error ? error.message : t("dashboard.loadFailed")}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6 pt-2">
      <UsernamePrompt username={data.user.username?.[0]} />
      <BalanceCard
        balance={formatE8s(liveBalance ?? 0n)}
        balanceE8s={liveBalance ?? 0n}
        price={price}
        hidden={hidden}
        onToggleHidden={() => setHidden((v) => !v)}
        username={data.user.username?.[0]}
      />

      <DashboardActions />

      <RecentTransactions transactions={data.recentTransactions} />
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 pt-2">
      <Skeleton className="h-40 w-full rounded-3xl" />
      <div className="flex justify-around px-6">
        <Skeleton className="size-11 rounded-full" />
        <Skeleton className="size-11 rounded-full" />
        <Skeleton className="size-11 rounded-full" />
      </div>
      <Skeleton className="h-48 w-full rounded-2xl" />
    </div>
  )
}
