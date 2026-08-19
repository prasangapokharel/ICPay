import { useMemo, useState } from 'react'
import { View } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Text } from '@/components/ui/text'
import { useAuth } from '@/components/auth/auth-provider'
import { useBucketCycleStatus, useBucketPrice, useInvalidateBucketCache } from '@/hooks/use-bucket'
import { useLiveBalance, useRefreshWallet } from '@/hooks/use-wallet-data'
import { createBucket } from '@/services/bucket/bucket'
import { CAPACITY_TIERS_GB, mapBucketError, validateBucketName } from '@/lib/bucket/bucket'
import { formatAmount, ICP_FEE } from '@/lib/wallet-utils'
import type { BucketVisibilityVariant } from '@/services/bucket/types'

export function BucketCreateScreen() {
  const t = useTranslations('bucket')
  const router = useRouter()
  const { identity } = useAuth()
  const { cycleStatus } = useBucketCycleStatus()
  const balance = useLiveBalance()
  const refreshWallet = useRefreshWallet()
  const invalidate = useInvalidateBucketCache()
  const [name, setName] = useState('')
  const [capacityGB, setCapacityGB] = useState(10)
  const [visibility, setVisibility] = useState<BucketVisibilityVariant>({ Public: null })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const nameError = useMemo(() => validateBucketName(name), [name])
  const { price } = useBucketPrice(capacityGB)
  const canCreate = cycleStatus?.canAcceptNewBuckets !== false
  const totalCost = price !== null ? price + ICP_FEE : null

  const submit = async () => {
    if (nameError || !canCreate) return
    setBusy(true)
    setError(null)
    const result = await createBucket(identity, name.trim().toLowerCase(), capacityGB, visibility)
    setBusy(false)
    if ('err' in result) {
      setError(mapBucketError(result.err, (key) => t(key)))
      return
    }
    refreshWallet()
    await invalidate()
    router.replace(`/bucket/${encodeURIComponent(result.ok)}`)
  }

  return (
    <View className="gap-5 pt-2">
      <Text className="text-xl font-bold">{t('formTitle')}</Text>
      <Text className="text-sm text-muted-foreground">{t('formSubtitle')}</Text>
      {!canCreate ? (
        <Alert variant="destructive">
          <AlertDescription>{t('serviceUnavailable')}</AlertDescription>
        </Alert>
      ) : null}
      <Input value={name} onChangeText={setName} autoCapitalize="none" placeholder="my-assets" />
      <Text className="text-xs text-muted-foreground">{t('nameHint')}</Text>
      {name && nameError ? <Text className="text-xs text-destructive">{nameError}</Text> : null}
      <Text className="text-sm font-medium">{t('capacity')}</Text>
      <View className="flex-row flex-wrap gap-2">
        {CAPACITY_TIERS_GB.map((gb) => (
          <Button key={gb} size="sm" variant={capacityGB === gb ? 'default' : 'outline'} onPress={() => setCapacityGB(gb)}>
            {`${gb} GB`}
          </Button>
        ))}
      </View>
      <View className="flex-row gap-2">
        <Button
          className="flex-1"
          variant={'Public' in visibility ? 'default' : 'outline'}
          onPress={() => setVisibility({ Public: null })}
        >
          {t('public')}
        </Button>
        <Button
          className="flex-1"
          variant={'Private' in visibility ? 'default' : 'outline'}
          onPress={() => setVisibility({ Private: null })}
        >
          {t('private')}
        </Button>
      </View>
      <Text className="text-sm">
        {t('price')}: {price !== null ? `${formatAmount(price)} ICP` : '—'} {t('perMonth')}
      </Text>
      {totalCost !== null && balance != null && balance < totalCost ? (
        <Text className="text-xs text-destructive">{t('insufficientBalance')}</Text>
      ) : null}
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <Button size="lg" disabled={busy || !!nameError || !canCreate} onPress={() => void submit()}>
        {busy ? t('creating') : t('create')}
      </Button>
    </View>
  )
}
