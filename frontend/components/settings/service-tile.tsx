"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AppIcon, type AppIconName } from "@/components/ui/app-icon"
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
  icon: AppIconName
  onClick?: () => void
  badge?: string
}) {
  const tile = (
    <>
      <span className="relative">
        <span
          className={cn(
            "flex size-14 items-center justify-center rounded-2xl bg-gray-800 shadow-sm",
            "transition-colors hover:bg-gray-700"
          )}
        >
          <AppIcon name={icon} size={24} />
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
      <span className="text-[11px] font-medium leading-tight">{label}</span>
    </>
  )

  const className =
    "h-auto flex-col gap-2 rounded-none bg-transparent p-0 text-center font-normal hover:bg-transparent"

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
      render={<Link href={href ?? "#"} prefetch />}
      className={className}
    >
      {tile}
    </Button>
  )
}
