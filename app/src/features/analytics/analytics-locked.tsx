import { View } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Button } from '@/components/ui/button'
import { AppIcon } from '@/components/ui/app-icon'
import { Text } from '@/components/ui/text'

export function AnalyticsLocked() {
  const t = useTranslations('analytics')
  const router = useRouter()
  return (
    <View className="items-center rounded-2xl border border-dashed border-border px-5 py-10">
      <AppIcon name="shop" size={32} />
      <Text className="pt-4 text-lg font-semibold">{t('lockedTitle')}</Text>
      <Text className="max-w-sm pt-2 text-center text-sm text-muted-foreground">{t('lockedBody')}</Text>
      <Button className="mt-6" onPress={() => router.push('/username')}>
        {t('lockedAction')}
      </Button>
    </View>
  )
}
