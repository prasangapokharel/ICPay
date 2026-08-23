"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { AppIcon } from "@/components/ui/app-icon"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { BucketFileDeleteDialog } from "@/components/bucket/bucket-file-delete-dialog"
import { optionalText, mapBucketError } from "@/lib/bucket/bucket"
import { normalizePublicFileUrl } from "@/lib/bucket/filePreview"
import { copyText } from "@/lib/wallet/utils"
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
  const [confirmOpen, setConfirmOpen] = useState(false)
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
    setDeleting(false)
    if (err) {
      setDeleteError(mapBucketError(err, t))
      return
    }
    setConfirmOpen(false)
  }

  return (
    <>
      <div className="flex min-w-0 items-start gap-2 px-3 py-2.5">
        <BucketFileThumb
          bucketId={bucketId}
          file={file}
          onClick={() => onPreview(file)}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-auto min-h-0 min-w-0 flex-1 basis-0 items-start justify-start overflow-hidden py-0.5 font-normal"
          onClick={() => onPreview(file)}
        >
          <span className="flex min-w-0 flex-col gap-0.5 overflow-hidden text-left">
            <span className="truncate text-sm font-medium leading-snug" title={fileName}>
              {fileName}
            </span>
            <span className="truncate text-xs leading-snug text-muted-foreground" title={file.contentType}>
              {formatFileSize(file.size)} · {file.contentType}
            </span>
            {deleteError && (
              <span className="truncate text-xs text-destructive">{deleteError}</span>
            )}
          </span>
        </Button>
        <ButtonGroup className="shrink-0 self-center">
          {publicUrl && (
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label={copied ? tc("copied") : tc("copy")}
              onClick={handleCopy}
            >
              <AppIcon name={copied ? "check" : "copy"} size={16} />
            </Button>
          )}
          {canWrite && (
            <Button
              type="button"
              variant="destructive"
              size="icon-sm"
              aria-label={t("delete")}
              disabled={deleting}
              onClick={() => setConfirmOpen(true)}
            >
              <AppIcon name="delete" size={16} />
            </Button>
          )}
        </ButtonGroup>
      </div>

      <BucketFileDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        fileName={fileName}
        deleting={deleting}
        onConfirm={handleDelete}
      />
    </>
  )
}
