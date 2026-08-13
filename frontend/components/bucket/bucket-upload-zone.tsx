"use client"

import { useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  FILE_ACCEPT,
  formatBytes,
  isAllowedUpload,
  mapBucketError,
  MAX_FILE_BYTES,
} from "@/lib/bucket/bucket"
import { formatCompressionSummary } from "@/lib/bucket/compress-image"
import { prepareUploadFile } from "@/lib/bucket/prepare-upload"

export function BucketUploadZone({
  disabled,
  onUpload,
}: {
  disabled: boolean
  onUpload: (
    file: File,
    path: string,
    contentType: string,
    onProgress?: (pct: number) => void
  ) => Promise<string | null>
}) {
  const t = useTranslations("bucket")
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [compressNote, setCompressNote] = useState<string | null>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || disabled) return
    const raw = files[0]
    if (!isAllowedUpload(raw)) {
      setError(
        raw.size > MAX_FILE_BYTES
          ? t("invalidFile")
          : t("errInvalidFormat")
      )
      return
    }
    setUploading(true)
    setProgress(0)
    setError(null)
    setCompressNote(null)
    setFileName(raw.name)
    try {
      const prepared = await prepareUploadFile(raw)
      if (prepared.compression) {
        setCompressNote(
          formatCompressionSummary(
            prepared.compression.originalBytes,
            prepared.compression.compressedBytes,
          ),
        )
        setFileName(prepared.file.name)
      }
      const err = await onUpload(
        prepared.file,
        prepared.path,
        prepared.contentType,
        setProgress
      )
      if (err) setError(mapBucketError(err, t))
    } catch (e) {
      const msg = e instanceof Error ? e.message : ""
      setError(msg ? mapBucketError(msg, t) : t("uploadFailed"))
    } finally {
      setUploading(false)
      setProgress(0)
      setFileName(null)
      setCompressNote(null)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-2 rounded-xl border border-dashed bg-muted/20 p-3 sm:p-4">
      <input
        ref={inputRef}
        type="file"
        accept={FILE_ACCEPT}
        className="hidden"
        disabled={disabled || uploading}
        onChange={(e) => handleFiles(e.target.files)}
      />
      <Button
        type="button"
        size="sm"
        className="w-full"
        disabled={disabled || uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? t("uploading") : t("upload")}
      </Button>
      {uploading && (
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
            <span className="truncate">{fileName ?? t("uploading")}</span>
            <span className="shrink-0 tabular-nums">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} max={100} />
        </div>
      )}
      <p className="text-center text-[10px] leading-relaxed text-muted-foreground sm:text-xs">
        {t("uploadHint", { max: formatBytes(MAX_FILE_BYTES) })}
      </p>
      {compressNote && !error && (
        <p className="text-center text-[10px] text-muted-foreground sm:text-xs">{compressNote}</p>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
