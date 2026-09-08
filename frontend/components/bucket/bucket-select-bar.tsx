"use client"

import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { Delete02Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"

export function BucketSelectBar({
  count,
  canWrite,
  deleting,
  onClear,
  onDelete,
}: {
  count: number
  canWrite: boolean
  deleting: boolean
  onClear: () => void
  onDelete: () => void
}) {
  const t = useTranslations("bucket")
  const tc = useTranslations("common")

  if (count === 0) return null

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/40 px-3 py-2">
      <p className="text-sm">
        {t("selectedCount", { count: String(count) })}
      </p>
      <div className="flex items-center gap-2">
        <Button type="button" variant="ghost" size="sm" disabled={deleting} onClick={onClear}>
          {tc("cancel")}
        </Button>
        {canWrite ? (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={deleting}
            onClick={onDelete}
          >
            <HugeiconsIcon icon={Delete02Icon} className="size-4" strokeWidth={1.75} />
            {t("delete")}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
