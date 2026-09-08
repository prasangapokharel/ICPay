"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TokenLogo } from "@/components/token/token-logo"
import { formatTokenAmount } from "@/lib/wallet/utils"
import { useTokenHoldings } from "@/hooks/wallet/useWalletData"

export function HomeHoldingsCard() {
  const t = useTranslations("wallet")
  const tDash = useTranslations("dashboard")
  const { holdings, isLoading } = useTokenHoldings()
  const top = holdings.slice(0, 5)

  return (
    <Card className="hidden md:flex">
      <CardHeader className="border-b">
        <CardTitle>{t("tokens")}</CardTitle>
        <CardAction>
          <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/wallet" />}>
            {tDash("seeMore")}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading && top.length === 0 ? (
          <div className="space-y-3 p-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : top.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">{t("noTokens")}</p>
        ) : (
          <div className="divide-y">
            {top.map((token) => (
              <Link
                key={token.ledgerId}
                href={`/token/${token.ledgerId}`}
                className="flex items-center gap-3 px-6 py-3 transition-colors hover:bg-muted/50"
              >
                <TokenLogo token={token} className="size-9" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{token.symbol}</p>
                  <p className="truncate text-xs text-muted-foreground">{token.name}</p>
                </div>
                <p className="shrink-0 font-mono text-sm tabular-nums">
                  {formatTokenAmount(token.balance, token.decimals, 4)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
