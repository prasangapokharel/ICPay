"use client"

import Link from "next/link"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import { Button } from "@/components/ui/button"
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
    "h-auto flex-col gap-2 rounded-none bg-transparent p-0 text-center font-normal hover:bg-transparent"

  if (onClick) {
    return (
      <Button variant="ghost" onClick={onClick} className={className}>
        {tile}
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      nativeButton={false}
      render={<Link href={href ?? "#"} />}
      className={className}
    >
      {tile}
    </Button>
  )
}
