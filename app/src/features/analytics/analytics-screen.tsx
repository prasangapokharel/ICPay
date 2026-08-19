import { useMemo, useState } from 'react'
import { View } from 'react-native'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { useAuth } from '@/components/auth/auth-provider'
import { useOwnProfile } from '@/hooks/use-wallet-data'
import { useAnalytics } from '@/hooks/use-analytics'
import { AnalyticsLocked } from '@/features/analytics/analytics-locked'
import { AnalyticsSummaryGrid } from '@/features/analytics/analytics-summary-grid'
import { AnalyticsTable } from '@/features/analytics/analytics-table'
import { ANALYTICS_EXPORT_FEE_E8S, hasAnalyticsAccess, hasFreeAnalyticsExport } from '@/lib/analytics-access'
import { buildAnalyticsCsv, downloadAnalyticsCsv, ledgerSymbolFallback } from '@/lib/analytics-csv'
import { exportUserAnalytics } from '@/services/analytics/analytics'
import { formatAmount } from '@/lib/wallet-utils'

export function AnalyticsScreen() {
  const t = useTranslations('analytics')
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
    () => (freeExport ? t('exportFree') : t('exportPaid', { price: formatAmount(ANALYTICS_EXPORT_FEE_E8S) })),
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
        if ('err' in result) {
          setExportError(result.err)
          return
        }
        rows = result.ok.rows
      }
      if (!rows?.length) {
        setExportError(t('noRows'))
        return
      }
      downloadAnalyticsCsv(buildAnalyticsCsv(rows, ledgerSymbolFallback), username)
    } catch (e) {
      setExportError(e instanceof Error ? e.message : t('exportFailed'))
    } finally {
      setExporting(false)
    }
  }

  return (
    <View className="gap-5 pt-2">
      <View>
        <Text className="text-2xl font-bold">{t('title')}</Text>
        <Text className="text-sm text-muted-foreground">{t('subtitle')}</Text>
      </View>
      {!allowed ? (
        <AnalyticsLocked />
      ) : isLoading && !data ? (
        <View className="items-center py-16">
          <Spinner />
        </View>
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      ) : data ? (
        <>
          <View className="flex-row flex-wrap items-center justify-between gap-2">
            <Text className="text-sm text-muted-foreground">{t('rowCount', { count: rowCount })}</Text>
            <View className="flex-row gap-2">
              <Button variant="outline" size="sm" onPress={() => refresh()}>
                {t('refresh')}
              </Button>
              <Button size="sm" disabled={exporting || rowCount === 0} onPress={() => void handleExport()}>
                {exporting ? t('exporting') : exportLabel}
              </Button>
            </View>
          </View>
          {exportError ? (
            <Alert variant="destructive">
              <AlertDescription>{exportError}</AlertDescription>
            </Alert>
          ) : null}
          <AnalyticsSummaryGrid summary={data.summary} />
          <AnalyticsTable rows={data.rows} />
        </>
      ) : null}
    </View>
  )
}
