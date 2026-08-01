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
    <div className="relative mt-7 rounded-3xl bg-gradient-to-br from-[#ED1E79] to-[#3B82F6] px-5 pb-6 pt-0 text-white shadow-lg">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-3xl p-px"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.12) 25%, rgba(255,255,255,0) 45%, rgba(255,255,255,0) 55%, rgba(255,255,255,0.12) 75%, rgba(255,255,255,0.35) 100%)",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
        }}
      />
      {/* The coin straddles the card's top edge, so the card itself cannot clip
          it -- the decorative blur is masked in its own layer instead. */}
      <span className="absolute -top-5 left-1/2 flex size-14 -translate-x-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-lg backdrop-blur-md">
        <Image src="/images/logo/logo.png" alt="ICP" width={36} height={36} className="size-9" />
      </span>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl"
      >
        <span className="absolute -right-10 -top-16 size-48 rounded-full bg-white/10 blur-2xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center pt-12">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold tracking-tight tabular-nums">
            {hidden ? "••••••" : balance}
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-white/70">
            ICP
            <button
              type="button"
              aria-label={hidden ? "Show balance" : "Hide balance"}
              onClick={onToggleHidden}
              className="flex items-center transition-colors hover:text-white active:scale-95"
            >
              <HugeiconsIcon icon={hidden ? EyeOffIcon : EyeIcon} className="size-4" />
            </button>
          </span>
        </div>

        <span className="mt-3 inline-flex items-center rounded-full bg-white/15 px-3 py-0.5 text-xs font-medium tabular-nums text-white/90">
          {hidden || usdValue === null ? "••••" : formatUsdPrecise(usdValue)}
        </span>
      </div>
    </div>
  )
}
