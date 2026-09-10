import Image from "next/image"
import { HugeiconsIcon } from "@hugeicons/react"
import { Clock01Icon } from "@hugeicons/core-free-icons"

export function BlogAuthorMeta({
  publishedAt,
  readingMinutes,
  authorName = "ICPay Team",
}: {
  publishedAt?: string
  readingMinutes?: number
  authorName?: string
}) {
  const formattedDate = publishedAt
    ? new Date(publishedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "September 10, 2026"

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-y border-border/50 py-3 my-4">
      <div className="flex items-center gap-3">
        <div className="relative size-10 shrink-0 overflow-hidden rounded-full border border-border/70 bg-background/80 shadow-xs">
          <Image
            src="/images/logo/logo-256.webp"
            alt="ICPay"
            width={40}
            height={40}
            className="size-full object-contain p-1"
            priority
          />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-foreground tracking-tight">By {authorName}</span>
            <span className="rounded-full bg-primary/10 px-1.5 py-0.2 text-[9px] font-medium text-primary">
              Official
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">{formattedDate}</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
        <HugeiconsIcon icon={Clock01Icon} className="size-3.5 text-primary" />
        <span>{readingMinutes ?? 7} min read</span>
      </div>
    </div>
  )
}
