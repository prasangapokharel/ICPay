"use client"

import Image from "next/image"
import { cn } from "@/lib/ui/utils"

const FLAG_CDN = "https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3"

type LocaleFlagProps = {
  country: string
  label: string
  size?: "sm" | "md"
  className?: string
  priority?: boolean
}

const SIZES = {
  sm: { width: 16, height: 12 },
  md: { width: 18, height: 14 },
} as const

export function LocaleFlag({ country, label, size = "md", className, priority }: LocaleFlagProps) {
  const { width, height } = SIZES[size]
  const text = `${label} flag`

  return (
    <Image
      src={`${FLAG_CDN}/${country.toLowerCase()}.svg`}
      alt={text}
      title={text}
      width={width}
      height={height}
      unoptimized
      loading={priority ? "eager" : "lazy"}
      priority={priority}
      className={cn("shrink-0 rounded-full object-cover", className)}
    />
  )
}
