"use client"

import { useState } from "react"
import Link from "next/link"
import { BalanceCard } from "@/components/dashboard/balance-card"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { UsernamePrompt } from "@/components/dashboard/username-prompt"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import { ArrowUpRight01Icon, Download01Icon } from "@hugeicons/core-free-icons"
import { formatE8s } from "@/lib/wallet-utils"
import { useIcpPrice } from "@/lib/use-icp-price"
import { useDashboard, useLiveBalance } from "@/hooks/use-wallet-data"

export default function DashboardPage() {
  const { price } = useIcpPrice()
  const { data, error, isLoading } = useDashboard()
  const liveBalance = useLiveBalance()
  const [hidden, setHidden] = useState(false)

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
      <UsernamePrompt username={data.user.username?.[0]} />
      <BalanceCard
        balance={formatE8s(liveBalance ?? data.icpBalance)}
        balanceE8s={liveBalance ?? data.icpBalance}
        price={price}
        hidden={hidden}
        onToggleHidden={() => setHidden((v) => !v)}
      />

      <div className="grid grid-cols-2 gap-3">
        <ActionButton href="/transfer" label="Send" icon={ArrowUpRight01Icon} primary />
        <ActionButton href="/deposit" label="Receive" icon={Download01Icon} primary />
      </div>

      <RecentTransactions transactions={data.recentTransactions} />
    </div>
  )
}

function ActionButton({
  href,
  label,
  icon,
  primary,
}: {
  href: string
  label: string
  icon: IconSvgElement
  primary?: boolean
}) {
  return (
    <Link
      href={href}
      className={
        primary
          ? "flex h-12 items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/25 transition-all hover:bg-primary/90 active:scale-95"
          : "flex h-12 items-center justify-center gap-2 rounded-full border border-border bg-background text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-accent active:scale-95"
      }
    >
      <HugeiconsIcon icon={icon} className="size-4" />
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
