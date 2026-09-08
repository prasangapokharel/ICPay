import { View } from 'react-native'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { formatAmount, formatTokenAmount } from '@/lib/wallet-utils'
import type { IcpaySaleQuote } from '@/services/icpay/sale'

const ICP_DECIMALS = 8

export function PresaleStatsPanel({
  sale,
  symbol,
  isLoading,
}: {
  sale: IcpaySaleQuote | undefined
  symbol: string
  isLoading: boolean
}) {
  const t = useTranslations('buyIcpay')

  if (isLoading && !sale) {
    return (
      <View className="items-center py-8">
        <Spinner />
      </View>
    )
  }

  if (!sale) return null

  const percent = Math.min(100, Number(sale.percentSold))
  const percentLabel = percent.toFixed(2)

  return (
    <View className="gap-3">
      <Text className="text-xs tabular-nums text-muted-foreground">
        {formatTokenAmount(sale.icpaySold, ICP_DECIMALS, 0)} /{' '}
        {formatTokenAmount(sale.inventoryCap, ICP_DECIMALS, 0)} {symbol}
      </Text>
      <View className="gap-1">
        <Text className="text-right text-xs font-medium tabular-nums">{percentLabel}%</Text>
        <View className="h-1.5 overflow-hidden rounded-full bg-muted/70">
          <View className="h-full rounded-full bg-amber-400" style={{ width: `${percent}%` }} />
        </View>
      </View>
      <View className="flex-row flex-wrap items-center justify-center gap-x-3 gap-y-1">
        <Text className="text-xs tabular-nums text-muted-foreground">
          {t('remaining', {
            amount: formatTokenAmount(sale.inventoryRemaining, ICP_DECIMALS, 0),
            symbol,
          })}
        </Text>
        <Text className="text-xs text-muted-foreground">·</Text>
        <Text className="text-xs tabular-nums text-muted-foreground">
          {t('raised', { icp: formatAmount(sale.icpRaised) })}
        </Text>
      </View>
      {!sale.active ? (
        <Text className="text-center text-xs font-medium text-amber-500">{t('soldOut')}</Text>
      ) : null}
    </View>
  )
}
