import { Pressable, ScrollView, View } from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { useTranslations } from '@/components/i18n/locale-provider'
import { AppIcon } from '@/components/ui/app-icon'
import { Text } from '@/components/ui/text'
import { images } from '@/constants/images'

const premiumFeatures = [
  {
    id: 'username',
    href: '/username',
    icon: 'username' as const,
    labelKey: 'username',
    priceKey: 'usernamePrice',
    gradient: 'from-amber-500/20 to-orange-500/20',
    badgeText: 'Popular',
  },
  {
    id: 'bucket',
    href: '/bucket/pricing',
    icon: 'bucket' as const,
    labelKey: 'storage',
    priceKey: 'storagePrice',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    badgeText: '100GB',
  },
  {
    id: 'launch',
    href: '/launch/new',
    icon: 'launch' as const,
    labelKey: 'launch',
    priceKey: 'launchPrice',
    gradient: 'from-purple-500/20 to-pink-500/20',
    badgeText: 'Create',
  },
]

export function PremiumFeaturesCard({ hasUsername }: { hasUsername?: boolean }) {
  const t = useTranslations('premium')
  const router = useRouter()

  if (hasUsername) return null

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-bold">✨ {t('title')}</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-3"
        className="-mx-4 px-4"
      >
        {premiumFeatures.map((feature) => (
          <Pressable
            key={feature.id}
            onPress={() => router.push(feature.href as never)}
            className="w-36 active:opacity-80"
          >
            <View className={`rounded-2xl border border-border/30 bg-gradient-to-br ${feature.gradient} p-4 shadow-sm`}>
              <View className="mb-3 size-10 items-center justify-center rounded-xl bg-background/80">
                <AppIcon name={feature.icon} size={20} />
              </View>
              <Text className="mb-1 text-sm font-semibold">{t(feature.labelKey)}</Text>
              <View className="flex-row items-center gap-1">
                <Image source={images.logo} className="size-3.5" contentFit="contain" />
                <Text className="text-xs font-medium text-muted-foreground">{t(feature.priceKey)}</Text>
              </View>
              {feature.badgeText ? (
                <View className="mt-2 self-start rounded-md bg-background/60 px-2 py-0.5">
                  <Text className="text-[10px] font-semibold">{feature.badgeText}</Text>
                </View>
              ) : null}
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  )
}
