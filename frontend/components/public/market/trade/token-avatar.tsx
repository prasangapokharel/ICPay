"use client"

import Image from "next/image"
import { cn } from "@/lib/ui/utils"

export function TokenAvatar({
  symbol,
  logoUrl,
  className,
}: {
  symbol: string
  logoUrl?: string | null
  className?: string
}) {
  const letter = symbol.slice(0, 1).toUpperCase()

  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt=""
        width={32}
        height={32}
        unoptimized
        className={cn("size-8 shrink-0 rounded-full bg-muted object-cover", className)}
      />
    )
  }

  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold",
        className
      )}
    >
      {letter}
    </span>
  )
}
