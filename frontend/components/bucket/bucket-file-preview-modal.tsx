"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { LinkSquare02Icon } from "@hugeicons/core-free-icons"
import { AppIcon } from "@/components/ui/app-icon"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { BucketFileDeleteDialog } from "@/components/bucket/bucket-file-delete-dialog"
import { BucketFilePreviewImage } from "@/components/bucket/bucket-file-thumb"
import { formatFileSize } from "@/components/bucket/bucket-card"
import { mapBucketError, optionalText } from "@/lib/bucket/bucket"
import { downloadBlob, fetchBucketFileBlob, normalizePublicFileUrl } from "@/lib/bucket/filePreview"
import { copyText } from "@/lib/wallet/utils"
import { useAuth } from "@/components/auth/auth-provider"
import type { FilePublic } from "@/services/bucket/types"

export function BucketFilePreviewModal({
  bucketId,
  file,
  canWrite,
  open,
  onOpenChange,
  onDelete,
  onDeleted,
}: {
  bucketId: string
  file: FilePublic | null
  canWrite: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  onDelete: (path: string) => Promise<string | null>
  onDeleted?: () => void
}) {
  const t = useTranslations("bucket")
  const tc = useTranslations("common")
  const { identity } = useAuth()
  const [copied, setCopied] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  if (!file) return null

  const fileName = file.path.split("/").pop() ?? file.path
  const publicRaw = optionalText(file.publicUrl)
  const publicUrl = publicRaw ? normalizePublicFileUrl(publicRaw) : null

  const handleCopy = async () => {
    if (!publicUrl) return
    await copyText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = async () => {
    setDownloading(true)
    setDownloadError(null)
    try {
      const blob = await fetchBucketFileBlob({
        publicUrl,
        identity,
        bucketId,
        path: file.path,
        contentType: file.contentType,
      })
      downloadBlob(blob, fileName)
    } catch {
      setDownloadError(t("downloadFailed"))
    } finally {
      setDownloading(false)
    }
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
    setDeleteOpen(false)
    onOpenChange(false)
    onDeleted?.()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-4 sm:max-w-2xl" showCloseButton>
        <DialogHeader>
          <DialogTitle className="truncate pr-8" title={fileName}>
            {fileName}
          </DialogTitle>
          <DialogDescription>
            {formatFileSize(file.size)} · {file.contentType}
            {publicUrl ? ` · ${t("public")}` : ` · ${t("private")}`}
          </DialogDescription>
        </DialogHeader>

        <BucketFilePreviewImage bucketId={bucketId} file={file} />

        {deleteError && (
          <Alert variant="destructive">
            <AlertDescription>{deleteError}</AlertDescription>
          </Alert>
        )}
        {downloadError && (
          <Alert variant="destructive">
            <AlertDescription>{downloadError}</AlertDescription>
          </Alert>
        )}

        <ButtonGroup className="mx-auto flex-wrap justify-center">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label={t("download")}
            disabled={downloading}
            onClick={handleDownload}
          >
            <AppIcon name="download" size={16} />
          </Button>
          {publicUrl && (
            <>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label={copied ? tc("copied") : tc("copy")}
                onClick={handleCopy}
              >
                <AppIcon name={copied ? "check" : "copy"} size={16} />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label={t("openInNewTab")}
                onClick={() => window.open(publicUrl, "_blank", "noopener,noreferrer")}
              >
              <HugeiconsIcon icon={LinkSquare02Icon} className="size-4" strokeWidth={1.75} />
              </Button>
            </>
          )}
          {canWrite && (
            <Button
              type="button"
              variant="destructive"
              size="icon-sm"
              aria-label={t("delete")}
              disabled={deleting}
              onClick={() => setDeleteOpen(true)}
            >
              <AppIcon name="delete" size={16} />
            </Button>
          )}
        </ButtonGroup>
      </DialogContent>
      </Dialog>

      <BucketFileDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        fileName={fileName}
        deleting={deleting}
        onConfirm={handleDelete}
      />
    </>
  )
}
