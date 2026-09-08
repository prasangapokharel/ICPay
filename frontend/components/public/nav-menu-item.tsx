import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import type { IconSvgElement } from "@hugeicons/react"
import type { NavMenuItem } from "@/lib/public/site-links"
import { getNavMenuIcon } from "@/lib/public/nav-menu-icons"
import { cn } from "@/lib/ui/utils"

export function NavMenuItemContent({
  title,
  description,
  icon,
}: {
  title: string
  description: string
  icon: IconSvgElement
}) {
  return (
    <div className="flex items-start gap-3">
      <HugeiconsIcon
        icon={icon}
        className="mt-0.5 size-5 shrink-0 text-primary"
        strokeWidth={1.75}
      />
      <div className="min-w-0 flex flex-col gap-1">
        <span className="text-sm font-medium leading-snug text-foreground">{title}</span>
        <span className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {description}
        </span>
      </div>
    </div>
  )
}

export function NavMenuLinkRow({
  item,
  className,
  onNavigate,
}: {
  item: NavMenuItem
  className?: string
  onNavigate?: () => void
}) {
  const icon = getNavMenuIcon(item.href)
  const body = <NavMenuItemContent title={item.title} description={item.description} icon={icon} />

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onNavigate}
        className={cn(
          "block rounded-xl px-3 py-2.5 transition-colors hover:bg-muted",
          className
        )}
      >
        {body}
      </a>
    )
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn("block rounded-xl px-3 py-2.5 transition-colors hover:bg-muted", className)}
    >
      {body}
    </Link>
  )
}
