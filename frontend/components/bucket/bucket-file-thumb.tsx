"use client"

import Image from "next/image"
import { useTranslations } from "next-intl"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
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
  const chip = fileTypeChip(file.contentType)
  const dim = size === "md" ? "size-12" : "size-10"

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
    <span className="flex size-full items-center justify-center text-[10px] font-bold uppercase text-muted-foreground">
      {chip.slice(0, 3)}
    </span>
  )

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "relative shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted/40",
        dim,
        onClick && "cursor-pointer transition hover:ring-2 hover:ring-primary/40"
      )}
    >
      {inner}
      <Badge
        variant="secondary"
        className="pointer-events-none absolute -bottom-1 -right-1 h-4 px-1 text-[8px] font-bold uppercase tracking-wide"
      >
        {chip}
      </Badge>
    </button>
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
        <span className="rounded-xl bg-muted px-4 py-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          {fileTypeChip(file.contentType)}
        </span>
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
    <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/20 to-indigo-500/30 text-[10px] font-bold text-primary">
      {initials}
    </div>
  )
}
