"use client"

import { useTranslations } from "next-intl"
import type { AnalyticsSummary } from "@/services/types"
import { formatAmount } from "@/lib/wallet/utils"

type AnalyticsSummaryGridProps = {
  summary: AnalyticsSummary
}

export function AnalyticsSummaryGrid({ summary }: AnalyticsSummaryGridProps) {
  const t = useTranslations("analytics")

  const items = [
    { label: t("received"), value: `${formatAmount(summary.totalReceivedE8s)} ICP` },
    { label: t("sent"), value: `${formatAmount(summary.totalSentE8s)} ICP` },
    { label: t("tips"), value: String(summary.tipCount) },
    { label: t("transfers"), value: String(summary.transferCount) },
    { label: t("deposits"), value: String(summary.depositCount) },
    { label: t("withdrawals"), value: String(summary.withdrawCount) },
    { label: t("completed"), value: String(summary.completedCount) },
    { label: t("failed"), value: String(summary.failedCount) },
    { label: t("counterparties"), value: String(summary.uniqueCounterparties) },
    { label: t("swapsIn"), value: String(summary.swapInCount) },
    { label: t("swapsOut"), value: String(summary.swapOutCount) },
  ]

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border bg-muted/30 px-3 py-2.5">
          <p className="text-[11px] text-muted-foreground">{item.label}</p>
          <p className="pt-0.5 text-sm font-semibold tabular-nums tracking-tight">{item.value}</p>
        </div>
      ))}
    </div>
  )
}
