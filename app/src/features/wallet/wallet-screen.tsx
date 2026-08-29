import { useMemo } from 'react'
import { Image } from 'expo-image'
import { View } from 'react-native'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Skeleton } from '@/components/ui/skeleton'
import { Text } from '@/components/ui/text'
import { TokenList } from '@/features/wallet/token-list'
import { useAuth } from '@/components/auth/auth-provider'
import { useCustomLedgerIds } from '@/hooks/use-custom-ledger-ids'
import { formatAmount, E8S } from '@/lib/wallet-utils'
import { useIcpPrice } from '@/hooks/use-icp-price'
import { useFiatValue } from '@/hooks/use-fiat-value'
import { useTokenHoldings } from '@/hooks/use-wallet-data'
import { ICP_LEDGER_ID } from '@/services/tokens'
import { images } from '@/constants/images'

export function WalletScreen() {
  const t = useTranslations('wallet')
  const { identity } = useAuth()
  const principal = identity?.getPrincipal().toText()
  const { ids: customIds, add: addCustomId } = useCustomLedgerIds(principal)
  const { holdings, isLoading, refresh } = useTokenHoldings(customIds)
  const liveBalance = holdings.find((item) => item.ledgerId === ICP_LEDGER_ID)?.balance
  const { price } = useIcpPrice()
  const usd = price ? (Number(liveBalance ?? 0n) / Number(E8S)) * price.usd : null
  const fiat = useFiatValue(usd)

  const existingLedgerIds = useMemo(
    () => [...new Set([...holdings.map((h) => h.ledgerId), ...customIds])],
    [holdings, customIds],
  )

  return (
    <TokenList
      holdings={holdings}
      isLoading={isLoading}
      existingLedgerIds={existingLedgerIds}
      onAddCustom={(ledgerId, meta) => {
        addCustomId(ledgerId, meta)
        void refresh()
      }}
      header={
        <View className="gap-6 pb-2">
          <View>
            <Text className="text-2xl font-bold tracking-tight">{t('title')}</Text>
            <Text className="text-sm text-muted-foreground">{t('subtitle')}</Text>
          </View>
          <View className="rounded-3xl bg-primary p-3 shadow-lg">
            <View className="flex-row items-center justify-end">
              <View className="flex-row items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5">
                <Image source={images.logo} className="size-4" />
                <Text className="text-[11px] font-semibold text-primary-foreground">{t('icpBalance')}</Text>
              </View>
            </View>
            <View className="mt-4">
              {liveBalance === undefined ? (
                <Skeleton className="h-10 w-44 bg-primary-foreground/20" />
              ) : (
                <View className="flex-row items-baseline gap-2">
                  <Text className="text-[clamp(1.75rem,9vw,2.75rem)] font-semibold leading-tight text-primary-foreground">
                    {formatAmount(liveBalance)}
                  </Text>
                  <Text className="text-sm font-medium text-primary-foreground/60">ICP</Text>
                </View>
              )}
            </View>
            <View className="mt-4 flex-row items-end justify-between">
              <Text className="rounded-full bg-white/15 px-2.5 py-1 text-sm font-medium text-primary-foreground">
                {fiat.formatted ? `≈ ${fiat.symbol}${fiat.formatted} ${fiat.currency}` : ' '}
              </Text>
              <Text className="text-[11px] font-semibold uppercase tracking-widest text-primary-foreground/40">
                Internet Computer
              </Text>
            </View>
          </View>
        </View>
      }
    />
  )
}
