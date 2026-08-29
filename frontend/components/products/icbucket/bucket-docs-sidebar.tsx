"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { docHref } from "@/lib/bucket/docs/nav"
import type { BucketDocNavGroup } from "@/lib/bucket/docs/types"
import { cn } from "@/lib/ui/utils"

function NavLink({ slug, title, active }: { slug: string; title: string; active: boolean }) {
  return (
    <Link
      href={docHref(slug)}
      className={cn(
        "block rounded-md px-2.5 py-1.5 text-sm transition-colors",
        active
          ? "bg-primary/10 font-medium text-primary"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      )}
    >
      {title}
    </Link>
  )
}

export function BucketDocsNav({
  groups,
  className,
}: {
  groups: BucketDocNavGroup[]
  className?: string
}) {
  const t = useTranslations("bucket")
  const pathname = usePathname()

  return (
    <nav className={cn("space-y-6", className)} aria-label="Documentation">
      <div className="space-y-1 px-2">
        <Link
          href="/bucket/docs"
          className={cn(
            "text-sm font-semibold transition-colors",
            pathname === "/bucket/docs" ? "text-primary" : "text-foreground hover:text-primary"
          )}
        >
          ICBucket
        </Link>
        <p className="text-xs text-muted-foreground">{t("docsSubtitle")}</p>
      </div>
      {groups.map((group) => (
        <div key={group.label} className="space-y-1.5">
          <p className="px-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {group.label}
          </p>
          <div className="space-y-0.5">
            {group.items.map((item) => (
              <NavLink
                key={item.slug}
                slug={item.slug}
                title={item.title}
                active={pathname === docHref(item.slug)}
              />
            ))}
          </div>
        </div>
      ))}
    </nav>
  )
}

export function BucketDocsMobileNav({ groups }: { groups: BucketDocNavGroup[] }) {
  const pathname = usePathname()

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
      <Link
        href="/bucket/docs"
        className={cn(
          "shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium transition-colors",
          pathname === "/bucket/docs"
            ? "border-primary bg-primary/10 text-primary"
            : "border-border/60 text-muted-foreground hover:text-foreground"
        )}
      >
        Home
      </Link>
      {groups.flatMap((group) =>
        group.items.map((item) => (
          <Link
            key={item.slug}
            href={docHref(item.slug)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium transition-colors",
              pathname === docHref(item.slug)
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/60 text-muted-foreground hover:text-foreground"
            )}
          >
            {item.title}
          </Link>
        ))
      )}
    </div>
  )
}
