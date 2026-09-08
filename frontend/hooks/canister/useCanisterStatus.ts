"use client"

import { useEffect, useState } from "react"
import type { Identity } from "@icp-sdk/core/agent"
import {
  fetchCanisterStatus,
  formatManageError,
  isControllerDenied,
  type CanisterStatusView,
} from "@/services/canister/management"
import { rememberCanister } from "@/lib/canister/savedCanisters"

export type CanisterStatusState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ok"; data: CanisterStatusView }
  | { kind: "denied"; message: string }
  | { kind: "error"; message: string }

export function useCanisterStatus(
  identity: Identity | null | undefined,
  canisterId: string,
  enabled: boolean
): CanisterStatusState & { refresh: () => void } {
  const trimmed = canisterId.trim()
  const active = Boolean(enabled && identity && trimmed)
  const [tick, setTick] = useState(0)
  const [cache, setCache] = useState<{ id: string; state: CanisterStatusState } | null>(
    null
  )

  useEffect(() => {
    if (!active || !identity) return
    const id = trimmed
    let cancelled = false
    const timer = window.setTimeout(() => {
      void (async () => {
        setCache({ id, state: { kind: "loading" } })
        try {
          const data = await fetchCanisterStatus(identity, id)
          if (!cancelled) {
            if (data.isController) rememberCanister(identity.getPrincipal().toText(), id)
            setCache({ id, state: { kind: "ok", data } })
          }
        } catch (e) {
          if (cancelled) return
          const message = formatManageError(e)
          setCache({
            id,
            state: isControllerDenied(e)
              ? { kind: "denied", message }
              : { kind: "error", message },
          })
        }
      })()
    }, 350)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [identity, trimmed, active, tick])

  const state: CanisterStatusState = !active
    ? { kind: "idle" }
    : cache?.id === trimmed
      ? cache.state
      : { kind: "loading" }

  return {
    ...state,
    refresh: () => setTick((n) => n + 1),
  }
}

export type { CanisterStatusView }
