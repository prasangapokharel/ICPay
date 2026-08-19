import { Image } from 'expo-image'
import { View } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Text } from '@/components/ui/text'
import { TokenList } from '@/features/wallet/token-list'
import { formatAmount, E8S } from '@/lib/wallet-utils'
import { useIcpPrice } from '@/hooks/use-icp-price'
import { useFiatValue } from '@/hooks/use-fiat-value'
import { useTokenHoldings } from '@/hooks/use-wallet-data'
import { ICP_LEDGER_ID } from '@/services/tokens'
import { images } from '@/constants/images'

export function WalletScreen() {
  const t = useTranslations('wallet')
  const router = useRouter()
  const { holdings, isLoading } = useTokenHoldings()
  const liveBalance = holdings.find((item) => item.ledgerId === ICP_LEDGER_ID)?.balance
  const { price } = useIcpPrice()
  const usd = price ? (Number(liveBalance ?? 0n) / Number(E8S)) * price.usd : null
  const fiat = useFiatValue(usd)

  return (
    <TokenList
      holdings={holdings}
      isLoading={isLoading}
      header={
        <View className="gap-6 pb-2">
          <View className="flex-row items-center justify-between gap-3">
            <View className="flex-1">
              <Text className="text-2xl font-bold">{t('title')}</Text>
              <Text className="text-sm text-muted-foreground">{t('subtitle')}</Text>
            </View>
            <Button variant="outline" size="sm" onPress={() => router.push('/swap')}>
              {t('swapCta')}
            </Button>
          </View>
          <View className="rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-6 shadow-xl">
            <View className="flex-row items-center justify-between">
              <View className="h-7 w-9 overflow-hidden rounded-md bg-amber-300" />
              <View className="flex-row items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5">
                <Image source={images.logo} className="size-4" />
                <Text className="text-[11px] font-semibold text-primary-foreground">{t('icpBalance')}</Text>
              </View>
            </View>
            <View className="mt-8">
              {liveBalance === undefined ? (
                <Skeleton className="h-10 w-44 bg-primary-foreground/20" />
              ) : (
                <View className="flex-row items-baseline gap-2">
                  <Text className="text-4xl font-semibold text-primary-foreground">{formatAmount(liveBalance)}</Text>
                  <Text className="text-sm text-primary-foreground/60">ICP</Text>
                </View>
              )}
            </View>
            <View className="mt-6 flex-row items-end justify-between">
              <Text className="rounded-full bg-white/15 px-2.5 py-1 text-sm text-primary-foreground">
                {fiat.formatted ? `≈ ${fiat.symbol}${fiat.formatted} ${fiat.currency}` : ' '}
              </Text>
              <Text className="text-[11px] uppercase tracking-widest text-primary-foreground/40">Internet Computer</Text>
            </View>
          </View>
          <Text className="text-sm font-semibold">{t('tokens')}</Text>
        </View>
      }
    />
  )
}
