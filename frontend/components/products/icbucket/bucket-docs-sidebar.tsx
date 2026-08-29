"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { BUCKET_DOC_NAV, bucketDocSectionIds } from "@/lib/bucket/docsNav"
import { cn } from "@/lib/ui/utils"

function NavLink({
  id,
  label,
  active,
  nested,
}: {
  id: string
  label: string
  active: boolean
  nested?: boolean
}) {
  return (
    <a
      href={`#${id}`}
      className={cn(
        "block rounded-lg px-3 py-2 text-sm transition-colors",
        nested ? "pl-6 text-muted-foreground" : "font-medium",
        active
          ? nested
            ? "bg-primary/10 text-primary"
            : "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      )}
    >
      {label}
    </a>
  )
}

export function BucketDocsSidebar({ className }: { className?: string }) {
  const t = useTranslations("bucket")
  const [activeId, setActiveId] = useState("overview")

  useEffect(() => {
    const ids = bucketDocSectionIds()
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] }
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <nav className={cn("space-y-6", className)} aria-label="Documentation">
      <p className="px-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        On this page
      </p>
      <div className="space-y-4">
        {BUCKET_DOC_NAV.map((item) => (
          <div key={item.id} className="space-y-1">
            <NavLink id={item.id} label={t(item.titleKey)} active={activeId === item.id} />
            {item.children ? (
              <div className="ml-3 space-y-0.5 border-l border-border/60">
                {item.children.map((child) => (
                  <NavLink
                    key={child.id}
                    id={child.id}
                    label={t(child.titleKey)}
                    active={activeId === child.id}
                    nested
                  />
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </nav>
  )
}

export function BucketDocsMobileNav() {
  const t = useTranslations("bucket")

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
      {BUCKET_DOC_NAV.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className="shrink-0 rounded-full border border-border/60 bg-background px-4 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {t(item.titleKey)}
        </a>
      ))}
    </div>
  )
}
