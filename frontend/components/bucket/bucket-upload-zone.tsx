"use client"

import { useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress, ProgressIndicator, ProgressTrack } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import {
  formatBytes,
  mapBucketError,
  MAX_FILE_BYTES,
} from "@/lib/bucket/bucket"
import { prepareUploadFile, uploadValidationError } from "@/lib/bucket/prepare-upload"

type UploadPhase = "idle" | "preparing" | "uploading"

export function BucketUploadZone({
  disabled,
  onUpload,
  onSuccess,
  onBusyChange,
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
}) {
  const t = useTranslations("bucket")
  const inputRef = useRef<HTMLInputElement>(null)
  const [phase, setPhase] = useState<UploadPhase>("idle")
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const uploading = phase !== "idle"

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || disabled) return
    const raw = files[0]

    const validation = uploadValidationError(raw)
    if (validation) {
      setError(
        validation === "size"
          ? t("invalidFile")
          : validation === "video"
            ? t("errVideoBlocked")
            : t("errInvalidFormat")
      )
      return
    }

    setPhase("preparing")
    setProgress(18)
    setError(null)
    setFileName(raw.name)
    onBusyChange?.(true)

    let prepTimer: ReturnType<typeof setInterval> | null = null
    prepTimer = setInterval(() => {
      setProgress((p) => (p < 42 ? p + 3 : p))
    }, 120)

    try {
      const prepared = await prepareUploadFile(raw)
      if (prepTimer) clearInterval(prepTimer)
      setPhase("uploading")
      setProgress(45)
      setFileName(prepared.file.name)

      const err = await onUpload(
        prepared.file,
        prepared.path,
        prepared.contentType,
        (pct) => setProgress(45 + Math.round(pct * 0.55))
      )
      if (err) {
        setError(mapBucketError(err, t))
        return
      }
      setProgress(100)
      onSuccess?.()
    } catch (e) {
      if (prepTimer) clearInterval(prepTimer)
      const msg = e instanceof Error ? e.message : ""
      setError(msg ? mapBucketError(msg, t) : t("uploadFailed"))
    } finally {
      if (prepTimer) clearInterval(prepTimer)
      setPhase("idle")
      setProgress(0)
      setFileName(null)
      onBusyChange?.(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="*/*"
        className="hidden"
        disabled={disabled || uploading}
        onChange={(e) => handleFiles(e.target.files)}
      />
      <Button
        type="button"
        className="w-full"
        disabled={disabled || uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? t("uploading") : t("uploadChooseFile")}
      </Button>

      {uploading && (
        <div className="space-y-2 rounded-xl bg-muted/30 px-3 py-2.5">
          <div className="flex items-center gap-2">
            {phase === "preparing" && <Spinner className="size-3.5 shrink-0" />}
            <p className="min-w-0 truncate text-xs text-muted-foreground">
              {phase === "preparing" ? t("uploadPreparing") : fileName}
            </p>
          </div>
          {phase === "uploading" && (
            <Progress value={progress} max={100} className="gap-0">
              <ProgressTrack className="h-1">
                <ProgressIndicator />
              </ProgressTrack>
            </Progress>
          )}
        </div>
      )}

      <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
        {t("uploadHint", { max: formatBytes(MAX_FILE_BYTES) })}
      </p>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
