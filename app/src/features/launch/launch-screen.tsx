import { Pressable, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import { Badge } from '@/components/ui/badge'
import { useMyTokens } from '@/hooks/use-launch-data'
import { statusOf } from '@/services/launch/launch'

export function LaunchScreen() {
  const t = useTranslations('launch')
  const router = useRouter()
  const { tokens } = useMyTokens()

  return (
    <View className="gap-6 pt-2">
      <View>
        <Text className="text-xl font-bold">{t('title')}</Text>
        <Text className="text-sm text-muted-foreground">{t('subtitle')}</Text>
      </View>
      <Button size="lg" onPress={() => router.push('/launch/new')}>{t('createCta')}</Button>
      <Text className="text-sm font-semibold">{t('myTokens')}</Text>
      {tokens?.length ? (
        tokens.map((token) => (
          <Pressable key={token.id} onPress={() => router.push(`/launch/${token.id}`)} className="active:opacity-70">
            <Card>
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="font-medium">{token.symbol}</Text>
                  <Text className="text-xs text-muted-foreground">{token.name}</Text>
                </View>
                <Badge>{t(`status.${statusOf(token)}`)}</Badge>
              </View>
            </Card>
          </Pressable>
        ))
      ) : (
        <Text className="text-sm text-muted-foreground">{t('empty')}</Text>
      )}
    </View>
  )
}
