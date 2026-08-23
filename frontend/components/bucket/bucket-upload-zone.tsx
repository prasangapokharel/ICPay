"use client"

import { useCallback, useId, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { AppIcon } from "@/components/ui/app-icon"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress"
import {
  formatBytes,
  mapBucketError,
  MAX_FILE_BYTES,
} from "@/lib/bucket/bucket"
import { prepareUploadFile, uploadValidationError } from "@/lib/bucket/prepareUpload"
import { formatCompressionSummary } from "@/lib/bucket/compressImage"
import {
  BucketUploadDesktopAlert,
  useBucketUploadDesktopOnly,
} from "@/components/bucket/bucket-upload-desktop-gate"
import { cn } from "@/lib/ui/utils"

type UploadPhase = "idle" | "busy"

export function BucketUploadZone({
  disabled,
  onUpload,
  onSuccess,
  onBusyChange,
  showHint = true,
}: {
  disabled: boolean
  onUpload: (
    file: File,
    path: string,
    contentType: string,
    onProgress?: (pct: number) => void
  ) => Promise<string | null>
  onSuccess?: () => void
  onBusyChange?: (busy: boolean) => void
  /** When false, the long format hint is omitted (e.g. shown in the dialog header instead). */
  showHint?: boolean
}) {
  const t = useTranslations("bucket")
  const inputId = useId()
  const { desktopOnly } = useBucketUploadDesktopOnly()
  const inputRef = useRef<HTMLInputElement>(null)
  const [phase, setPhase] = useState<UploadPhase>("idle")
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [statusLabel, setStatusLabel] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const busy = phase !== "idle"

  const resetInput = () => {
    if (inputRef.current) inputRef.current.value = ""
  }

  const uploadOne = useCallback(
    async (raw: File, onFileProgress: (pct: number) => void): Promise<string | null> => {
      const validation = uploadValidationError(raw)
      if (validation) {
        return validation === "size"
          ? t("invalidFile")
          : validation === "video"
            ? t("errVideoBlocked")
            : validation === "blocked"
              ? t("errScriptBlocked")
              : t("errInvalidFormat")
      }

      setStatusLabel(t("uploadPreparing"))
      onFileProgress(5)

      const prepared = await prepareUploadFile(raw)
      setStatusLabel(
        prepared.compression
          ? formatCompressionSummary(
              prepared.compression.originalBytes,
              prepared.compression.compressedBytes
            )
          : prepared.file.name
      )
      onFileProgress(10)

      const err = await onUpload(
        prepared.file,
        prepared.path,
        prepared.contentType,
        (pct) => onFileProgress(10 + Math.round(pct * 0.9))
      )
      return err
    },
    [onUpload, t]
  )

  const blocked = disabled || desktopOnly

  const handleFileList = async (files: FileList | null) => {
    if (desktopOnly || !files || files.length === 0 || disabled || busy) return

    const queue = Array.from(files)
    setPhase("busy")
    setProgress(0)
    setError(null)
    onBusyChange?.(true)

    try {
      for (let i = 0; i < queue.length; i++) {
        const raw = queue[i]
        if (queue.length > 1) {
          setStatusLabel(
            t("uploadProgress", {
              current: String(i + 1),
              total: String(queue.length),
              name: raw.name,
            })
          )
        } else {
          setStatusLabel(raw.name)
        }

        const err = await uploadOne(raw, (pct) => {
          const overall =
            queue.length === 1
              ? pct
              : Math.round(((i + pct / 100) / queue.length) * 100)
          setProgress(overall)
        })

        if (err) {
          setError(mapBucketError(err, t))
          return
        }
      }

      setProgress(100)
      onSuccess?.()
    } catch (e) {
      const msg = e instanceof Error ? e.message : ""
      setError(msg ? mapBucketError(msg, t) : t("uploadFailed"))
    } finally {
      setPhase("idle")
      setProgress(0)
      setStatusLabel(null)
      setDragOver(false)
      onBusyChange?.(false)
      resetInput()
    }
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!blocked && !busy) setDragOver(true)
  }

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (blocked || busy) return
    void handleFileList(e.dataTransfer.files)
  }

  if (desktopOnly) {
    return <BucketUploadDesktopAlert />
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="*/*"
        multiple
        className="sr-only"
        disabled={blocked || busy}
        onChange={(e) => void handleFileList(e.target.files)}
      />

      <label
        htmlFor={inputId}
        className={cn("block", (blocked || busy) && "pointer-events-none opacity-60")}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <Card
          size="sm"
          className={cn(
            "cursor-pointer border-dashed py-0 transition-colors",
            dragOver && !blocked && !busy && "border-primary bg-primary/5",
            busy && "border-primary/30"
          )}
        >
          <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-gray-800">
              <AppIcon name="upload" size={24} />
            </span>
            <p className="text-sm font-medium">
              {busy ? t("uploading") : t("uploadDropHint")}
            </p>
            {showHint && !busy && (
              <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
                {t("uploadHint", { max: formatBytes(MAX_FILE_BYTES) })}
              </p>
            )}
          </CardContent>
        </Card>
      </label>

      {busy && (
        <Progress value={progress}>
          {statusLabel ? <ProgressLabel>{statusLabel}</ProgressLabel> : null}
          <ProgressValue />
        </Progress>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
