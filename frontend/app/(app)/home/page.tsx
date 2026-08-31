"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { BalanceCard } from "@/components/dashboard/balance-card"
import { DashboardActions } from "@/components/dashboard/dashboard-actions"
import { HomeHoldingsCard } from "@/components/dashboard/home-holdings-card"
import { HomeOverviewCard } from "@/components/dashboard/home-overview-card"
import { HomeRecentCard } from "@/components/dashboard/home-recent-card"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { UsernamePrompt } from "@/components/dashboard/username-prompt"
import { AppPage } from "@/components/layout/dashboard/app-page"
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
      <AppPage>
        <Alert variant="destructive">
          <AlertDescription>
            {error instanceof Error ? error.message : t("dashboard.loadFailed")}
          </AlertDescription>
        </Alert>
      </AppPage>
    )
  }

  if (!data) return null

  const balance = formatE8s(liveBalance ?? 0n)
  const username = data.user.username?.[0]

  return (
    <AppPage>
      <UsernamePrompt username={username} />

      <div className="space-y-6 md:hidden">
        <BalanceCard
          balance={balance}
          balanceE8s={liveBalance ?? 0n}
          price={price}
          hidden={hidden}
          onToggleHidden={() => setHidden((v) => !v)}
          username={username}
        />
        <DashboardActions />
        <RecentTransactions transactions={data.recentTransactions} />
      </div>

      <div className="hidden gap-6 md:grid md:grid-cols-3">
        <div className="col-span-2 space-y-6">
          <HomeOverviewCard
            balance={balance}
            balanceE8s={liveBalance ?? 0n}
            price={price}
            hidden={hidden}
            onToggleHidden={() => setHidden((v) => !v)}
            username={username}
          />
          <HomeHoldingsCard />
        </div>
        <div className="space-y-6">
          <DashboardActions />
          <HomeRecentCard transactions={data.recentTransactions} />
        </div>
      </div>
    </AppPage>
  )
}

function DashboardSkeleton() {
  return (
    <AppPage>
      <div className="space-y-6 md:hidden">
        <Skeleton className="h-40 w-full rounded-3xl" />
        <div className="flex justify-around px-6">
          <Skeleton className="size-11 rounded-full" />
          <Skeleton className="size-11 rounded-full" />
          <Skeleton className="size-11 rounded-full" />
        </div>
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
      <div className="hidden gap-6 md:grid md:grid-cols-3">
        <Skeleton className="col-span-2 h-56 rounded-2xl" />
        <div className="space-y-6">
          <Skeleton className="h-44 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
        <Skeleton className="col-span-2 h-56 rounded-2xl" />
      </div>
    </AppPage>
  )
}
