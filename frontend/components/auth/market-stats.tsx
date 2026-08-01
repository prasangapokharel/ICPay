"use client"

import { useEffect, useRef, useState } from "react"
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
  const { price } = useIcpPrice({ refreshInterval: 5_000 })
  const count = useEasedPrice(price?.usd ?? 0)
  const ticker = useRandomTicker(price?.usd ?? 0)

  return (
    <div className="flex justify-center">
      <span className="font-mono text-5xl font-light tracking-[0.15em] tabular-nums text-primary/40 drop-shadow-sm">
        <span className="mr-1 text-3xl align-middle text-primary/50">$</span>
        {count.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
        <span className="text-primary/60">
          {ticker}
        </span>
      </span>
    </div>
  )
}
