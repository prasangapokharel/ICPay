import { View } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Text } from '@/components/ui/text'
import { useBucketPricingTiers } from '@/hooks/use-bucket'
import { CAPACITY_TIERS_GB } from '@/lib/bucket/bucket'
import { BUCKET_POPULAR_TIER_GB } from '@/lib/bucket/pricing'
import { formatAmount } from '@/lib/wallet-utils'

export function BucketPricingScreen() {
  const t = useTranslations('bucket')
  const router = useRouter()
  const { tiers, isLoading } = useBucketPricingTiers()

  return (
    <View className="gap-4 pt-2">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-xl font-bold">{t('pricingTitle')}</Text>
          <Text className="text-sm text-muted-foreground">{t('pricingSubtitle')}</Text>
        </View>
        <Button size="lg" onPress={() => router.push('/bucket')}>
          {t('myBuckets')}
        </Button>
      </View>
      {CAPACITY_TIERS_GB.map((gb) => {
        const tier = tiers.find((row) => row.gb === gb)
        const popular = gb === BUCKET_POPULAR_TIER_GB
        return (
          <Card key={gb} className={popular ? 'border-primary/40 bg-primary/5' : undefined}>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Text className="font-medium">{gb} GB</Text>
                {popular ? <Badge>{t('pricingPopular')}</Badge> : null}
              </View>
              {isLoading && !tier ? (
                <Skeleton className="h-5 w-20" />
              ) : tier ? (
                <View className="flex-row items-baseline gap-2">
                  {tier.listPriceE8s > tier.priceE8s ? (
                    <Text className="text-sm text-muted-foreground line-through">
                      {formatAmount(tier.listPriceE8s)} ICP
                    </Text>
                  ) : null}
                  <Text className="font-semibold">{formatAmount(tier.priceE8s)} ICP</Text>
                </View>
              ) : (
                <Text>—</Text>
              )}
            </View>
          </Card>
        )
      })}
      <Button onPress={() => router.push('/bucket/new')}>{t('createCta')}</Button>
    </View>
  )
}
