import { View } from 'react-native'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Text } from '@/components/ui/text'
import { formatAmount } from '@/lib/wallet-utils'
import type { AnalyticsSummary } from '@/services/types'

export function AnalyticsSummaryGrid({ summary }: { summary: AnalyticsSummary }) {
  const t = useTranslations('analytics')
  const items = [
    { label: t('received'), value: `${formatAmount(summary.totalReceivedE8s)} ICP` },
    { label: t('sent'), value: `${formatAmount(summary.totalSentE8s)} ICP` },
    { label: t('tips'), value: String(summary.tipCount) },
    { label: t('transfers'), value: String(summary.transferCount) },
    { label: t('deposits'), value: String(summary.depositCount) },
    { label: t('withdrawals'), value: String(summary.withdrawCount) },
    { label: t('completed'), value: String(summary.completedCount) },
    { label: t('failed'), value: String(summary.failedCount) },
    { label: t('counterparties'), value: String(summary.uniqueCounterparties) },
    { label: t('swapsIn'), value: String(summary.swapInCount) },
    { label: t('swapsOut'), value: String(summary.swapOutCount) },
  ]

  return (
    <View className="flex-row flex-wrap gap-2">
      {items.map((item) => (
        <View key={item.label} className="w-[48%] rounded-xl border border-border bg-muted/30 px-3 py-2.5">
          <Text className="text-[11px] text-muted-foreground">{item.label}</Text>
          <Text className="pt-0.5 text-sm font-semibold tabular-nums">{item.value}</Text>
        </View>
      ))}
    </View>
  )
}
