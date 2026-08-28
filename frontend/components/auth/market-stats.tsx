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

// Two trailing digits that roll to random values between refreshes, but snap
// to the real 3rd-4th decimals the moment a fresh price arrives.
function useRandomTicker(seed: number) {
  const [ticks, setTicks] = useState("00")
  const seeded = useRef(false)

  useEffect(() => {
    const real = Math.floor(Math.abs(seed * 100) % 1 * 100)
    setTicks(real.toString().padStart(2, "0"))
    seeded.current = true
  }, [seed])

  useEffect(() => {
    if (!seeded.current) return
    const id = setInterval(
      () => setTicks(Math.floor(Math.random() * 100).toString().padStart(2, "0")),
      120,
    )
    return () => clearInterval(id)
  }, [seed])

  return ticks
}

export function MarketStats() {
  const { price, loading } = useIcpPrice({ refreshInterval: 60_000 })
  const liveUsd = price && price.usd > 0 ? price.usd : 0
  const count = useEasedPrice(liveUsd)
  const ticker = useRandomTicker(liveUsd)

  return (
    <div className="flex justify-center">
      <span className="font-mono text-2xl font-light tracking-[0.12em] tabular-nums text-primary/40 drop-shadow-sm sm:text-3xl">
        <span className="mr-1 text-xl align-middle text-primary/50 sm:text-2xl">$</span>
        {liveUsd > 0 ? (
          <>
            {count.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            <span className="text-primary/60">{ticker}</span>
          </>
        ) : (
          <span className="text-primary/30">{loading ? "···" : "—"}</span>
        )}
      </span>
    </div>
  )
}
