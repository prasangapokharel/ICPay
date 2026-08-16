"use client"

import Image from "next/image"
import { useTranslations } from "next-intl"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { fileTypeChip } from "@/lib/bucket/bucket"
import { useBucketFilePreview } from "@/hooks/use-bucket-file-preview"
import { cn } from "@/lib/utils"
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
  const chip = fileTypeChip(file.contentType, file.path)
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
    <span className="text-xs font-bold uppercase text-muted-foreground">
      {chip.slice(0, 3)}
    </span>
  )

  return (
    <Button
      type="button"
      variant="outline"
      size={iconSize}
      onClick={onClick}
      disabled={!onClick}
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
      <div className="flex flex-col items-center justify-center gap-2 py-16">
        <Badge variant="secondary">{fileTypeChip(file.contentType, file.path)}</Badge>
        <p className="text-xs text-muted-foreground">{file.contentType}</p>
      </div>
    )
  }

  if (loading) {
    return (
      <Skeleton
        className={cn("mx-auto aspect-video w-full max-h-[60vh] rounded-xl", className)}
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
        "relative mx-auto aspect-video w-full max-h-[60vh] overflow-hidden rounded-xl bg-muted/20",
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

export function BucketAvatarChip({ name }: { name: string }) {
  const initials = name.slice(0, 2).toUpperCase()
  return (
    <Avatar size="sm">
      <AvatarFallback className="text-xs font-bold text-primary">{initials}</AvatarFallback>
    </Avatar>
  )
}
