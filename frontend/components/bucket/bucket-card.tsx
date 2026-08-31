"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, Folder02Icon } from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress"
import { TableCell, TableRow } from "@/components/ui/table"
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
    <TableRow className="cursor-pointer">
      <TableCell>
        <Link
          href={`/bucket/${encodeURIComponent(bucket.id)}`}
          prefetch
          className="flex items-center gap-2.5"
        >
          <HugeiconsIcon
            icon={Folder02Icon}
            className="size-5 shrink-0 text-muted-foreground"
            strokeWidth={1.75}
          />
          <span className="truncate text-sm font-medium">{bucket.name}</span>
        </Link>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {isPublicVisibility(bucket.visibility) ? t("public") : t("private")}
      </TableCell>
      <TableCell className="text-muted-foreground tabular-nums">
        {formatUsageLabel(bucket.storageUsed, bucket.capacity)}
      </TableCell>
      <TableCell>
        {active ? (
          <Badge variant="outline">{t("active")}</Badge>
        ) : (
          <Badge variant="secondary">{t("expired")}</Badge>
        )}
      </TableCell>
      <TableCell className="text-right">
        <Link href={`/bucket/${encodeURIComponent(bucket.id)}`} prefetch aria-label={bucket.name}>
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-4 text-muted-foreground" strokeWidth={1.75} />
        </Link>
      </TableCell>
    </TableRow>
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
