"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { BucketAvatarChip } from "@/components/bucket/bucket-file-thumb"
import {
  formatBytes,
  formatUsageLabel,
  isBucketActive,
  isPublicVisibility,
} from "@/lib/bucket/bucket"
import type { BucketPublic } from "@/services/bucket/types"

export function BucketCard({ bucket }: { bucket: BucketPublic }) {
  const t = useTranslations("bucket")
  const active = isBucketActive(bucket.status)

  return (
    <Link
      href={`/bucket/${encodeURIComponent(bucket.id)}`}
      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
    >
      <BucketAvatarChip name={bucket.name} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold">{bucket.name}</span>
          {!active && (
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
              {t("expired")}
            </Badge>
          )}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {formatUsageLabel(bucket.storageUsed, bucket.capacity)}
          {" · "}
          {isPublicVisibility(bucket.visibility) ? t("public") : t("private")}
        </span>
      </span>
      <HugeiconsIcon icon={ArrowRight01Icon} className="size-4 shrink-0 text-muted-foreground" />
    </Link>
  )
}

export function BucketUsageBar({
  used,
  capacity,
  percent,
}: {
  used: bigint
  capacity: bigint
  percent: bigint
}) {
  const pct = Math.min(100, Number(percent))
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{formatUsageLabel(used, capacity)}</span>
        <span className="font-medium tabular-nums">{pct}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export function formatFileSize(size: bigint): string {
  return formatBytes(size)
}
