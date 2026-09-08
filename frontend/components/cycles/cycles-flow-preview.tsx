"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/ui/utils"

export function CyclesFlowPreview({
  title,
  rows,
  highlight,
  loading,
  className,
}: {
  title: string
  rows: { label: string; value: string; mono?: boolean }[]
  highlight?: { label: string; value: string }
  loading?: boolean
  className?: string
}) {
  return (
    <Card className={cn("gap-0 lg:sticky lg:top-20", className)}>
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {highlight && (
          <div className="rounded-xl border border-border/60 bg-muted/30 px-3 py-3">
            <p className="text-xs font-medium text-muted-foreground">{highlight.label}</p>
            {loading ? (
              <Skeleton className="mt-1.5 h-8 w-32" />
            ) : (
              <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
                {highlight.value}
              </p>
            )}
          </div>
        )}
        <dl className="space-y-3">
          {rows.map((row) => (
            <div key={row.label} className="flex items-start justify-between gap-3">
              <dt className="shrink-0 text-xs text-muted-foreground">{row.label}</dt>
              <dd
                className={cn(
                  "min-w-0 text-right text-xs font-medium text-foreground",
                  row.mono && "break-all font-mono"
                )}
              >
                {row.value || "—"}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}
