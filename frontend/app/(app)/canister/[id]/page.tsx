"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import useSWR from "swr"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MyCanisterDetails } from "@/components/canister/my-canister-details"
import { AppPage } from "@/components/layout/dashboard/app-page"
import { useAuth } from "@/components/auth/auth-provider"
import { useCanisterStatus } from "@/hooks/canister/useCanisterStatus"
import { useSavedCanisterEntries } from "@/hooks/canister/useSavedCanisters"
import { shortCanisterId } from "@/lib/canister/savedCanisters"
import { fetchCanisterIndexMeta } from "@/services/canister/controlledCanisters"

export default function CanisterDetailPage() {
  const t = useTranslations("myCanisters")
  const { identity, isAuthenticated } = useAuth()
  const params = useParams()
  const canisterId = params.id as string
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
    <AppPage
      title={localName || meta?.name || shortCanisterId(canisterId)}
      description={t("detailTitle")}
    >
      <div className="mx-auto max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>{localName || meta?.name || shortCanisterId(canisterId)}</CardTitle>
            <CardDescription className="font-mono text-xs">{canisterId}</CardDescription>
          </CardHeader>
          <CardContent>
            {canisterId ? (
              <MyCanisterDetails
                canisterId={canisterId}
                localName={localName}
                meta={meta}
                status={status}
                onCopyId={() => void navigator.clipboard.writeText(canisterId)}
                onRefresh={() => status.refresh()}
              />
            ) : null}
          </CardContent>
        </Card>
      </div>
    </AppPage>
  )
}
