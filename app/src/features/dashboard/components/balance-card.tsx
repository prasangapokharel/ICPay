import { Image } from 'expo-image'
import { Pressable, View } from 'react-native'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Text } from '@/components/ui/text'
import { PremiumBadge } from '@/components/shared/premium-badge'
import { icons } from '@/constants/icons'
import { images } from '@/constants/images'
import { useFiatValue } from '@/hooks/use-fiat-value'
import type { IcpPrice } from '@/lib/icp-price'

const E8S = 100_000_000

export function BalanceCard({
  balance,
  balanceE8s,
  price,
  hidden,
  onToggleHidden,
  username,
}: {
  balance: string
  balanceE8s: bigint
  price: IcpPrice | null
  hidden: boolean
  onToggleHidden: () => void
  username?: string
}) {
  const t = useTranslations('dashboard')
  const usdValue = price ? (Number(balanceE8s) / E8S) * price.usd : null
  const fiat = useFiatValue(usdValue)

  return (
    <View className="rounded-3xl bg-blue-200/80 pt-4 shadow-2xl">
      <View className="relative mt-2 rounded-3xl bg-primary p-5 shadow-xl">
        <View className="flex-row items-center justify-between gap-3">
          <View className="min-w-0 flex-row items-center gap-2.5">
            <CardChip />
            {username ? (
              <View className="min-w-0 flex-row items-center gap-1">
                <Text className="truncate font-mono text-sm text-primary-foreground/80">{username}</Text>
                <PremiumBadge name={username} />
              </View>
            ) : null}
          </View>
          <View className="flex-row items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5">
            <Image source={images.logo} className="size-4" />
            <Text className="text-[11px] font-semibold text-primary-foreground">ICP</Text>
          </View>
        </View>
        <View className="mt-8 flex-row items-center gap-2">
          <Text className="text-4xl font-semibold leading-none text-primary-foreground">
            {hidden ? '•• •••• ••••' : balance}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? t('showBalance') : t('hideBalance')}
            onPress={onToggleHidden}
            hitSlop={10}
            className="items-center justify-center active:opacity-70"
          >
            <Image
              source={hidden ? icons.hide : icons.show}
              style={{ width: 22, height: 22, opacity: hidden ? 0.7 : 1 }}
              contentFit="contain"
            />
          </Pressable>
        </View>
        <View className="mt-6 flex-row items-end justify-between">
          <View className="rounded-full bg-white/15 px-2.5 py-1">
            <Text className="text-sm font-medium text-primary-foreground">
              {hidden || !fiat.formatted ? '••••' : `≈ ${fiat.symbol} ${fiat.formatted}`}
            </Text>
          </View>
          <Text className="text-[11px] font-semibold uppercase tracking-widest text-primary-foreground/40">
            Internet Computer
          </Text>
        </View>
      </View>
    </View>
  )
}

function CardChip() {
  return (
    <View className="h-7 w-9 overflow-hidden rounded-md bg-amber-300">
      <View
        className="absolute rounded-[2px] border border-amber-900/40"
        style={{ top: 3, right: 3, bottom: 3, left: 3 }}
      />
      <View className="absolute bg-amber-900/45" style={{ left: 3, right: 3, top: 13, height: 1 }} />
      <View className="absolute bg-amber-900/45" style={{ top: 3, bottom: 3, left: 12, width: 1 }} />
      <View className="absolute bg-amber-900/45" style={{ top: 3, bottom: 3, left: 22, width: 1 }} />
    </View>
  )
}
