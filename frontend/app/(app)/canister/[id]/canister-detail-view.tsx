"use client"

import { useMemo } from "react"
import { useParams, useSearchParams } from "next/navigation"
import useSWR from "swr"
import { MyCanisterDetails, type CanisterDetailTab } from "@/components/canister/details"
import { AppPage } from "@/components/layout/dashboard/app-page"
import { useAuth } from "@/components/auth/auth-provider"
import { useCanisterStatus } from "@/hooks/canister/useCanisterStatus"
import { useSavedCanisterEntries } from "@/hooks/canister/useSavedCanisters"
import { fetchCanisterIndexMeta } from "@/services/canister/controlledCanisters"

export function CanisterDetailView() {
  const { identity, isAuthenticated } = useAuth()
  const params = useParams()
  const searchParams = useSearchParams()
  const canisterId = (params?.id as string) ?? ""
  const tabParam = searchParams.get("tab") as CanisterDetailTab | null
  const defaultTab: CanisterDetailTab =
    tabParam === "settings" || tabParam === "snapshots" ? tabParam : "overview"

  const principal = identity?.getPrincipal().toText() ?? null
  const entries = useSavedCanisterEntries(principal)
  const nameById = useMemo(() => new Map(entries.map((e) => [e.id, e.name])), [entries])
  const localName = canisterId ? nameById.get(canisterId) ?? "" : ""

  const status = useCanisterStatus(
    identity,
    canisterId,
    Boolean(isAuthenticated && canisterId)
  )

  const { data: indexMeta } = useSWR(
    canisterId ? (["canister-index-meta", canisterId] as const) : null,
    ([, id]) => fetchCanisterIndexMeta(id),
    { revalidateOnFocus: false, dedupingInterval: 120_000 }
  )
  const meta = indexMeta ?? null

  return (
    <AppPage>
      <div className="mx-auto max-w-4xl">
        {canisterId ? (
          <MyCanisterDetails
            canisterId={canisterId}
            localName={localName}
            meta={meta}
            status={status}
            defaultTab={defaultTab}
            onCopyId={() => void navigator.clipboard.writeText(canisterId)}
            onRefresh={() => status.refresh()}
          />
        ) : null}
      </div>
    </AppPage>
  )
}
