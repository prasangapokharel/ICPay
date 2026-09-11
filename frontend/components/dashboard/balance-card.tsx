"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { EyeIcon, ViewOffIcon } from "@hugeicons/core-free-icons"
import { PremiumBadge } from "@/components/verifed/premium-badge"
import { cn } from "@/lib/ui/utils"
import type { IcpPrice } from "@/lib/market/icpPrice"
import { useFiatValue } from "@/hooks/fiat/useFiatValue"

/** Number of e8s (10^-8 ICP) in one whole ICP token. */
const E8S_PER_ICP = 100_000_000

type BalanceCardProps = {
  balance: string
  balanceE8s: bigint
  price: IcpPrice | null
  hidden: boolean
  onToggleHidden: () => void
  onRefreshPrice: () => Promise<void>
  username?: string
}

export function BalanceCard({
  balance,
  balanceE8s,
  price,
  hidden,
  onToggleHidden,
  onRefreshPrice,
  username,
}: BalanceCardProps) {
  const t = useTranslations("dashboard")

  const usdValue = useMemo(() => {
    if (!price) return null
    return (Number(balanceE8s) / E8S_PER_ICP) * price.usd
  }, [balanceE8s, price])

  const fiat = useFiatValue(usdValue)

  return (
    <div className="rounded-3xl bg-blue-200/80 pt-3 shadow-accent-foreground">
      <div className="relative mt-2 rounded-3xl bg-primary p-3 text-primary-foreground shadow-lg">
        {/* Chip + username */}
        <div className="relative z-10 flex min-w-0 items-center gap-2.5">
          <EmvChip />

          {username && (
            <span className="flex min-w-0 items-center gap-1 font-mono text-sm font-medium tracking-tight text-primary-foreground/80">
              <span className="truncate">{username}</span>
              <PremiumBadge name={username} className="size-3.5" />
            </span>
          )}
        </div>

        {/* Balance */}
        <div className="relative z-10 mt-6 flex items-baseline gap-2">
          <Button
            variant="ghost"
            onClick={() => void onRefreshPrice()}
            className="h-auto p-0 text-[clamp(1.75rem,9vw,2.75rem)] font-semibold leading-tight tracking-tight tabular-nums hover:bg-transparent hover:opacity-80 active:opacity-60"
          >
            {hidden ? "•• •••• ••••" : <FormattedBalance value={balance} />}
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={hidden ? t("showBalance") : t("hideBalance")}
            onClick={onToggleHidden}
            className="text-primary-foreground/60 hover:bg-primary-foreground/15 hover:text-primary-foreground"
          >
            <HugeiconsIcon icon={hidden ? ViewOffIcon : EyeIcon} className="size-5" strokeWidth={1.75} />
          </Button>
        </div>

        {/* Fiat value */}
        <div className="relative z-10 mt-1 flex items-center justify-between gap-2">
          <span className="liquid-glass-primary inline-block rounded-full px-2.5 py-1 text-sm font-medium tabular-nums">
            {hidden || !fiat.formatted ? "••••" : `≈ ${fiat.symbol} ${fiat.formatted}`}
          </span>
          <div className="flex items-center gap-1.5">
            {!hidden && price && (
              <span className="text-xs font-medium tabular-nums text-primary-foreground/70">
                1 ICP = {price.usd.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 4,
                })}
              </span>
            )}
            {!hidden && price && price.change24h !== 0 && (
              <span
                className={cn(
                  "text-xs font-semibold tabular-nums",
                  price.change24h > 0 ? "text-green-400" : "text-red-400"
                )}
              >
                {price.change24h > 0 ? "+" : ""}
                {price.change24h.toFixed(2)}%
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Splits a balance string on its decimal point and renders the fractional
 * tail smaller and dimmed, so the eye lands on the whole-number amount
 * first — the same pattern Coinbase/Robinhood-style balances use.
 */
function FormattedBalance({ value }: { value: string }) {
  const dotIndex = value.indexOf(".")
  if (dotIndex === -1) return <>{value}</>

  const whole = value.slice(0, dotIndex)
  const decimals = value.slice(dotIndex)

  return (
    <>
      {whole}
      <span className="text-[0.55em] font-medium text-primary-foreground/50">{decimals}</span>
    </>
  )
}

/** Metallic EMV-style chip icon shown next to the username. */
function EmvChip() {
  return (
    <span className="relative flex h-6 w-8 shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-amber-200 via-yellow-300 to-amber-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),inset_0_-1px_2px_rgba(120,80,10,0.4),0_1px_2px_rgba(0,0,0,0.25)]">
      <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-amber-800/30" />
      <span className="absolute inset-y-0 left-1/3 w-px bg-amber-800/30" />
      <span className="absolute inset-y-0 left-2/3 w-px bg-amber-800/30" />
      <span className="absolute left-0 top-1/2 h-2.5 w-full -translate-y-1/2 rounded-[2px] border border-amber-800/25" />
    </span>
  )
}