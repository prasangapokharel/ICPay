// frontend/hooks/feature/useFeature.ts
// SWR wrapper — cache key + revalidation.

"use client"

import useSWR from "swr"
import { getFeature } from "@/services/feature/feature"

export function useFeature(id: string | undefined) {
  return useSWR(
    id ? ["feature", id] : null,
    () => getFeature(id!).then((r) => (r.ok ? r.value : Promise.reject(r.error))),
  )
}
