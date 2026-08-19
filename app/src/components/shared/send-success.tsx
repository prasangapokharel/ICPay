import { Linking, Pressable, View } from 'react-native'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { UserAvatar } from '@/components/ui/user-avatar'
import { SuccessMark } from '@/components/shared/success-mark'
import { formatTokenAmount, explorerTxUrl } from '@/lib/wallet-utils'
import { cn } from '@/lib/utils'
import { FiatAmount } from '@/components/shared/fiat-amount'
import { useIcpPrice } from '@/hooks/use-icp-price'

export type SuccessKind = 'send' | 'tip' | 'purchase' | 'icpayBuy'

export function SendSuccess({
  amount,
  recipient,
  blockIndex,
  memo,
  kind = 'send',
  symbol = 'ICP',
  decimals = 8,
  onDone,
}: {
  amount: bigint
  recipient: string
  blockIndex: bigint
  memo?: string
  kind?: SuccessKind
  symbol?: string
  decimals?: number
  onDone: () => void
}) {
  const t = useTranslations('success')
  const tc = useTranslations('common')
  const { price } = useIcpPrice()
  const usd = symbol === 'ICP' && decimals === 8 && price ? (Number(amount) / 100_000_000) * price.usd : null
  const label = recipient.startsWith('@')
    ? recipient
    : recipient.length > 16
      ? `${recipient.slice(0, 6)}…${recipient.slice(-4)}`
      : recipient
  const rowLabel = kind === 'purchase' ? t('username') : kind === 'icpayBuy' ? t('destination') : t('recipient')

  return (
    <View className="items-center pt-6">
      <SuccessMark />
      <Text className="mt-6 text-center text-2xl font-bold">{t(kind)}</Text>
      <Text className="mt-2 text-center text-sm text-muted-foreground">
        {t(`${kind}Body`, { name: label, symbol })}
      </Text>
      <Text className="mt-8 text-xs text-muted-foreground">{t('total')}</Text>
      <Text className="mt-1 text-3xl font-bold">
        {formatTokenAmount(amount, decimals, decimals)} {symbol}
      </Text>
      <FiatAmount usd={usd} className="mt-1" />
      {memo ? <Text className="mt-2 text-center text-xs text-muted-foreground">{memo}</Text> : null}
      <View className="mt-8 w-full border-t border-dashed border-border pt-6">
        <Text className="text-xs text-muted-foreground">{rowLabel}</Text>
        <View className="mt-3 flex-row items-center gap-3 rounded-2xl bg-muted/50 p-3">
          <UserAvatar seed={recipient} size={44} />
          <View className="min-w-0 flex-1">
            <Text className={cn('truncate text-sm font-medium', !recipient.startsWith('@') && 'font-mono text-xs')}>
              {label}
            </Text>
            <Pressable onPress={() => void Linking.openURL(explorerTxUrl(blockIndex))} className="mt-0.5 min-h-11 justify-center">
              <Text className="text-xs text-muted-foreground underline">{t('viewOnDashboard')}</Text>
            </Pressable>
          </View>
        </View>
      </View>
      <Button className="mt-8 h-11 w-full" onPress={onDone}>
        {tc('done')}
      </Button>
    </View>
  )
}
