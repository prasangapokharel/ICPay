import { Pressable, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Text } from '@/components/ui/text'
import { useOwnProfile } from '@/hooks/use-wallet-data'
import { useLiveRooms } from '@/hooks/use-live-rooms'
import { canCreateLiveRoom } from '@/lib/live-access'
import { liveStateLabel } from '@/services/live/live'

export function LiveScreen() {
  const t = useTranslations('live')
  const { data: profile } = useOwnProfile()
  const { rooms, isLoading } = useLiveRooms()
  const canCreate = canCreateLiveRoom(profile?.username[0])
  const router = useRouter()

  return (
    <View className="gap-6 pt-2">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-xl font-bold">{t('title')}</Text>
          <Text className="text-sm text-muted-foreground">{t('subtitle')}</Text>
        </View>
        <Button size="lg" disabled={!canCreate} onPress={() => router.push('/live/new')}>
          {t('newRoom')}
        </Button>
      </View>
      {!canCreate ? (
        <Text className="text-sm text-muted-foreground">
          {t('createLockedHint')}{' '}
          <Text className="font-medium text-primary" onPress={() => router.push('/username')}>
            {t('createLockedAction')}
          </Text>
        </Text>
      ) : null}
      {isLoading ? (
        <View className="gap-3">
          {[0, 1, 2].map((item) => (
            <Skeleton key={item} className="h-16 w-full rounded-2xl" />
          ))}
        </View>
      ) : rooms.length === 0 ? (
        <Text className="text-sm text-muted-foreground">{t('empty')}</Text>
      ) : (
        rooms.map((room) => {
          const state = liveStateLabel(room.state)
          const host = room.hostUsername[0]
          return (
            <Pressable key={room.id} onPress={() => router.push(`/live/${room.id}`)} className="active:opacity-70">
              <Card>
                <View className="flex-row items-center justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-base font-semibold">{room.title}</Text>
                    <Text className="mt-1 text-xs text-muted-foreground">
                      {host ? `@${host}` : t('host')} · {Number(room.peerCount)} {t('participants')}
                    </Text>
                  </View>
                  <Badge variant={state === 'live' ? 'default' : 'secondary'}>{t(`state.${state}`)}</Badge>
                </View>
              </Card>
            </Pressable>
          )
        })
      )}
    </View>
  )
}
