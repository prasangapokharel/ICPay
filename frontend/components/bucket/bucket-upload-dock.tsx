"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/ui/utils"

export type BucketUploadItem = {
  id: string
  name: string
  progress: number
  status: "queued" | "uploading" | "done" | "error"
  error?: string
}

function CirclePct({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)))
  return (
    <div className="relative size-9 shrink-0">
      <svg viewBox="0 0 36 36" className="size-9 -rotate-90">
        <circle
          cx="18"
          cy="18"
          r="15"
          fill="none"
          className="stroke-muted"
          strokeWidth="3"
        />
        <circle
          cx="18"
          cy="18"
          r="15"
          fill="none"
          className="stroke-primary"
          strokeWidth="3"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${pct} 100`}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center px-0.5 text-[7px] font-medium leading-none tabular-nums text-primary">
        {pct}%
      </span>
    </div>
  )
}

export function BucketUploadDock({
  items,
  expanded,
  title,
  uploadedLabel,
  onToggle,
  onDismiss,
}: {
  items: BucketUploadItem[]
  expanded: boolean
  title: string
  uploadedLabel: string
  onToggle: () => void
  onDismiss: () => void
}) {
  if (items.length === 0) return null

  const busy = items.some((i) => i.status === "uploading" || i.status === "queued")
  const overall = Math.round(items.reduce((s, i) => s + i.progress, 0) / items.length)

  return (
    <div className="pointer-events-none fixed right-4 bottom-20 z-50 w-[min(calc(100vw-2rem),22rem)] md:bottom-6">
      <div className="pointer-events-auto overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-lg">
        <div className="flex items-center gap-3 px-3 py-2.5">
          <CirclePct value={busy ? overall : 100} />
          <p className="min-w-0 truncate text-sm font-medium">{title}</p>
          <span className="h-4 w-px shrink-0 bg-border" />
          <p className="ml-auto shrink-0 text-sm tabular-nums text-primary">{uploadedLabel}</p>
          <Button type="button" variant="ghost" size="icon-sm" onClick={onToggle}>
            <HugeiconsIcon
              icon={expanded ? ArrowDown01Icon : ArrowUp01Icon}
              className="size-4"
              strokeWidth={1.75}
            />
          </Button>
          <Button type="button" variant="ghost" size="icon-sm" disabled={busy} onClick={onDismiss}>
            <HugeiconsIcon icon={Cancel01Icon} className="size-4" strokeWidth={1.75} />
          </Button>
        </div>

        {expanded ? (
          <ul className="max-h-56 space-y-2 overflow-y-auto border-t px-3 py-2">
            {items.map((item) => (
              <li key={item.id} className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs" title={item.name}>
                    {item.name}
                  </p>
                  <span
                    className={cn(
                      "shrink-0 text-[10px] tabular-nums",
                      item.status === "error" ? "text-destructive" : "text-muted-foreground"
                    )}
                  >
                    {item.status === "error" ? item.error : `${item.progress}%`}
                  </span>
                </div>
                {item.status !== "error" ? <Progress value={item.progress} className="gap-0" /> : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  )
}
