"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon, ViewIcon, ViewOffIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Skeleton } from "@/components/ui/skeleton"
import { useFiatValue } from "@/hooks/fiat/useFiatValue"
import { useFiatCurrency } from "@/components/fiat/fiat-provider"
import { CURRENCIES, type FiatCurrency } from "@/lib/fiat/config"
import { formatAmount } from "@/lib/wallet/utils"
import { cn } from "@/lib/ui/utils"

type WalletBalanceCardProps = {
  balance?: bigint
  usdValue: number | null
}

export function WalletBalanceCard({ balance, usdValue }: WalletBalanceCardProps) {
  const tDashboard = useTranslations("dashboard")
  const tFiat = useTranslations("fiat")
  const [hidden, setHidden] = useState(false)
  const fiat = useFiatValue(usdValue)
  const { currency, setCurrency } = useFiatCurrency()
  const loading = balance === undefined

  return (
    <div className="rounded-3xl bg-primary p-4 text-primary-foreground sm:p-5">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary-foreground/45">
          Internet Computer
        </p>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setHidden((v) => !v)}
          aria-label={hidden ? tDashboard("showBalance") : tDashboard("hideBalance")}
          className="shrink-0 text-primary-foreground/70 hover:bg-primary-foreground/15 hover:text-primary-foreground"
        >
          <HugeiconsIcon icon={hidden ? ViewOffIcon : ViewIcon} className="size-4" strokeWidth={1.75} />
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {loading ? (
          <Skeleton className="h-9 w-40 bg-primary-foreground/20" />
        ) : (
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-[clamp(1.65rem,8vw,2.5rem)] font-semibold leading-none tracking-tight tabular-nums">
              {hidden ? "••••••" : formatAmount(balance)}
            </span>
            <span className="text-sm font-medium text-primary-foreground/70">ICP</span>
          </div>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger
            disabled={loading}
            className={cn(
              "liquid-glass-primary inline-flex max-w-full items-center gap-1 rounded-full px-2.5 py-1 text-sm font-medium tabular-nums cursor-pointer",
              "text-primary-foreground/90 outline-none transition-colors",
              "hover:bg-primary-foreground/15 focus-visible:ring-2 focus-visible:ring-primary-foreground/30",
              "disabled:pointer-events-none disabled:opacity-60"
            )}
            aria-label={tFiat("select")}
          >
            <span className="truncate">
              {hidden || fiat.formatted === null ? "••••" : `≈ ${fiat.symbol}${fiat.formatted}`}
            </span>
            <HugeiconsIcon icon={ArrowDown01Icon} className="size-3.5 shrink-0 opacity-70" strokeWidth={2} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 max-h-72 overflow-y-auto p-1">
            <DropdownMenuGroup>
              <DropdownMenuRadioGroup
                value={currency}
                onValueChange={(value) => setCurrency(value as FiatCurrency)}
              >
                {CURRENCIES.map((item) => (
                  <DropdownMenuRadioItem
                    key={item.code}
                    value={item.code}
                    className="cursor-pointer rounded-xl py-1.5 pl-2.5 pr-8"
                  >
                    <Item size="xs" className="w-full gap-2.5 border-0 bg-transparent p-0">
                      <ItemMedia>
                        <span className="flex size-6.5 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-muted/60 text-xs font-semibold text-foreground">
                          {item.symbol}
                        </span>
                      </ItemMedia>
                      <ItemContent className="min-w-0 flex-1 gap-0 text-left">
                        <ItemTitle className="truncate text-xs font-medium text-foreground leading-tight">
                          {item.label}
                        </ItemTitle>
                        <ItemDescription className="text-[10px] font-mono text-muted-foreground leading-tight">
                          {item.code}
                        </ItemDescription>
                      </ItemContent>
                    </Item>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
