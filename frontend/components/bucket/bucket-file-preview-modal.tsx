"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import {
  Copy01Icon,
  Delete02Icon,
  Download01Icon,
  LinkSquare02Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { BucketIconAction } from "@/components/bucket/bucket-icon-action"
import { BucketFilePreviewImage } from "@/components/bucket/bucket-file-thumb"
import { formatFileSize } from "@/components/bucket/bucket-card"
import { mapBucketError, optionalText } from "@/lib/bucket/bucket"
import { downloadBlob, fetchBucketFileBlob, normalizePublicFileUrl } from "@/lib/bucket/file-preview"
import { copyText } from "@/lib/wallet-utils"
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
    onOpenChange(false)
    onDeleted?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-4 sm:max-w-2xl" showCloseButton>
        <DialogHeader>
          <DialogTitle className="truncate pr-8">{fileName}</DialogTitle>
          <DialogDescription>
            {formatFileSize(file.size)} · {file.contentType}
            {publicUrl ? ` · ${t("public")}` : ` · ${t("private")}`}
          </DialogDescription>
        </DialogHeader>

        <BucketFilePreviewImage bucketId={bucketId} file={file} />

        {deleteError && (
          <p className="text-center text-xs text-destructive">{deleteError}</p>
        )}
        {downloadError && (
          <p className="text-center text-xs text-destructive">{downloadError}</p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-1">
          <BucketIconAction
            icon={Download01Icon}
            label={t("download")}
            variant="outline"
            disabled={downloading}
            onClick={handleDownload}
          />
          {publicUrl && (
            <>
              <BucketIconAction
                icon={copied ? Tick02Icon : Copy01Icon}
                label={copied ? tc("copied") : tc("copy")}
                variant="outline"
                onClick={handleCopy}
              />
              <BucketIconAction
                icon={LinkSquare02Icon}
                label={t("openInNewTab")}
                variant="outline"
                onClick={() => window.open(publicUrl, "_blank", "noopener,noreferrer")}
              />
            </>
          )}
          {canWrite && (
            <BucketIconAction
              icon={Delete02Icon}
              label={t("delete")}
              destructive
              disabled={deleting}
              onClick={handleDelete}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
