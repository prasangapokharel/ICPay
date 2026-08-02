"use client"

import Image from "next/image"
import { HugeiconsIcon } from "@hugeicons/react"
import { EyeIcon, EyeOffIcon } from "@hugeicons/core-free-icons"
import { formatUsdPrecise, type IcpPrice } from "@/lib/use-icp-price"

type BalanceCardProps = {
  balance: string
  balanceE8s: bigint
  price: IcpPrice | null
  hidden: boolean
  onToggleHidden: () => void
}

const E8S = 100_000_000

export function BalanceCard({
  balance,
  balanceE8s,
  price,
  hidden,
  onToggleHidden,
}: BalanceCardProps) {
  const usdValue = price ? (Number(balanceE8s) / E8S) * price.usd : null

  return (
    <div className="relative mt-7 rounded-3xl px-5 pb-6 pt-0">
      {/* The coin straddles the card's top edge, so the card itself cannot clip
          it -- the decorative blur is masked in its own layer instead. */}
      <span className="absolute -top-5 left-1/2 z-10 flex size-14 -translate-x-1/2 items-center justify-center rounded-full border border-border bg-background shadow-lg">
        <Image src="/images/logo/logo.png" alt="ICP" width={36} height={36} className="size-9" />
      </span>

      <div className="relative z-10 flex flex-col items-center pt-12">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold tracking-tight tabular-nums">
            {hidden ? "••••••" : balance}
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            ICP
            <button
              type="button"
              aria-label={hidden ? "Show balance" : "Hide balance"}
              onClick={onToggleHidden}
              className="flex items-center transition-colors hover:text-foreground active:scale-95"
            >
              <HugeiconsIcon icon={hidden ? EyeOffIcon : EyeIcon} className="size-4" />
            </button>
          </span>
        </div>

        <span className="mt-3 inline-flex items-center rounded-full bg-muted px-3 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
          {hidden || usdValue === null ? "••••" : formatUsdPrecise(usdValue)}
        </span>
      </div>
    </div>
  )
}
