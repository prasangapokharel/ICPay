"use client"

import { useEffect, useId, useRef } from "react"
import { createPortal } from "react-dom"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { Upload01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { FILE_ACCEPT, mapBucketError } from "@/lib/bucket/bucket"
import { clearLegacyBucketStorage } from "@/lib/bucket/legacyStorage"
import { useBucketUpload } from "@/hooks/bucket/useBucketUpload"
import {
  BucketUploadDesktopTrigger,
  useBucketUploadDesktopOnly,
} from "@/components/bucket/bucket-upload-desktop-gate"
import { BucketUploadDock } from "@/components/bucket/bucket-upload-dock"

export function BucketUploadControl({
  disabled,
  pathPrefix,
  onUpload,
  onSuccess,
}: {
  disabled: boolean
  pathPrefix: string
  onUpload: (
    file: File,
    path: string,
    contentType: string,
    onProgress?: (pct: number) => void
  ) => Promise<string | null>
  onSuccess?: () => void
}) {
  const t = useTranslations("bucket")
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const { desktopOnly } = useBucketUploadDesktopOnly()
  const blocked = disabled || desktopOnly

  useEffect(() => {
    clearLegacyBucketStorage()
  }, [])

  const { items, expanded, busy, doneCount, enqueue, dismiss, setExpanded } = useBucketUpload({
    pathPrefix,
    onUpload,
    onSuccess,
    labels: {
      size: t("invalidFile"),
      video: t("errVideoBlocked"),
      blocked: t("errScriptBlocked"),
      format: t("errInvalidFormat"),
      failed: t("uploadFailed"),
    },
    mapApiError: (err) => mapBucketError(err, t),
  })

  const dock =
    items.length > 0 ? (
      <BucketUploadDock
        items={items}
        expanded={expanded}
        title={busy ? t("uploading") : t("uploadSuccess")}
        uploadedLabel={t("uploadedCount", { count: String(doneCount) })}
        onToggle={() => setExpanded((v) => !v)}
        onDismiss={dismiss}
      />
    ) : null

  return (
    <>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={FILE_ACCEPT}
        multiple
        className="sr-only"
        disabled={blocked}
        onChange={(e) => {
          const list = e.target.files
          if (list?.length) enqueue(list)
          if (inputRef.current) inputRef.current.value = ""
        }}
      />

      <BucketUploadDesktopTrigger>
        <Button
          type="button"
          size="sm"
          disabled={blocked}
          onClick={() => inputRef.current?.click()}
        >
          <HugeiconsIcon icon={Upload01Icon} className="size-4" strokeWidth={1.75} />
          {t("upload")}
        </Button>
      </BucketUploadDesktopTrigger>

      {dock && typeof document !== "undefined" ? createPortal(dock, document.body) : null}
    </>
  )
}
