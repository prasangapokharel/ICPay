"use client"

import { useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { BalanceCard } from "@/components/dashboard/balance-card"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { UsernamePrompt } from "@/components/dashboard/username-prompt"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
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
      />

      <div className="grid grid-cols-2 gap-3">
        <ActionButton href="/transfer" label={t("common.send")} icon={ArrowUpRight01Icon} primary />
        <ActionButton href="/deposit" label={t("common.receive")} icon={Download01Icon} primary />
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
    <Button
      variant={primary ? "default" : "outline"}
      nativeButton={false}
      render={<Link href={href} />}
      className={
        primary
          ? "h-12 font-semibold shadow-sm shadow-primary/25"
          : "h-12 bg-background font-semibold shadow-sm"
      }
    >
      <HugeiconsIcon icon={icon} className="size-4" />
      {label}
    </Button>
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
