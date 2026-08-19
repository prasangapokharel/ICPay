import { useState } from 'react'
import { View } from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import useSWRImmutable from 'swr/immutable'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AppIcon } from '@/components/ui/app-icon'
import { Input } from '@/components/ui/input'
import { Text } from '@/components/ui/text'
import { Spinner } from '@/components/ui/spinner'
import { PremiumBadge } from '@/components/shared/premium-badge'
import { SendSuccess } from '@/components/shared/send-success'
import { UsernamePricing } from '@/features/username/username-pricing'
import { useAuth } from '@/components/auth/auth-provider'
import { useLiveBalance, useRefreshWallet, useUsernameAvailability } from '@/hooks/use-wallet-data'
import { purchaseUsername, getUsernameTreasury } from '@/services/buy/buy'
import type { Purchase } from '@/services/types'
import { formatAmount, ICP_FEE, shortPrincipal } from '@/lib/wallet-utils'
import { priceFor, tierFor, validateUsername, USERNAME_MAX_LENGTH, USERNAME_FREE_MIN_LENGTH } from '@/lib/username'
import { getScarcityStats } from '@/lib/username-scarcity'
import { images } from '@/constants/images'

export function UsernameScreen() {
  const t = useTranslations('buyUsername')
  const { identity } = useAuth()
  const refreshWallet = useRefreshWallet()
  const router = useRouter()
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [buying, setBuying] = useState(false)
  const [bought, setBought] = useState<Purchase | null>(null)
  const trimmed = name.trim().toLowerCase()
  const shapeError = trimmed ? validateUsername(trimmed) : null
  const { available, isLoading } = useUsernameAvailability(shapeError ? '' : trimmed)
  const price = trimmed ? priceFor(trimmed) : 0n
  const tier = trimmed ? tierFor(trimmed) : null
  const total = price + ICP_FEE
  const balance = useLiveBalance()
  const insufficient = balance != null && trimmed !== '' && total > balance
  const { data: treasury } = useSWRImmutable(identity ? (['username-treasury'] as const) : null, () =>
    getUsernameTreasury(identity),
  )
  const canBuy = trimmed !== '' && !shapeError && available === true && !insufficient && !buying
  const scarcityStats = trimmed && !shapeError && tier ? getScarcityStats(trimmed.length) : null

  const submit = async () => {
    if (!canBuy) return
    setBuying(true)
    setError(null)
    const result = await purchaseUsername(identity, trimmed)
    setBuying(false)
    if ('err' in result) {
      setError(result.err)
      return
    }
    refreshWallet()
    setBought(result.ok)
  }

  if (bought) {
    return (
      <SendSuccess
        amount={bought.price}
        recipient={`@${bought.username}`}
        blockIndex={bought.blockIndex}
        kind="purchase"
        onDone={() => router.push('/profile')}
      />
    )
  }

  return (
    <View className="gap-6 pt-2">
      <View>
        <Text className="text-xl font-bold">{t('title')}</Text>
        <Text className="text-sm text-muted-foreground">{t('subtitle')}</Text>
      </View>
      <View>
        <Text className="mb-1.5 text-xs font-medium text-muted-foreground">{t('label')}</Text>
        <View className="relative">
          <Text className="absolute top-2.5 left-4 z-10 text-base text-muted-foreground">@</Text>
          <Input
            value={name}
            onChangeText={(value) => {
              setName(value.slice(0, USERNAME_MAX_LENGTH))
              setError(null)
            }}
            autoCapitalize="none"
            placeholder="btc"
            className="px-9"
          />
          <View className="absolute top-2.5 right-4">
            {trimmed && !shapeError && isLoading ? <Spinner /> : null}
            {trimmed && !shapeError && !isLoading && available === true ? (
              <AppIcon name="check" size={18} />
            ) : null}
            {trimmed && !shapeError && !isLoading && available === false ? (
              <AppIcon name="close" size={18} />
            ) : null}
          </View>
        </View>
        {shapeError ? (
          <Text className="mt-1.5 text-xs text-destructive">
            {t(`errors.${shapeError}`, { max: USERNAME_MAX_LENGTH, min: USERNAME_FREE_MIN_LENGTH })}
          </Text>
        ) : null}
        {!shapeError && available === false ? (
          <Text className="mt-1.5 text-xs text-destructive">{t('taken', { name: trimmed })}</Text>
        ) : null}
        {!shapeError && available === true ? (
          <View className="mt-1.5 gap-2">
            <Text className="text-xs text-green-600">{t('availableName', { name: trimmed })}</Text>
            {scarcityStats && scarcityStats.isRare ? (
              <View className="flex-row flex-wrap gap-2">
                <View className="flex-row items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1">
                  <Text className="text-xs">🔥</Text>
                  <Text className="text-xs font-medium text-orange-700">
                    {scarcityStats.remaining} {trimmed.length}-char names left
                  </Text>
                </View>
                <View className="flex-row items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1">
                  <Text className="text-xs">👁️</Text>
                  <Text className="text-xs font-medium text-blue-700">
                    {scarcityStats.viewedToday} viewed today
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
      {trimmed && !shapeError && tier ? (
        <View className="gap-3 rounded-2xl border border-border/30 bg-muted/40 p-4">
          <View className="flex-row items-baseline justify-between">
            <View className="flex-row items-center gap-1.5">
              <Text className="text-sm text-muted-foreground">{t(`tiers.${tier.labelKey}`)}</Text>
              <PremiumBadge name={trimmed} />
            </View>
            <View className="flex-row items-center gap-1.5">
              <Image source={images.logo} className="size-5" contentFit="contain" />
              <Text className="text-lg font-bold tabular-nums">{formatAmount(price)}</Text>
            </View>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-xs text-muted-foreground">{t('networkFee')}</Text>
            <Text className="text-xs tabular-nums text-muted-foreground">{formatAmount(ICP_FEE)} ICP</Text>
          </View>
          <View className="flex-row justify-between border-t border-border/40 pt-3">
            <Text className="text-sm font-medium">{t('total')}</Text>
            <Text className="text-sm font-bold tabular-nums">{formatAmount(total)} ICP</Text>
          </View>
          {treasury ? (
            <Text className="text-xs text-muted-foreground">{t('treasuryNote', { principal: shortPrincipal(treasury) })}</Text>
          ) : null}
        </View>
      ) : null}
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <Button size="xl" className="w-full" disabled={!canBuy} onPress={() => void submit()}>
        {buying ? t('buying') : insufficient ? t('insufficient') : t('buy')}
      </Button>
      <UsernamePricing />
    </View>
  )
}
