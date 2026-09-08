"use client"

import { useCallback, useRef, useState } from "react"
import type { BucketUploadItem } from "@/components/bucket/bucket-upload-dock"
import { prepareUploadFile, uploadValidationError } from "@/lib/bucket/prepareUpload"
import { shouldEmitUploadProgress } from "@/lib/bucket/uploadProgress"

const FILE_CONCURRENCY = 2

function nextUploadId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

type UploadJob = { id: string; file: File }

export function useBucketUpload({
  pathPrefix,
  onUpload,
  onSuccess,
  labels,
  mapApiError,
}: {
  pathPrefix: string
  onUpload: (
    file: File,
    path: string,
    contentType: string,
    onProgress?: (pct: number) => void
  ) => Promise<string | null>
  onSuccess?: () => void
  labels: {
    size: string
    video: string
    blocked: string
    format: string
    failed: string
  }
  mapApiError: (message: string) => string
}) {
  const [items, setItems] = useState<BucketUploadItem[]>([])
  const [expanded, setExpanded] = useState(true)
  const queueRef = useRef<UploadJob[]>([])
  const activeRef = useRef(0)
  const progressRef = useRef<Map<string, number>>(new Map())
  const pendingProgressRef = useRef<Map<string, number>>(new Map())
  const rafRef = useRef<number | null>(null)

  const flushProgress = useCallback(() => {
    if (rafRef.current != null) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      const pending = pendingProgressRef.current
      if (pending.size === 0) return
      setItems((prev) =>
        prev.map((item) => {
          const progress = pending.get(item.id)
          return progress != null ? { ...item, progress } : item
        })
      )
      pending.clear()
    })
  }, [])

  const patch = useCallback((id: string, partial: Partial<BucketUploadItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...partial } : item)))
  }, [])

  const patchProgress = useCallback(
    (id: string, progress: number) => {
      const prev = progressRef.current.get(id) ?? 0
      if (!shouldEmitUploadProgress(prev, progress)) return
      progressRef.current.set(id, progress)
      pendingProgressRef.current.set(id, progress)
      flushProgress()
    },
    [flushProgress]
  )

  const validationMessage = useCallback(
    (code: NonNullable<ReturnType<typeof uploadValidationError>>) => {
      if (code === "size") return labels.size
      if (code === "video") return labels.video
      if (code === "blocked") return labels.blocked
      return labels.format
    },
    [labels]
  )

  const runJob = useCallback(
    async (job: UploadJob) => {
      const { id, file } = job
      const invalid = uploadValidationError(file)
      if (invalid) {
        patch(id, { status: "error", progress: 0, error: validationMessage(invalid) })
        return
      }

      patch(id, { status: "uploading", progress: 8 })

      try {
        const prepared = await prepareUploadFile(file, pathPrefix)
        patch(id, { name: prepared.file.name, progress: 12 })

        const err = await onUpload(
          prepared.file,
          prepared.path,
          prepared.contentType,
          (pct) => patchProgress(id, pct)
        )
        if (err) {
          patch(id, { status: "error", error: mapApiError(err) })
          return
        }

        progressRef.current.set(id, 100)
        patch(id, { status: "done", progress: 100 })
        onSuccess?.()
      } catch (e) {
        const msg = e instanceof Error ? e.message : ""
        patch(id, {
          status: "error",
          error: msg ? mapApiError(msg) : labels.failed,
        })
      } finally {
        progressRef.current.delete(id)
        pendingProgressRef.current.delete(id)
      }
    },
    [labels.failed, mapApiError, onSuccess, onUpload, patch, patchProgress, pathPrefix, validationMessage]
  )

  const scheduleWork = useCallback(() => {
    const launch = () => {
      while (activeRef.current < FILE_CONCURRENCY && queueRef.current.length > 0) {
        const job = queueRef.current.shift()
        if (!job) break
        activeRef.current += 1
        void runJob(job).finally(() => {
          activeRef.current -= 1
          launch()
        })
      }
    }
    launch()
  }, [runJob])

  const enqueue = useCallback(
    (list: FileList) => {
      const jobs: UploadJob[] = []
      const added: BucketUploadItem[] = []
      for (const file of Array.from(list)) {
        const id = nextUploadId()
        jobs.push({ id, file })
        added.push({ id, name: file.name, progress: 0, status: "queued" })
      }
      if (jobs.length === 0) return
      queueRef.current.push(...jobs)
      setItems((prev) => [...prev, ...added])
      setExpanded(true)
      scheduleWork()
    },
    [scheduleWork]
  )

  const dismiss = useCallback(() => {
    const busy = items.some((item) => item.status === "queued" || item.status === "uploading")
    if (busy) return
    queueRef.current = []
    progressRef.current.clear()
    pendingProgressRef.current.clear()
    setItems([])
  }, [items])

  const busy = items.some((item) => item.status === "queued" || item.status === "uploading")
  const doneCount = items.filter((item) => item.status === "done").length

  return {
    items,
    expanded,
    busy,
    doneCount,
    enqueue,
    dismiss,
    setExpanded,
  }
}
