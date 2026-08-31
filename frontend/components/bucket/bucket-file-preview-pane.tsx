"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Copy01Icon,
  Delete02Icon,
  Download01Icon,
  LinkSquare02Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { BucketFileDeleteDialog } from "@/components/bucket/bucket-file-delete-dialog"
import { BucketFilePreviewImage } from "@/components/bucket/bucket-file-thumb"
import { formatFileSize } from "@/components/bucket/bucket-card"
import { mapBucketError, optionalText } from "@/lib/bucket/bucket"
import { downloadBlob, fetchBucketFileBlob, normalizePublicFileUrl } from "@/lib/bucket/filePreview"
import { copyText } from "@/lib/wallet/utils"
import { useAuth } from "@/components/auth/auth-provider"
import type { FilePublic } from "@/services/bucket/types"

export function BucketFilePreviewPane({
  bucketId,
  file,
  canWrite,
  onDelete,
  onDeleted,
}: {
  bucketId: string
  file: FilePublic
  canWrite: boolean
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
    onDeleted?.()
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <DrawerHeader className="border-b pb-4 text-left">
        <DrawerTitle className="truncate" title={fileName}>
          {fileName}
        </DrawerTitle>
        <DrawerDescription>
          {formatFileSize(file.size)} · {file.contentType}
          {publicUrl ? ` · ${t("public")}` : ` · ${t("private")}`}
        </DrawerDescription>
      </DrawerHeader>

      <div className="flex min-h-0 flex-1 items-center justify-center px-4 py-3">
        <BucketFilePreviewImage
          bucketId={bucketId}
          file={file}
          className="h-full max-h-full w-full"
        />
      </div>

      {deleteError && (
        <Alert variant="destructive" className="mx-4 mb-2">
          <AlertDescription>{deleteError}</AlertDescription>
        </Alert>
      )}
      {downloadError && (
        <Alert variant="destructive" className="mx-4 mb-2">
          <AlertDescription>{downloadError}</AlertDescription>
        </Alert>
      )}

      <DrawerFooter className="border-t pt-4">
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" size="sm" disabled={downloading} onClick={handleDownload}>
            <HugeiconsIcon icon={Download01Icon} className="size-4" strokeWidth={1.75} />
            {t("download")}
          </Button>
          {publicUrl ? (
            <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
              <HugeiconsIcon icon={copied ? Tick02Icon : Copy01Icon} className="size-4" strokeWidth={1.75} />
              {copied ? tc("copied") : t("copyUrl")}
            </Button>
          ) : null}
          {publicUrl ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.open(publicUrl, "_blank", "noopener,noreferrer")}
            >
              <HugeiconsIcon icon={LinkSquare02Icon} className="size-4" strokeWidth={1.75} />
              {t("openInNewTab")}
            </Button>
          ) : null}
          {canWrite ? (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={deleting}
              onClick={() => setDeleteOpen(true)}
            >
              <HugeiconsIcon icon={Delete02Icon} className="size-4" strokeWidth={1.75} />
              {t("delete")}
            </Button>
          ) : null}
        </div>
      </DrawerFooter>

      <BucketFileDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        fileName={fileName}
        deleting={deleting}
        onConfirm={handleDelete}
      />
    </div>
  )
}
