import { View } from 'react-native'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Text } from '@/components/ui/text'
import { formatTime, formatTokenAmount, shortenCounterparty, txStatusLabel } from '@/lib/wallet-utils'
import { cn } from '@/lib/utils'
import { ICP_LEDGER_ID } from '@/services/tokens'
import type { TransactionPublic } from '@/services/types'

function txTypeKey(tx: TransactionPublic): string {
  if ('deposit' in tx.txType) return 'deposit'
  if ('withdraw' in tx.txType) return 'withdraw'
  if ('transfer' in tx.txType) return 'transfer'
  if ('fee' in tx.txType) return 'fee'
  if ('swapIn' in tx.txType) return 'swapIn'
  if ('swapOut' in tx.txType) return 'swapOut'
  return 'transfer'
}

export function AnalyticsTable({ rows }: { rows: TransactionPublic[] }) {
  const t = useTranslations('analytics')
  const tt = useTranslations('transactions')

  if (rows.length === 0) {
    return (
      <View className="rounded-xl border border-dashed border-border py-8">
        <Text className="text-center text-sm text-muted-foreground">{t('noRows')}</Text>
      </View>
    )
  }

  return (
    <View className="overflow-hidden rounded-xl border border-border">
      {rows.map((tx) => {
        const typeKey = txTypeKey(tx)
        const statusKey = txStatusLabel(tx.status)
        const token = tx.ledgerId === ICP_LEDGER_ID ? 'ICP' : 'TOKEN'
        return (
          <View key={tx.id} className="gap-1 border-b border-border px-3 py-2.5 last:border-b-0">
            <View className="flex-row items-center justify-between gap-2">
              <Text className="text-xs font-medium">{tt(`type.${typeKey}`)}</Text>
              <Text className="text-xs font-semibold tabular-nums">
                {formatTokenAmount(tx.amount, 8)} {token}
              </Text>
            </View>
            <Text className="text-[11px] tabular-nums text-muted-foreground">{formatTime(tx.createdAt)}</Text>
            <Text className="font-mono text-[11px] text-muted-foreground" numberOfLines={1}>
              {shortenCounterparty(tx.from)} → {shortenCounterparty(tx.to)}
            </Text>
            <Text
              className={cn(
                'text-[11px]',
                statusKey === 'completed' && 'text-primary',
                statusKey === 'failed' && 'text-destructive',
                statusKey === 'pending' && 'text-muted-foreground',
              )}
            >
              {tt(`status.${statusKey}`)}
            </Text>
          </View>
        )
      })}
    </View>
  )
}
