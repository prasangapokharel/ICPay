"use client"

import { useSyncExternalStore } from "react"
import {
  listSavedCanisterEntries,
  listSavedCanisters,
  subscribeSavedCanisters,
  type SavedCanister,
} from "@/lib/canister/savedCanisters"

export function useSavedCanisters(principal: string | null | undefined): string[] {
  const key = principal ?? ""
  const snapshot = useSyncExternalStore(
    subscribeSavedCanisters,
    () => listSavedCanisters(key).join("\n"),
    () => ""
  )
  if (!snapshot) return []
  return snapshot.split("\n")
}

export function useSavedCanisterEntries(
  principal: string | null | undefined
): SavedCanister[] {
  const key = principal ?? ""
  const snapshot = useSyncExternalStore(
    subscribeSavedCanisters,
    () =>
      JSON.stringify(
        listSavedCanisterEntries(key).map((e) => ({ id: e.id, name: e.name }))
      ),
    () => "[]"
  )
  try {
    const parsed = JSON.parse(snapshot) as SavedCanister[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
