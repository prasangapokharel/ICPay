"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/ui/utils"
import type { BucketDocHeading } from "@/lib/bucket/docs/types"

export function BucketDocsPageToc({
  headings,
  className,
}: {
  headings: BucketDocHeading[]
  className?: string
}) {
  const [activeId, setActiveId] = useState(headings[0]?.id ?? "")

  useEffect(() => {
    if (headings.length === 0) return

    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((el): el is HTMLElement => el !== null)

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]?.target.id) setActiveId(visible[0].target.id)
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: [0, 0.25, 0.5, 1] }
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <nav className={cn("space-y-3", className)} aria-label="On this page">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        On this page
      </p>
      <div className="space-y-0.5 border-l border-border/60">
        {headings.map((heading) => (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            className={cn(
              "block border-l-2 py-1 text-sm transition-colors -ml-px",
              heading.level === 3 && "pl-6",
              heading.level === 2 && "pl-3",
              activeId === heading.id
                ? "border-primary font-medium text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {heading.text}
          </a>
        ))}
      </div>
    </nav>
  )
}
