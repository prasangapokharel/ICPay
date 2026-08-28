"use client"

import { useEffect, useRef, useState } from "react"
import { useIcpPrice } from "@/hooks/market/useIcpPrice"

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

function tickerFromSeed(seed: number) {
  return Math.floor((Math.abs(seed * 100) % 1) * 100)
    .toString()
    .padStart(2, "0")
}

function RollingTicker({ seed }: { seed: number }) {
  const [ticks, setTicks] = useState(() => tickerFromSeed(seed))

  useEffect(() => {
    const id = setInterval(
      () => setTicks(Math.floor(Math.random() * 100).toString().padStart(2, "0")),
      120,
    )
    return () => clearInterval(id)
  }, [])

  return <span className="text-primary/60">{ticks}</span>
}

export function MarketStats() {
  const { price, loading } = useIcpPrice({ refreshInterval: 60_000 })
  const liveUsd = price && price.usd > 0 ? price.usd : 0
  const count = useEasedPrice(liveUsd)

  return (
    <div className="flex justify-center leading-none">
      <span className="font-mono text-4xl font-light tracking-[0.12em] tabular-nums text-primary/40 drop-shadow-sm sm:text-5xl sm:tracking-[0.15em]">
        {liveUsd > 0 ? (
          <>
            {count.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            <RollingTicker key={liveUsd} seed={liveUsd} />
          </>
        ) : (
          <span className="text-primary/30">{loading ? "···" : "—"}</span>
        )}
      </span>
    </div>
  )
}
