"use client"

import { useId } from "react"

type SparklineProps = {
  change24h: number
  className?: string
}

export function IcpPriceSparkline({ change24h, className }: SparklineProps) {
  const fillId = useId()
  const up = change24h >= 0
  const stroke = up ? "#10b981" : "#f43f5e"
  const fill = up ? "rgba(16,185,129,0.18)" : "rgba(244,63,94,0.16)"

  const points = up
    ? "2,28 18,22 34,24 50,14 66,16 82,8 98,10 114,4 130,6"
    : "2,6 18,10 34,8 50,18 66,16 82,24 98,20 114,26 130,28"

  return (
    <svg
      viewBox="0 0 132 32"
      className={className}
      aria-hidden
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <polygon points={`${points} 130,32 2,32`} fill={`url(#${fillId})`} />
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
