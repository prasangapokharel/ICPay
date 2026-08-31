"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AppIcon, type AppIconName } from "@/components/ui/app-icon"
import { GradientBadge } from "@/components/ui/gradient-badge"
import { cn } from "@/lib/ui/utils"

export function ServiceTile({
  href,
  label,
  icon,
  onClick,
  badge,
  onPrefetch,
}: {
  href?: string
  label: string
  icon: AppIconName
  onClick?: () => void
  badge?: string
  onPrefetch?: () => void
}) {
  const tile = (
    <>
      <span className="relative">
        <span
          className={cn(
            "flex size-10 items-center justify-center overflow-hidden rounded-2xl bg-gray-800 text-white shadow-sm",
            "transition-colors hover:bg-gray-700"
          )}
        >
          <AppIcon name={icon} size={24} />
        </span>
        {badge ? (
          <GradientBadge className="absolute -right-2 -top-2 z-10" size="sm">
            {badge}
          </GradientBadge>
        ) : null}
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
      render={<Link href={href ?? "#"} prefetch onMouseEnter={onPrefetch} onFocus={onPrefetch} />}
      className={className}
    >
      {tile}
    </Button>
  )
}
