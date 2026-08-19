import { View } from 'react-native'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Text } from '@/components/ui/text'

export function QrCamera({
  onError,
}: {
  onRaw: (_raw: string) => void
  onError: (message: string) => void
}) {
  const t = useTranslations('scan')
  return (
    <View className="h-64 items-center justify-center rounded-2xl bg-muted">
      <Text className="px-4 text-center text-xs text-muted-foreground">{t('errors.unsupported')}</Text>
    </View>
  )
}
