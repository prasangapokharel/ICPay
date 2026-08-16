"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { BucketUploadZone } from "@/components/bucket/bucket-upload-zone"
import { formatBytes, MAX_FILE_BYTES } from "@/lib/bucket/bucket"

export function BucketUploadModal({
  open,
  onOpenChange,
  disabled,
  onUpload,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  disabled: boolean
  onUpload: (
    file: File,
    path: string,
    contentType: string,
    onProgress?: (pct: number) => void
  ) => Promise<string | null>
}) {
  const t = useTranslations("bucket")
  const [busy, setBusy] = useState(false)

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (busy) return
        onOpenChange(next)
      }}
    >
      <DialogContent className="max-w-sm gap-3" showCloseButton>
        <DialogHeader className="gap-1">
          <DialogTitle>{t("upload")}</DialogTitle>
          <DialogDescription className="text-xs leading-relaxed">
            {t("uploadHint", { max: formatBytes(MAX_FILE_BYTES) })}
          </DialogDescription>
        </DialogHeader>
        <BucketUploadZone
          disabled={disabled}
          showHint={false}
          onUpload={onUpload}
          onBusyChange={setBusy}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
