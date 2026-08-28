"use client"

import Image from "next/image"
import { useIcpPrice } from "@/hooks/market/useIcpPrice"
import { formatUsdPrecise } from "@/lib/market/icpPrice"
import { ICP_LOGO } from "@/lib/token/icon"
import { IcpPriceSparkline } from "@/components/community/icpPrice/sparkline"
import { cn } from "@/lib/ui/utils"

export function IcpPriceTicket({ className }: { className?: string }) {
  const { price, loading } = useIcpPrice({ refreshInterval: 60_000 })
  const change = price?.change24h ?? 0
  const up = change >= 0
  const formattedChange = `${up ? "+" : ""}${change.toFixed(2)}%`

  return (
    <div
      className={cn(
        "inline-flex max-w-full items-center gap-2 rounded-2xl border border-border/40 bg-background px-2 py-1.5 shadow-sm backdrop-blur-sm",
        className
      )}
    >
      <Image
        src={ICP_LOGO}
        alt=""
        width={22}
        height={22}
        className="size-[22px] shrink-0 rounded-full"
      />
      <div className="flex min-w-0 items-center gap-1.5">
        <span className="text-xs font-semibold leading-none">ICP</span>
        <span className="text-xs font-semibold tabular-nums leading-none">
          {loading && !price ? "…" : price ? formatUsdPrecise(price.usd) : "—"}
        </span>
        {price ? (
          <span
            className={cn(
              "rounded-full px-1.5 py-px text-[10px] font-semibold leading-none tabular-nums text-black",
              up ? "bg-emerald-400" : "bg-red-500"
            )}
          >
            {formattedChange}
          </span>
        ) : null}
      </div>
      {price ? (
        <IcpPriceSparkline change24h={change} className="h-5 w-14 shrink-0 opacity-90" />
      ) : null}
    </div>
  )
}
