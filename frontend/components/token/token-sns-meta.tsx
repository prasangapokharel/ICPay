"use client"

import { useTranslations } from "next-intl"
import { useSnsTokenMeta } from "@/hooks/governance/useGovernance"
import { useSnsRegistry } from "@/hooks/governance/useSnsRegistry"
import { snsDashboardUrl } from "@/services/governance/governance"
import { Spinner } from "@/components/ui/spinner"

export function TokenSnsMeta({ ledgerId }: { ledgerId: string }) {
  const t = useTranslations("token")
  const { meta, isLoading: metaLoading } = useSnsTokenMeta(ledgerId)
  const { registry, isLoading: regLoading } = useSnsRegistry(ledgerId)

  if (metaLoading || regLoading) {
    return (
      <div className="flex justify-center py-2">
        <Spinner className="size-4 text-muted-foreground" />
      </div>
    )
  }

  if (!meta && !registry) return null

  return (
    <div className="space-y-2 rounded-xl border border-border/40 bg-background/45 p-3 text-sm backdrop-blur-sm">
      {meta?.title ? <p className="font-semibold">{meta.title}</p> : null}
      {meta?.description ? (
        <p className="text-xs leading-relaxed text-muted-foreground line-clamp-4">
          {meta.description}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        {meta?.url ? (
          <a
            href={meta.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-primary"
          >
            {t("snsLink")}
          </a>
        ) : null}
        {registry?.rootCanisterId ? (
          <a
            href={snsDashboardUrl(registry.rootCanisterId)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-primary"
          >
            {t("snsDashboard")}
          </a>
        ) : null}
        {registry?.swapCanisterId ? (
          <a
            href={`https://dashboard.internetcomputer.org/canister/${registry.swapCanisterId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-primary"
          >
            {t("snsSwap")}
          </a>
        ) : null}
      </div>
    </div>
  )
}
