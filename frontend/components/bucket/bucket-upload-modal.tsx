"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { BucketUploadZone } from "@/components/bucket/bucket-upload-zone"

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
      <DialogContent className="max-w-sm gap-4">
        <DialogHeader>
          <DialogTitle>{t("upload")}</DialogTitle>
        </DialogHeader>
        <BucketUploadZone
          disabled={disabled}
          onUpload={onUpload}
          onBusyChange={setBusy}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
