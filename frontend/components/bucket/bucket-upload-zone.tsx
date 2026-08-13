"use client"

import { useCallback, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { Upload01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  formatBytes,
  mapBucketError,
  MAX_FILE_BYTES,
} from "@/lib/bucket/bucket"
import { prepareUploadFile, uploadValidationError } from "@/lib/bucket/prepare-upload"
import { cn } from "@/lib/utils"

type UploadPhase = "idle" | "busy"

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
            : t("errInvalidFormat")
      }

      setStatusLabel(t("uploadPreparing"))
      onFileProgress(5)

      const prepared = await prepareUploadFile(raw)
      setStatusLabel(prepared.file.name)
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

  const handleFileList = async (files: FileList | null) => {
    if (!files || files.length === 0 || disabled || busy) return

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
    if (!disabled && !busy) setDragOver(true)
  }

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (disabled || busy) return
    void handleFileList(e.dataTransfer.files)
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="*/*"
        multiple
        className="hidden"
        disabled={disabled || busy}
        onChange={(e) => void handleFileList(e.target.files)}
      />

      <div
        role="button"
        tabIndex={disabled || busy ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            if (!disabled && !busy) inputRef.current?.click()
          }
        }}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => {
          if (!disabled && !busy) inputRef.current?.click()
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors",
          dragOver && !disabled && !busy
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/40",
          (disabled || busy) && "pointer-events-none opacity-60"
        )}
      >
        <HugeiconsIcon
          icon={Upload01Icon}
          className="size-8 text-muted-foreground"
          strokeWidth={1.5}
        />
        <p className="text-sm font-medium">
          {busy ? t("uploading") : t("uploadDropHint")}
        </p>
        {!busy && (
          <p className="text-[11px] text-muted-foreground">
            {t("uploadHint", { max: formatBytes(MAX_FILE_BYTES) })}
          </p>
        )}
      </div>

      {busy && (
        <div className="space-y-1.5 rounded-xl bg-muted/30 px-3 py-2.5">
          {statusLabel && (
            <p className="truncate text-xs text-muted-foreground">{statusLabel}</p>
          )}
          <Progress
            value={progress}
            max={100}
            className="gap-0 [&_[data-slot=progress-track]]:h-1.5"
          />
          <p className="text-right text-[10px] tabular-nums text-muted-foreground">
            {Math.round(progress)}%
          </p>
        </div>
      )}

      {!busy && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation()
            inputRef.current?.click()
          }}
        >
          {t("uploadChooseFiles")}
        </Button>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
