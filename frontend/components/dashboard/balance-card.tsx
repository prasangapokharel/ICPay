"use client"

import Image from "next/image"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { EyeIcon, EyeOffIcon, RocketIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import type { IcpPrice } from "@/lib/use-icp-price"
import { useFiatValue } from "@/lib/fiat/use-fiat-value"

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
  const t = useTranslations("dashboard")
  const tl = useTranslations("launch")
  const usdValue = price ? (Number(balanceE8s) / E8S) * price.usd : null
  const fiat = useFiatValue(usdValue)

  return (
    <div className="relative mb-7 mt-7 rounded-3xl bg-primary px-5 pb-6 pt-0 text-primary-foreground shadow-lg">
      {/* The coin straddles the card's top edge, so the card itself cannot clip
          it -- the decorative blur is masked in its own layer instead. */}
      <span className="absolute -top-5 left-1/2 z-10 flex size-14 -translate-x-1/2 items-center justify-center rounded-full border border-primary-foreground/20 bg-primary-foreground/10 shadow-lg backdrop-blur-md">
        <Image src="/images/logo/logo.png" alt="ICP" width={36} height={36} className="size-9" />
      </span>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl"
      >
        <span className="absolute -right-10 -top-16 size-48 rounded-full bg-primary-foreground/10 blur-2xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center pt-12">
        <div className="flex items-baseline gap-2">
          <span className="text-[clamp(1.5rem,8vw,2.5rem)] font-bold leading-tight tracking-tight tabular-nums">
            {hidden ? "••••••" : balance}
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-foreground/70">
            ICP
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={hidden ? t("showBalance") : t("hideBalance")}
              onClick={onToggleHidden}
              className="hover:bg-primary-foreground/15 hover:text-primary-foreground"
            >
              <HugeiconsIcon icon={hidden ? EyeOffIcon : EyeIcon} className="size-4" />
            </Button>
          </span>
        </div>

        <span className="mt-3 inline-flex items-center rounded-full bg-primary-foreground/15 px-3 py-0.5 text-xs font-medium tabular-nums text-primary-foreground/90">
          {hidden || !fiat.formatted ? "••••" : `${fiat.symbol} ${fiat.formatted}`}
        </span>
      </div>

      {/* Straddles the bottom edge the way the coin straddles the top, so it
          reads as attached to the balance rather than as a third action button
          competing with Send and Receive below. */}
      <Link
        href="/launch"
        className="absolute -bottom-5 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-primary/15 bg-background px-4 py-2.5 text-xs font-semibold text-foreground shadow-lg transition-transform active:scale-95"
      >
        <HugeiconsIcon icon={RocketIcon} className="size-4 text-primary" />
        {tl("createCta")}
      </Link>
    </div>
  )
}
