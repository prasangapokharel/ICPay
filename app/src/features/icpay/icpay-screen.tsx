import { Image } from 'expo-image'
import { Linking, Pressable, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { useIcpayStats } from '@/hooks/use-icpay-stats'
import { useIcpaySale } from '@/hooks/use-icpay-sale'
import { copyText, formatTokenAmount, shortPrincipal } from '@/lib/wallet-utils'
import { formatUsd, formatUsdPrecise } from '@/lib/icp-price'
import { fullyDilutedValue, ICPAY_INFO_URL, ICPAY_LEDGER_ID, ICPAY_SWAP_URL } from '@/services/icpay/icpay'
import { images } from '@/constants/images'

export function IcpayScreen() {
  const t = useTranslations('icpayToken')
  const { stats, isLoading } = useIcpayStats()
  const { sale } = useIcpaySale()
  const router = useRouter()

  if (isLoading && !stats) {
    return (
      <View className="items-center pt-16">
        <Spinner />
      </View>
    )
  }
  if (!stats) return null

  const fdv = fullyDilutedValue(stats)
  const change = stats.market?.priceChange24h ?? 0

  return (
    <View className="gap-6 pt-2">
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1">
          <Text className="text-xl font-bold">{t('title')}</Text>
          <Text className="text-sm text-muted-foreground">{t('subtitle')}</Text>
        </View>
        <Button variant="outline" size="sm" onPress={() => router.push('/icpay/presale')}>
          {t('viewPresale')}
        </Button>
      </View>
      {sale?.active ? (
        <Pressable onPress={() => router.push('/icpay/presale')} className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3">
          <Text className="font-medium">{t('presaleLive')}</Text>
          <Text className="mt-0.5 text-xs text-muted-foreground">
            {formatTokenAmount(sale.inventoryRemaining, stats.decimals, 0)} {stats.symbol} {t('presaleLeft')}
          </Text>
        </Pressable>
      ) : null}
      <View className="items-center gap-2">
        <View className="size-14 overflow-hidden rounded-full">
          <Image source={images.icpayToken} className="size-full" contentFit="cover" />
        </View>
        <Text className="text-3xl font-bold">
          {stats.market ? formatUsdPrecise(stats.market.priceUsd) : t('unpriced')}
        </Text>
        <Text className="text-sm text-muted-foreground">
          {stats.name} ({stats.symbol})
        </Text>
        {stats.market ? (
          <Text className={change > 0 ? 'text-sm text-success' : change < 0 ? 'text-sm text-destructive' : 'text-sm text-muted-foreground'}>
            {change > 0 ? '+' : ''}
            {change.toFixed(2)}% {t('change24h')}
          </Text>
        ) : null}
      </View>
      <View className="flex-row gap-2">
        <Button className="flex-1" variant="outline" onPress={() => void Linking.openURL(ICPAY_INFO_URL)}>
          {t('chart')}
        </Button>
        <Button className="flex-1" onPress={() => void Linking.openURL(ICPAY_SWAP_URL)}>
          {t('swap', { symbol: stats.symbol })}
        </Button>
      </View>
      <Card>
        <Row label={t('totalSupply')} value={formatTokenAmount(stats.totalSupply, stats.decimals, 0)} />
        {fdv !== null ? <Row label={t('fdv')} value={formatUsd(fdv)} /> : null}
        {stats.market ? <Row label={t('tvl')} value={formatUsd(stats.market.tvlUsd)} /> : null}
        {stats.market ? <Row label={t('volume24h')} value={formatUsd(stats.market.volume24hUsd)} /> : null}
        <Row label={t('decimals')} value={String(stats.decimals)} />
        <Pressable onPress={() => void copyText(ICPAY_LEDGER_ID)}>
          <Row label={t('canisterId')} value={shortPrincipal(ICPAY_LEDGER_ID)} />
        </Pressable>
      </Card>
    </View>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between gap-3 py-2">
      <Text className="text-xs text-muted-foreground">{label}</Text>
      <Text className="text-sm">{value}</Text>
    </View>
  )
}
