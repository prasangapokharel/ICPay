"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { IcpPrice } from "@/lib/market/icpPrice"
import { useFiatValue } from "@/hooks/fiat/useFiatValue"
import { PremiumBadge } from "@/components/verifed/premium-badge"
import { HugeiconsIcon } from "@hugeicons/react"
import { ViewOffIcon, ViewIcon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/ui/utils"

const E8S = 100_000_000

type HomeOverviewCardProps = {
  balance: string
  balanceE8s: bigint
  price: IcpPrice | null
  hidden: boolean
  onToggleHidden: () => void
  username?: string
}

export function HomeOverviewCard({
  balance,
  balanceE8s,
  price,
  hidden,
  onToggleHidden,
  username,
}: HomeOverviewCardProps) {
  const t = useTranslations("dashboard")
  const tWallet = useTranslations("wallet")
  const tCommon = useTranslations("common")
  const usdValue = price ? (Number(balanceE8s) / E8S) * price.usd : null
  const fiat = useFiatValue(usdValue)

  return (
    <Card className="hidden md:flex">
      <CardHeader className="border-b">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{tWallet("subtitle")}</CardTitle>
            <CardDescription>{tWallet("tokens")}</CardDescription>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onToggleHidden} aria-label={hidden ? t("showBalance") : t("hideBalance")}>
            <HugeiconsIcon icon={hidden ? ViewOffIcon : ViewIcon} className="size-4" strokeWidth={1.75} />
          </Button>
        </div>
        {username ? (
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            @{username}
            <PremiumBadge name={username} className="size-3.5" />
          </p>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div>
          <p className="text-4xl font-semibold tracking-tight tabular-nums">
            {hidden ? "•• •••• ••••" : balance}
            <span className="ml-2 text-lg font-medium text-muted-foreground">ICP</span>
          </p>
          <div className="mt-1.5 flex items-center justify-between gap-2">
            <p className="text-base font-medium tabular-nums text-foreground/80">
              {hidden || !fiat.formatted ? "••••" : `≈ ${fiat.symbol} ${fiat.formatted}`}
            </p>
            {!hidden && price && price.change24h !== 0 && (
              <span
                className={cn(
                  "text-sm font-semibold tabular-nums",
                  price.change24h > 0 ? "text-green-600" : "text-red-600"
                )}
              >
                {price.change24h > 0 ? "+" : ""}
                {price.change24h.toFixed(2)}%
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button nativeButton={false} render={<Link href="/deposit" />}>
            {tCommon("receive")}
          </Button>
          <Button variant="outline" nativeButton={false} render={<Link href="/transfer" />}>
            {tCommon("send")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
