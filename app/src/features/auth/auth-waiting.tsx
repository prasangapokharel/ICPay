import { Image } from 'expo-image'
import { Modal, View } from 'react-native'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { images } from '@/constants/images'

export function AuthWaiting({
  open,
  onCancel,
}: {
  open: boolean
  onCancel: () => void
}) {
  const t = useTranslations('login')
  const tc = useTranslations('common')
  if (!open) return null

  return (
    <Modal transparent animationType="fade" visible={open} onRequestClose={onCancel}>
      <View className="flex-1 items-center justify-center bg-black/40 px-6">
        <View className="w-full max-w-sm items-center rounded-3xl bg-background px-6 py-8">
          <Image source={images.logo} className="size-14" contentFit="contain" />
          <Text className="mt-4 text-lg font-semibold">Internet Identity</Text>
          <Text className="mt-2 text-center text-sm text-muted-foreground">{t('redirectNote')}</Text>
          <View className="mt-6">
            <Spinner />
          </View>
          <Text className="mt-4 text-xs text-muted-foreground">{t('connecting')}</Text>
          <Button className="mt-6 w-full" variant="outline" onPress={onCancel}>
            {tc('cancel')}
          </Button>
        </View>
      </View>
    </Modal>
  )
}
