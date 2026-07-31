"use client"

import { useState } from "react"
import Link from "next/link"
import { BalanceCard } from "@/components/dashboard/balance-card"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowDownToLine, ArrowUpRight } from "lucide-react"
import { formatE8s } from "@/lib/wallet-utils"
import { useIcpPrice } from "@/lib/use-icp-price"
import { useDashboard } from "@/hooks/use-wallet-data"

export default function DashboardPage() {
  const { price } = useIcpPrice()
  const { data, error, isLoading, refresh } = useDashboard()
  const [refreshing, setRefreshing] = useState(false)
  const [hidden, setHidden] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    await refresh()
    setRefreshing(false)
  }

  if (isLoading && !data) return <DashboardSkeleton />

  if (error && !data) {
    return (
      <div className="pt-6">
        <Alert variant="destructive">
          <AlertDescription>
            {error instanceof Error ? error.message : "Failed to load your wallet"}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6 pt-2">
      <BalanceCard
        balance={formatE8s(data.icpBalance)}
        balanceE8s={data.icpBalance}
        price={price}
        hidden={hidden}
        onToggleHidden={() => setHidden((v) => !v)}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      <div className="grid grid-cols-2 gap-3">
        <ActionButton href="/transfer" label="Send" icon={ArrowUpRight} primary />
        <ActionButton href="/deposit" label="Receive" icon={ArrowDownToLine} />
      </div>

      <RecentTransactions transactions={data.recentTransactions} />
    </div>
  )
}

function ActionButton({
  href,
  label,
  icon: Icon,
  primary,
}: {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  primary?: boolean
}) {
  return (
    <Link
      href={href}
      className={
        primary
          ? "flex h-12 items-center justify-center gap-2 rounded-full bg-primary text-sm font-medium text-primary-foreground transition-transform active:scale-95"
          : "flex h-12 items-center justify-center gap-2 rounded-full border bg-background text-sm font-medium transition-colors hover:bg-accent active:scale-95"
      }
    >
      <Icon className="size-4" />
      {label}
    </Link>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 pt-2">
      <Skeleton className="h-40 w-full rounded-3xl" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-12 rounded-full" />
        <Skeleton className="h-12 rounded-full" />
      </div>
      <Skeleton className="h-48 w-full rounded-2xl" />
    </div>
  )
}
