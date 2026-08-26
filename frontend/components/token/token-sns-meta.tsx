"use client"

import { useTranslations } from "next-intl"
import { useSnsTokenMeta } from "@/hooks/governance/useGovernance"
import { Spinner } from "@/components/ui/spinner"

export function TokenSnsMeta({ ledgerId }: { ledgerId: string }) {
  const t = useTranslations("token")
  const { meta, isLoading } = useSnsTokenMeta(ledgerId)

  if (isLoading) {
    return (
      <div className="flex justify-center py-2">
        <Spinner className="size-4 text-muted-foreground" />
      </div>
    )
  }

  if (!meta) return null

  return (
    <div className="space-y-1 rounded-xl border border-border/40 bg-background/45 p-3 text-sm backdrop-blur-sm">
      <p className="font-semibold">{meta.title}</p>
      {meta.description ? (
        <p className="text-xs leading-relaxed text-muted-foreground line-clamp-4">
          {meta.description}
        </p>
      ) : null}
      {meta.url ? (
        <a
          href={meta.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-primary"
        >
          {t("snsLink")}
        </a>
      ) : null}
    </div>
  )
}
