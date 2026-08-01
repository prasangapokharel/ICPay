"use client"

import { useEffect, useState } from "react"

export function Typewriter({
  text,
  speed = 45,
  className,
}: {
  text: string
  speed?: number
  className?: string
}) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (count >= text.length) return
    const t = setTimeout(() => setCount((c) => c + 1), speed)
    return () => clearTimeout(t)
  }, [count, text, speed])

  return (
    <span className={className}>
      {text.slice(0, count)}
      <span className="animate-pulse">|</span>
    </span>
  )
}
