"use client"

import { useEffect, useRef, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { TrendingUpDownIcon } from "@hugeicons/core-free-icons"
import { useIcpPrice } from "@/lib/use-icp-price"

// Eases toward the target on every change, so the digits visibly tick up or
// down when the live price refreshes instead of snapping.
function useEasedPrice(target: number, duration = 500) {
  const [value, setValue] = useState(target)
  const fromRef = useRef(target)
  const rafRef = useRef(0)

  useEffect(() => {
    const from = fromRef.current
    if (from === target) return
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      const next = from + (target - from) * eased
      setValue(next)
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
      else fromRef.current = target
    }
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])

  return value
}

export function MarketStats() {
  const { price } = useIcpPrice({ refreshInterval: 5_000 })
  const count = useEasedPrice(price?.usd ?? 0)
  const up = (price?.change24h ?? 0) >= 0

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-10 flex justify-center px-4 pt-6">
      <div className="flex items-center gap-2 rounded-full border border-white/50 bg-white/40 px-3 py-1 shadow-sm backdrop-blur-md">
        <span className="text-xs font-mono font-medium tabular-nums text-foreground">
          ICP ${count.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
        {price && (
          <span
            className={
              "inline-flex items-center gap-0.5 text-xs font-mono tabular-nums " +
              (up ? "text-success" : "text-destructive")
            }
          >
            <HugeiconsIcon
              icon={TrendingUpDownIcon}
              className={up ? "size-3 -scale-x-100" : "size-3"}
            />
            {up ? "+" : ""}
            {price.change24h.toFixed(2)}%
          </span>
        )}
      </div>
    </div>
  )
}
