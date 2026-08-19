"use client"

import Link from "next/link"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/ui/utils"

export function ServiceTile({
  href,
  label,
  icon,
  onClick,
  badge,
}: {
  href?: string
  label: string
  icon: IconSvgElement
  onClick?: () => void
  badge?: string
}) {
  const tile = (
    <>
      <span className="relative">
        <span
          className={cn(
            "flex size-12 items-center justify-center rounded-xl bg-muted/60",
            "transition-colors hover:bg-accent"
          )}
        >
          <HugeiconsIcon icon={icon} className="size-5 text-primary" strokeWidth={1.75} />
        </span>
        {badge && (
          <span
            className={cn(
              "absolute -right-1.5 -top-1.5 rounded-sm px-1.5 py-px text-[8px] font-bold uppercase leading-none text-foreground",
              "bg-gradient-to-br from-amber-200 via-yellow-300 to-amber-500"
            )}
          >
            {badge}
          </span>
        )}
      </span>
      <span className="text-[10px] font-medium leading-tight">{label}</span>
    </>
  )

  const className =
    "h-auto flex-col gap-1.5 rounded-none bg-transparent p-0 text-center font-normal hover:bg-transparent"

  if (onClick) {
    return (
      <Button variant="ghost" size="sm" onClick={onClick} className={className}>
        {tile}
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      nativeButton={false}
      render={<Link href={href ?? "#"} />}
      className={className}
    >
      {tile}
    </Button>
  )
}
