import { useEffect, useRef, useState } from 'react'
import { Text } from '@/components/ui/text'
import { useIcpPrice } from '@/hooks/use-icp-price'

export function MarketStats() {
  const { price } = useIcpPrice({ refreshInterval: 5_000 })
  const [count, setCount] = useState(price?.usd ?? 0)
  const [ticker, setTicker] = useState('00')
  const fromRef = useRef(price?.usd ?? 0)

  useEffect(() => {
    const target = price?.usd ?? 0
    const from = fromRef.current
    const start = Date.now()
    const id = setInterval(() => {
      const t = Math.min(1, (Date.now() - start) / 500)
      const eased = 1 - (1 - t) ** 3
      setCount(from + (target - from) * eased)
      if (t >= 1) {
        fromRef.current = target
        clearInterval(id)
      }
    }, 16)
    return () => clearInterval(id)
  }, [price?.usd])

  useEffect(() => {
    const id = setInterval(() => {
      setTicker(Math.floor(Math.random() * 100).toString().padStart(2, '0'))
    }, 120)
    return () => clearInterval(id)
  }, [price?.usd])

  return (
    <Text className="font-mono text-5xl font-light tracking-widest text-primary/40">
      <Text className="text-3xl text-primary/50">$</Text>
      {count.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      <Text className="text-primary/60">{ticker}</Text>
    </Text>
  )
}
