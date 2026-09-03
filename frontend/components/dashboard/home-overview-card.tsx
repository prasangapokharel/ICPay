"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { IcpPrice } from "@/lib/market/icpPrice"
import { useFiatValue } from "@/hooks/fiat/useFiatValue"
import { HugeiconsIcon } from "@hugeicons/react"
import { ViewOffIcon, ViewIcon } from "@hugeicons/core-free-icons"
import type { UserPublic } from "@/services/types"
import { WalletOverviewIdentity } from "@/components/dashboard/wallet-overview-identity"

const E8S = 100_000_000

type HomeOverviewCardProps = {
  balance: string
  balanceE8s: bigint
  price: IcpPrice | null
  hidden: boolean
  onToggleHidden: () => void
  user: UserPublic
}

export function HomeOverviewCard({
  balance,
  balanceE8s,
  price,
  hidden,
  onToggleHidden,
  user,
}: HomeOverviewCardProps) {
  const tWallet = useTranslations("wallet")
  const t = useTranslations("dashboard")
  const username = user.username?.[0]
  const socialLinks = user.socialLinks?.[0] ?? []
  const usdValue = price ? (Number(balanceE8s) / E8S) * price.usd : null
  const fiat = useFiatValue(usdValue)

  return (
    <Card className="hidden md:flex">
      <CardHeader className="space-y-4 border-b">
        <WalletOverviewIdentity
          username={username}
          displayName={user.displayName}
          userId={user.id}
          socialLinks={socialLinks}
        />
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-muted-foreground">{tWallet("estimatedValue")}</p>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggleHidden}
            aria-label={hidden ? t("showBalance") : t("hideBalance")}
          >
            <HugeiconsIcon icon={hidden ? ViewOffIcon : ViewIcon} className="size-4" strokeWidth={1.75} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div>
          <p className="text-4xl font-semibold tracking-tight tabular-nums">
            {hidden ? "•• •••• ••••" : balance}
            <span className="ml-2 text-lg font-medium text-muted-foreground">ICP</span>
          </p>
          <p className="mt-1.5 text-base font-medium tabular-nums text-foreground/80">
            {hidden || !fiat.formatted ? "••••" : `≈ ${fiat.symbol} ${fiat.formatted}`}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
