"use client"

import Image from "next/image"
import { Eye, EyeOff, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatUsd, type IcpPrice } from "@/lib/use-icp-price"

type BalanceCardProps = {
  balance: string
  balanceE8s: bigint
  price: IcpPrice | null
  hidden: boolean
  onToggleHidden: () => void
  onRefresh: () => void
  refreshing?: boolean
}

const E8S = 100_000_000

export function BalanceCard({
  balance,
  balanceE8s,
  price,
  hidden,
  onToggleHidden,
  onRefresh,
  refreshing = false,
}: BalanceCardProps) {
  const usdValue = price ? (Number(balanceE8s) / E8S) * price.usd : null

  return (
    <div className="relative mt-7 rounded-3xl bg-primary px-5 pb-6 pt-0 text-primary-foreground shadow-lg">
      {/* The coin straddles the card's top edge, so the card itself cannot clip
          it -- the decorative blur is masked in its own layer instead. */}
      <span className="absolute -top-7 left-1/2 flex size-14 -translate-x-1/2 items-center justify-center rounded-full bg-primary shadow-md ring-4 ring-background">
        <Image src="/images/logo/logo.png" alt="ICP" width={36} height={36} className="size-9" />
      </span>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl"
      >
        <span className="absolute -right-10 -top-16 size-48 rounded-full bg-white/10 blur-2xl" />
      </div>

      <div className="relative flex items-start justify-end gap-1 pt-3">
        <IconButton label="Refresh balance" onClick={onRefresh} disabled={refreshing}>
          <RefreshCw className={cn("size-4", refreshing && "animate-spin")} />
        </IconButton>
        <IconButton label={hidden ? "Show balance" : "Hide balance"} onClick={onToggleHidden}>
          {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </IconButton>
      </div>

      <div className="relative -mt-6 flex flex-col items-center pt-3">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold tracking-tight tabular-nums">
            {hidden ? "••••••" : balance}
          </span>
          <span className="text-sm font-medium text-primary-foreground/70">ICP</span>
        </div>

        <span className="mt-2 text-xs text-primary-foreground/80 tabular-nums">
          {hidden || usdValue === null ? "••••" : formatUsd(usdValue)}
        </span>
      </div>
    </div>
  )
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="flex size-9 items-center justify-center rounded-full bg-white/15 backdrop-blur transition-colors hover:bg-white/25 disabled:opacity-50"
    >
      {children}
    </button>
  )
}
