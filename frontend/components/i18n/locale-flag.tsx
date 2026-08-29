"use client"

import ReactCountryFlag from "react-country-flag"
import { cn } from "@/lib/ui/utils"

type LocaleFlagProps = {
  country: string
  size?: "sm" | "md"
  className?: string
}

const SIZES = {
  sm: "0.95rem",
  md: "1.1rem",
} as const

export function LocaleFlag({ country, size = "md", className }: LocaleFlagProps) {
  const px = SIZES[size]

  return (
    <ReactCountryFlag
      svg
      countryCode={country}
      aria-hidden
      className={cn("shrink-0 rounded-full object-cover", className)}
      style={{ width: px, height: px }}
    />
  )
}
