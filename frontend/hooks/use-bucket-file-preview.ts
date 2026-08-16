"use client"

import { useCallback, useEffect, useState } from "react"
import useSWR from "swr"
import { useAuth } from "@/components/auth/auth-provider"
import { optionalText } from "@/lib/bucket/bucket"
import {
  bytesToObjectUrl,
  normalizePublicFileUrl,
  revokeObjectUrl,
} from "@/lib/bucket/file-preview"
import { bucketFilePreviewKey } from "@/lib/bucket/cache-keys"
import { BUCKET_QUERY } from "@/hooks/use-bucket"
import { downloadFileBlob } from "@/services/bucket/bucket"
import type { FilePublic } from "@/services/bucket/types"

export function useBucketFilePreview(bucketId: string, file: FilePublic | null) {
  const { identity } = useAuth()
  const publicRaw = file ? optionalText(file.publicUrl) : null
  const publicUrl = publicRaw ? normalizePublicFileUrl(publicRaw) : null
  const path = file?.path ?? ""

  // When CDN img load fails, fall back to canister download for this path only.
  const [cdnFailedPath, setCdnFailedPath] = useState<string | null>(null)
  const useCanister = !publicUrl || cdnFailedPath === path

  const swrKey =
    file && identity && useCanister
      ? bucketFilePreviewKey(identity, bucketId, file.path)
      : null

  const { data: blobUrl, isLoading, error, mutate } = useSWR(
    swrKey,
    async () => {
      const bytes = await downloadFileBlob(identity!, bucketId, file!.path)
      return bytesToObjectUrl(bytes, file!.contentType)
    },
    {
      ...BUCKET_QUERY,
      dedupingInterval: 120_000,
    }
  )

  useEffect(() => {
    return () => {
      revokeObjectUrl(blobUrl)
    }
  }, [blobUrl])

  const previewUrl = useCanister ? (blobUrl ?? null) : publicUrl
  const loading = useCanister && isLoading && !blobUrl

  const handleImageError = useCallback(() => {
    if (publicUrl && path) setCdnFailedPath(path)
  }, [publicUrl, path])

  const refresh = useCallback(async () => {
    if (useCanister) await mutate()
  }, [mutate, useCanister])

  return {
    previewUrl,
    publicUrl,
    loading,
    error,
    handleImageError,
    refresh,
    viaCanister: useCanister,
  }
}
