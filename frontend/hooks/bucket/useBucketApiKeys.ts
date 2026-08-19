"use client"

import useSWR from "swr"
import { useAuth } from "@/components/auth/auth-provider"
import { bucketApiKeysKey } from "@/lib/bucket/cacheKeys"
import { BUCKET_QUERY } from "@/hooks/bucket/useBucket"
import {
  createApiKey,
  listApiKeys,
  revokeApiKey,
} from "@/services/bucket/bucket"
import type {
  ApiKeyCreateResult,
  ApiKeyPermissions,
  ApiKeyPublic,
} from "@/services/bucket/types"
import type { Outcome } from "@/services/client"

export function useBucketApiKeys(bucketId: string | null, enabled = true) {
  const { identity } = useAuth()
  const key = bucketId && enabled ? bucketApiKeysKey(identity, bucketId) : null

  const { data, isLoading, mutate } = useSWR<ApiKeyPublic[]>(
    key,
    () => listApiKeys(identity, bucketId!),
    { ...BUCKET_QUERY, keepPreviousData: true, dedupingInterval: 30_000 }
  )

  return {
    keys: data ?? [],
    isLoading,
    refresh: mutate,
    createKey: (
      name: string,
      permissions: ApiKeyPermissions
    ): Promise<Outcome<ApiKeyCreateResult>> =>
      createApiKey(identity, bucketId!, name, permissions),
    revokeKey: (keyId: string) => revokeApiKey(identity, bucketId!, keyId),
  }
}
