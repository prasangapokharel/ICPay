"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress"
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
    <Button
      variant="ghost"
      nativeButton={false}
      render={<Link href={`/bucket/${encodeURIComponent(bucket.id)}`} prefetch />}
      className="h-auto w-full justify-start gap-3 rounded-none px-4 py-3"
    >
      <BucketAvatarChip name={bucket.name} />
      <span className="min-w-0 flex-1 text-left">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold">{bucket.name}</span>
          {!active && <Badge variant="secondary">{t("expired")}</Badge>}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {formatUsageLabel(bucket.storageUsed, bucket.capacity)}
          {" · "}
          {isPublicVisibility(bucket.visibility) ? t("public") : t("private")}
        </span>
      </span>
    </Button>
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
    <Progress value={pct}>
      <ProgressLabel>{formatUsageLabel(used, capacity)}</ProgressLabel>
      <ProgressValue />
    </Progress>
  )
}

export function formatFileSize(size: bigint): string {
  return formatBytes(size)
}
