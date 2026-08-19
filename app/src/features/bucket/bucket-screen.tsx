import { Pressable, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import { AppIcon } from '@/components/ui/app-icon'
import { useBucketList } from '@/hooks/use-bucket'
import { formatBytes, isBucketActive, isPublicVisibility } from '@/lib/bucket/bucket'

export function BucketScreen() {
  const t = useTranslations('bucket')
  const router = useRouter()
  const { buckets } = useBucketList()

  return (
    <View className="gap-6 pt-2">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-xl font-bold">{t('title')}</Text>
          <Text className="text-sm text-muted-foreground">{t('subtitle')}</Text>
        </View>
        <Button size="lg" onPress={() => router.push('/bucket/new')}>
          {t('createCta')}
        </Button>
      </View>

      {!buckets?.length ? (
        <View className="gap-4 rounded-2xl border border-border/40 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 p-5">
          <View className="flex-row items-start gap-3">
            <View className="size-12 items-center justify-center rounded-xl bg-primary/10">
              <AppIcon name="bucket" size={24} />
            </View>
            <View className="flex-1">
              <Text className="mb-1 text-base font-semibold">{t('devCtaTitle')}</Text>
              <Text className="text-xs text-muted-foreground">{t('devCtaBody')}</Text>
            </View>
          </View>
          <View className="gap-2">
            <View className="flex-row items-start gap-2">
              <Text className="text-sm">✓</Text>
              <Text className="flex-1 text-sm text-muted-foreground">{t('feature1')}</Text>
            </View>
            <View className="flex-row items-start gap-2">
              <Text className="text-sm">✓</Text>
              <Text className="flex-1 text-sm text-muted-foreground">{t('feature2')}</Text>
            </View>
            <View className="flex-row items-start gap-2">
              <Text className="text-sm">✓</Text>
              <Text className="flex-1 text-sm text-muted-foreground">{t('feature3')}</Text>
            </View>
          </View>
          <Button size="lg" onPress={() => router.push('/bucket/pricing')}>
            {t('viewPricing')}
          </Button>
        </View>
      ) : null}

      <Pressable onPress={() => router.push('/bucket/pricing')} className="min-h-11 active:opacity-70">
        <Text className="text-sm font-medium text-primary">{t('pricingTitle')} →</Text>
      </Pressable>

      {buckets?.length ? (
        buckets.map((bucket) => (
          <Pressable key={bucket.id} onPress={() => router.push(`/bucket/${bucket.id}`)} className="active:opacity-70">
            <Card>
              <View className="flex-row items-center gap-3">
                <AppIcon name="bucket" size={18} boxed="muted" />
                <View className="flex-1">
                  <Text className="font-medium">{bucket.name}</Text>
                  <Text className="text-xs text-muted-foreground">
                    {formatBytes(bucket.storageUsed)} / {formatBytes(bucket.capacity)} ·{' '}
                    {isPublicVisibility(bucket.visibility) ? t('public') : t('private')} ·{' '}
                    {isBucketActive(bucket.status) ? t('active') : t('expired')}
                  </Text>
                </View>
              </View>
            </Card>
          </Pressable>
        ))
      ) : null}
    </View>
  )
}
