"use client"

import { useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon, ViewIcon, ViewOffIcon } from "@hugeicons/core-free-icons"
import { MoreVerticalIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useFiatValue } from "@/hooks/fiat/useFiatValue"
import { useFiatCurrency } from "@/components/fiat/fiat-provider"
import { CURRENCIES, type FiatCurrency } from "@/lib/fiat/config"
import { cn } from "@/lib/ui/utils"

type WalletOverviewCardProps = {
  totalUsdValue: number | null
  totalIcpValue?: number | null
  loading?: boolean
}

export function WalletOverviewCard({
  totalUsdValue,
  totalIcpValue,
  loading,
}: WalletOverviewCardProps) {
  const t = useTranslations("wallet")
  const [hidden, setHidden] = useState(false)
  const fiat = useFiatValue(totalUsdValue)
  const { currency, setCurrency } = useFiatCurrency()

  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium text-muted-foreground">
              {t("totalValue")}
            </p>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setHidden((v) => !v)}
              className="size-6 text-muted-foreground hover:text-foreground"
            >
              <HugeiconsIcon
                icon={hidden ? ViewOffIcon : ViewIcon}
                className="size-3.5"
                strokeWidth={1.75}
              />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/deposit">
              <Button size="sm" variant="default">{t("deposit")}</Button>
            </Link>
            <Link href="/withdraw">
              <Button size="sm" variant="outline">{t("withdraw")}</Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  "inline-flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none",
                  "hover:bg-muted hover:text-foreground"
                )}
                aria-label={t("moreActions")}
              >
                <MoreVerticalIcon className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-44">
                <DropdownMenuItem render={<Link href="/transfer" />}>
                  {t("transfer")}
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/swap" />}>
                  {t("trade")}
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/transactions" />}>
                  {t("history")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {loading ? (
          <Skeleton className="mt-2 h-10 w-56" />
        ) : (
          <div className="mt-1">
            <DropdownMenu>
              <DropdownMenuTrigger
                disabled={loading}
                className={cn(
                  "group inline-flex items-center gap-1.5 outline-none",
                  "disabled:pointer-events-none disabled:opacity-60"
                )}
              >
                <h2 className="text-3xl font-bold tracking-tight tabular-nums">
                  {hidden
                    ? "••••••••"
                    : fiat.formatted === null
                      ? "$0.00"
                      : `${fiat.symbol}${fiat.formatted}`}
                </h2>
                <HugeiconsIcon
                  icon={ArrowDown01Icon}
                  className="size-4 text-muted-foreground transition-transform group-hover:text-foreground"
                  strokeWidth={2}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="max-h-64 min-w-44 overflow-y-auto">
                <DropdownMenuRadioGroup
                  value={currency}
                  onValueChange={(value) => setCurrency(value as FiatCurrency)}
                >
                  {CURRENCIES.map((item) => (
                    <DropdownMenuRadioItem key={item.code} value={item.code}>
                      <span className="w-5 text-center">{item.symbol}</span>
                      {item.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {!hidden && (
              <p className="mt-1.5 text-sm text-muted-foreground">
                ≈{" "}
                <span className="font-medium tabular-nums text-foreground">
                  {totalIcpValue !== null && totalIcpValue !== undefined
                    ? totalIcpValue.toFixed(4)
                    : "0.0000"}
                </span>{" "}
                ICP
              </p>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
