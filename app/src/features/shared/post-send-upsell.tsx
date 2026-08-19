import { View } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Button } from '@/components/ui/button'
import { Sheet } from '@/components/ui/sheet'
import { Text } from '@/components/ui/text'

export function PostSendUsernameUpsell({
  open,
  onOpenChange
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const t = useTranslations('upsell')
  const router = useRouter()

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={t('usernameTitle')} description={t('usernameBody')}>
      <View className="mb-4 rounded-2xl bg-muted/40 p-4">
        <View className="mb-3">
          <Text className="mb-1 text-xs text-muted-foreground">{t('instead')}</Text>
          <Text className="font-mono text-xs text-muted-foreground line-through">
            rkp4c-7iaaa-aaaaa-aaaca-cai
          </Text>
        </View>
        <View>
          <Text className="mb-1 text-xs text-success">{t('use')}</Text>
          <Text className="text-lg font-bold">@yourname</Text>
        </View>
      </View>

      <View className="gap-3 rounded-xl border border-border/40 bg-card p-4">
        <View className="flex-row items-start gap-2">
          <View className="mt-0.5 size-4 items-center justify-center rounded-full bg-success/20">
            <Text className="text-[10px] font-bold text-success">✓</Text>
          </View>
          <Text className="flex-1 text-sm">{t('benefit1')}</Text>
        </View>
        <View className="flex-row items-start gap-2">
          <View className="mt-0.5 size-4 items-center justify-center rounded-full bg-success/20">
            <Text className="text-[10px] font-bold text-success">✓</Text>
          </View>
          <Text className="flex-1 text-sm">{t('benefit2')}</Text>
        </View>
        <View className="flex-row items-start gap-2">
          <View className="mt-0.5 size-4 items-center justify-center rounded-full bg-success/20">
            <Text className="text-[10px] font-bold text-success">✓</Text>
          </View>
          <Text className="flex-1 text-sm">{t('benefit3')}</Text>
        </View>
      </View>

      <Button
        className="mt-6 w-full"
        size="lg"
        onPress={() => {
          onOpenChange(false)
          router.push('/username')
        }}
      >
        {t('getUsername')}
      </Button>
      <Button
        className="mt-2 w-full"
        variant="ghost"
        onPress={() => onOpenChange(false)}
      >
        {t('maybeLater')}
      </Button>
    </Sheet>
  )
}
