"use client"

import Link from "next/link"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import { cn } from "@/lib/utils"

export function ServiceTile({
  href,
  label,
  icon,
  onClick,
}: {
  href?: string
  label: string
  icon: IconSvgElement
  onClick?: () => void
}) {
  const tile = (
    <>
      <span
        className={cn(
          "flex size-14 items-center justify-center rounded-2xl bg-muted/60",
          "transition-colors hover:bg-accent"
        )}
      >
        <HugeiconsIcon icon={icon} className="size-6 text-primary" strokeWidth={1.75} />
      </span>
      <span className="text-[11px] font-medium leading-tight">{label}</span>
    </>
  )

  const className =
    "flex flex-col items-center gap-2 text-center transition-transform active:scale-95"

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {tile}
      </button>
    )
  }

  return (
    <Link href={href ?? "#"} className={className}>
      {tile}
    </Link>
  )
}
