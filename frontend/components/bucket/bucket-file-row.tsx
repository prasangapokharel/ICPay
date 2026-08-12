"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Copy01Icon, Delete02Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { BucketIconAction } from "@/components/bucket/bucket-icon-action"
import { optionalText, mapBucketError } from "@/lib/bucket/bucket"
import { normalizePublicFileUrl } from "@/lib/bucket/file-preview"
import { copyText } from "@/lib/wallet-utils"
import { formatFileSize } from "@/components/bucket/bucket-card"
import { BucketFileThumb } from "@/components/bucket/bucket-file-thumb"
import type { FilePublic } from "@/services/bucket/types"

export function BucketFileRow({
  bucketId,
  file,
  canWrite,
  onDelete,
  onPreview,
}: {
  bucketId: string
  file: FilePublic
  canWrite: boolean
  onDelete: (path: string) => Promise<string | null>
  onPreview: (file: FilePublic) => void
}) {
  const t = useTranslations("bucket")
  const tc = useTranslations("common")
  const [copied, setCopied] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const publicRaw = optionalText(file.publicUrl)
  const publicUrl = publicRaw ? normalizePublicFileUrl(publicRaw) : null
  const fileName = file.path.split("/").pop() ?? file.path

  const handleCopy = async () => {
    if (!publicUrl) return
    await copyText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDelete = async () => {
    setDeleting(true)
    setDeleteError(null)
    const err = await onDelete(file.path)
    if (err) setDeleteError(mapBucketError(err, t))
    setDeleting(false)
  }

  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5">
      <BucketFileThumb
        bucketId={bucketId}
        file={file}
        onClick={() => onPreview(file)}
      />
      <button
        type="button"
        className="min-w-0 flex-1 text-left"
        onClick={() => onPreview(file)}
      >
        <p className="truncate text-sm font-medium">{fileName}</p>
        <p className="truncate text-[10px] text-muted-foreground">
          {formatFileSize(file.size)} · {file.contentType}
        </p>
        {deleteError && (
          <p className="mt-0.5 text-[10px] text-destructive">{deleteError}</p>
        )}
      </button>
      {publicUrl && (
        <BucketIconAction
          icon={copied ? Tick02Icon : Copy01Icon}
          label={copied ? tc("copied") : tc("copy")}
          variant="outline"
          onClick={handleCopy}
        />
      )}
      {canWrite && (
        <BucketIconAction
          icon={Delete02Icon}
          label={deleting ? tc("loading") : t("delete")}
          destructive
          disabled={deleting}
          onClick={handleDelete}
        />
      )}
    </div>
  )
}
