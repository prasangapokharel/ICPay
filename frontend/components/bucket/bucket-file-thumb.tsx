"use client"

import Image from "next/image"
import { useTranslations } from "next-intl"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { HugeiconsIcon } from "@hugeicons/react"
import { File01Icon } from "@hugeicons/core-free-icons"
import { fileTypeChip } from "@/lib/bucket/bucket"
import { useBucketFilePreview } from "@/hooks/bucket/useBucketFilePreview"
import { cn } from "@/lib/ui/utils"
import type { FilePublic } from "@/services/bucket/types"

function isPreviewableImage(contentType: string): boolean {
  return contentType.startsWith("image/")
}

export function BucketFileThumb({
  bucketId,
  file,
  size = "sm",
  onClick,
}: {
  bucketId: string
  file: FilePublic
  size?: "sm" | "md"
  onClick?: () => void
}) {
  const { previewUrl, loading, handleImageError } = useBucketFilePreview(bucketId, file)
  const iconSize = size === "md" ? "icon-lg" : "icon-sm"

  const inner = previewUrl && isPreviewableImage(file.contentType) ? (
    <Image
      src={previewUrl}
      alt=""
      fill
      unoptimized
      className="object-cover"
      onError={handleImageError}
    />
  ) : loading && isPreviewableImage(file.contentType) ? (
    <Skeleton className="size-full rounded-lg" />
  ) : (
    <HugeiconsIcon
      icon={File01Icon}
      className="size-6 text-muted-foreground"
      strokeWidth={1.5}
    />
  )

  const box = cn(
    "relative shrink-0 overflow-hidden rounded-lg",
    size === "md" ? "size-11" : "size-8"
  )

  if (!onClick) {
    return <span className={box}>{inner}</span>
  }

  return (
    <Button
      type="button"
      variant="outline"
      size={iconSize}
      onClick={onClick}
      className="relative shrink-0 overflow-hidden rounded-lg"
    >
      {inner}
    </Button>
  )
}

export function BucketFilePreviewImage({
  bucketId,
  file,
  className,
}: {
  bucketId: string
  file: FilePublic
  className?: string
}) {
  const t = useTranslations("bucket")
  const { previewUrl, loading, error, handleImageError } = useBucketFilePreview(
    bucketId,
    file
  )

  if (!isPreviewableImage(file.contentType)) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <Badge variant="secondary">{fileTypeChip(file.contentType, file.path)}</Badge>
        <p className="text-xs text-muted-foreground">{file.contentType}</p>
      </div>
    )
  }

  if (loading) {
    return (
      <Skeleton
        className={cn("h-full w-full rounded-xl", className)}
      />
    )
  }

  if (error || !previewUrl) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        {t("previewFailed")}
      </p>
    )
  }

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden rounded-xl bg-muted/20",
        className
      )}
    >
      <Image
        src={previewUrl}
        alt=""
        fill
        unoptimized
        className="object-contain"
        onError={handleImageError}
      />
    </div>
  )
}

