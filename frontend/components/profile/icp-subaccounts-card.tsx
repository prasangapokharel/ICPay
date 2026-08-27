"use client"

import { useTranslations } from "next-intl"
import { useIcpSubaccounts } from "@/hooks/ledger/useIcpSubaccounts"
import { Spinner } from "@/components/ui/spinner"

function hexSubaccount(bytes: Uint8Array): string {
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("")
}

export function IcpSubaccountsCard() {
  const t = useTranslations("profile")
  const { subaccounts, isLoading } = useIcpSubaccounts()

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Spinner className="size-4 text-muted-foreground" />
      </div>
    )
  }

  if (!subaccounts.length) return null

  return (
    <div className="space-y-2 rounded-xl border border-border/40 p-4">
      <p className="text-sm font-semibold">{t("subaccountsTitle")}</p>
      <p className="text-xs text-muted-foreground">{t("subaccountsHint")}</p>
      <ul className="max-h-32 space-y-1 overflow-y-auto font-mono text-[10px] text-muted-foreground">
        {subaccounts.slice(0, 8).map((sub) => (
          <li key={hexSubaccount(sub)} className="truncate">
            {hexSubaccount(sub)}
          </li>
        ))}
      </ul>
    </div>
  )
}
