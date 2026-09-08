"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/components/auth/auth-provider"
import { useOwnProfile } from "@/hooks/wallet/useWalletData"
import { useAnalytics } from "@/hooks/analytics/useAnalytics"
import { AnalyticsSummaryGrid } from "@/components/analytics/analytics-summary-grid"
import { AnalyticsTable } from "@/components/analytics/analytics-table"
import { AnalyticsLocked } from "@/components/analytics/analytics-locked"
import { AppPage } from "@/components/layout/dashboard/app-page"
import { hasAnalyticsAccess, hasFreeAnalyticsExport } from "@/lib/analytics/access"
import { buildAnalyticsCsv, downloadAnalyticsCsv, ledgerSymbolFallback } from "@/lib/analytics/csv"
import { exportUserAnalytics } from "@/services/analytics/analytics"
import { formatAmount } from "@/lib/wallet/utils"
import { ANALYTICS_EXPORT_FEE_E8S } from "@/lib/analytics/access"

export default function AnalyticsPage() {
  const t = useTranslations("analytics")
  const { identity } = useAuth()
  const { data: profile } = useOwnProfile()
  const username = profile?.username[0] ?? null
  const allowed = hasAnalyticsAccess(username)
  const freeExport = hasFreeAnalyticsExport(username)
  const { data, error, isLoading, refresh } = useAnalytics(allowed)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const rowCount = data?.rows.length ?? 0

  const exportLabel = useMemo(
    () =>
      freeExport
        ? t("exportFree")
        : t("exportPaid", { price: formatAmount(ANALYTICS_EXPORT_FEE_E8S) }),
    [freeExport, t],
  )

  const handleExport = async () => {
    if (!identity || !username) return
    setExportError(null)
    setExporting(true)
    try {
      let rows = data?.rows
      if (!freeExport) {
        const result = await exportUserAnalytics(identity)
        if ("err" in result) {
          setExportError(result.err)
          return
        }
        rows = result.ok.rows
      }
      if (!rows?.length) {
        setExportError(t("noRows"))
        return
      }
      const csv = buildAnalyticsCsv(rows, ledgerSymbolFallback)
      downloadAnalyticsCsv(csv, username)
    } catch (e) {
      setExportError(e instanceof Error ? e.message : t("exportFailed"))
    } finally {
      setExporting(false)
    }
  }

  if (!allowed) {
    return (
      <AppPage title={t("title")} description={t("subtitle")}>
        <AnalyticsLocked />
      </AppPage>
    )
  }

  return (
    <AppPage title={t("title")} description={t("subtitle")}>

      {isLoading && !data ? (
        <div className="flex justify-center py-16">
          <Spinner className="size-6 text-muted-foreground" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      ) : data ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {t("rowCount", { count: rowCount })}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => refresh()}>
                {t("refresh")}
              </Button>
              <Button size="sm" disabled={exporting || rowCount === 0} onClick={handleExport}>
                {exporting ? t("exporting") : exportLabel}
              </Button>
            </div>
          </div>

          {exportError && (
            <Alert variant="destructive">
              <AlertDescription>{exportError}</AlertDescription>
            </Alert>
          )}

          <AnalyticsSummaryGrid summary={data.summary} />
          <AnalyticsTable rows={data.rows} />
        </>
      ) : null}
    </AppPage>
  )
}
