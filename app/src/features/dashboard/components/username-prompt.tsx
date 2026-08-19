import { Image } from 'expo-image'
import { View } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { Sheet } from '@/components/ui/sheet'
import { USERNAME_FREE_MIN_LENGTH } from '@/lib/username'
import { images } from '@/constants/images'

export function UsernamePrompt({ username }: { username?: string }) {
  const t = useTranslations('username')
  const router = useRouter()
  if (username) return null

  return (
    <Sheet open dismissible={false} title={t('promptTitle')} description={t('promptBody', { min: USERNAME_FREE_MIN_LENGTH })}>
      <View className="mb-4 items-center">
        <View className="size-14 items-center justify-center overflow-hidden rounded-2xl bg-muted">
          <Image source={images.logo} className="size-9" contentFit="contain" />
        </View>
      </View>
      <Button className="w-full" onPress={() => router.push('/profile')}>
        {t('promptAction')}
      </Button>
    </Sheet>
  )
}
