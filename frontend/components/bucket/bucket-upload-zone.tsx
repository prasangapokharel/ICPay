"use client"

import { useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  FILE_ACCEPT,
  isAllowedUpload,
  mapBucketError,
} from "@/lib/bucket/bucket"
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

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || disabled) return
    const raw = files[0]
    if (!isAllowedUpload(raw)) {
      setError(t("invalidFile"))
      return
    }
    setUploading(true)
    setProgress(0)
    setError(null)
    try {
      const prepared = await prepareUploadFile(raw)
      setProgress(12)
      const err = await onUpload(
        prepared.file,
        prepared.path,
        prepared.contentType,
        setProgress
      )
      if (err) setError(mapBucketError(err, t))
    } catch {
      setError(t("invalidFile"))
    } finally {
      setUploading(false)
      setProgress(0)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-2">
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
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>{t("uploading")}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} max={100} />
        </div>
      )}
      <p className="text-center text-[10px] text-muted-foreground">{t("uploadHint")}</p>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
