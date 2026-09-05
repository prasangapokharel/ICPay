"use client"

import useSWR from "swr"
import type { Identity } from "@icp-sdk/core/agent"
import {
  fetchCanisterStatus,
  isControllerDenied,
  type CanisterStatusView,
} from "@/services/canister/management"

const MAX_PREVIEW = 12

export type MineRowStatus =
  | { kind: "ok"; data: CanisterStatusView }
  | { kind: "denied" }
  | { kind: "error" }

export function useMineStatusMap(
  identity: Identity | null | undefined,
  ids: string[],
  enabled: boolean
) {
  const capped = ids.slice(0, MAX_PREVIEW)
  const key =
    enabled && identity && capped.length > 0
      ? (["mine-status-map", identity.getPrincipal().toText(), capped.join("|")] as const)
      : null

  const { data, isLoading } = useSWR(
    key,
    async ([, , joined]) => {
      const list = joined.split("|").filter(Boolean)
      const pairs = await Promise.all(
        list.map(async (id) => {
          try {
            const view = await fetchCanisterStatus(identity!, id)
            return [id, { kind: "ok", data: view } satisfies MineRowStatus] as const
          } catch (e) {
            const state: MineRowStatus = isControllerDenied(e)
              ? { kind: "denied" }
              : { kind: "error" }
            return [id, state] as const
          }
        })
      )
      return Object.fromEntries(pairs) as Record<string, MineRowStatus>
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60_000,
      keepPreviousData: true,
    }
  )

  return { map: data ?? {}, isLoading }
}
