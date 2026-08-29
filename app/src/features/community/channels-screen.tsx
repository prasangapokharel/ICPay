import { useMemo, useState } from 'react'
import { Pressable, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslations } from '@/components/i18n/locale-provider'
import { ChannelCard } from '@/components/community/channel-card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { useAuth } from '@/components/auth/auth-provider'
import { useMyCommunityChannels, usePublicCommunityChannels } from '@/hooks/use-community'
import { joinCommunityChannel } from '@/services/community/community'

type Tab = 'mine' | 'explore'

export function ChannelsScreen() {
  const t = useTranslations('community')
  const router = useRouter()
  const { identity } = useAuth()
  const [tab, setTab] = useState<Tab>('mine')
  const [joining, setJoining] = useState<string | null>(null)
  const mine = useMyCommunityChannels()
  const explore = usePublicCommunityChannels()
  const channels = tab === 'mine' ? mine.channels : explore.channels
  const loading = tab === 'mine' ? mine.isLoading : explore.isLoading

  const owned = useMemo(() => {
    if (!identity) return new Set<string>()
    const me = identity.getPrincipal().toText()
    return new Set(mine.channels.filter((c) => c.owner.toText() === me).map((c) => c.slug))
  }, [identity, mine.channels])

  const joined = useMemo(() => new Set(mine.channels.map((c) => c.slug)), [mine.channels])

  const handleJoin = async (slug: string) => {
    setJoining(slug)
    try {
      await joinCommunityChannel(identity, slug)
      await Promise.all([mine.refresh(), explore.refresh()])
      router.push(`/channels/${slug}` as never)
    } catch {
      // card stays; user can retry from channel screen
    } finally {
      setJoining(null)
    }
  }

  return (
    <View className="gap-4 pt-2">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-xl font-bold">{t('title')}</Text>
          <Text className="text-sm text-muted-foreground">{t('subtitle')}</Text>
        </View>
        <Button size="sm" variant="outline" onPress={() => router.push('/channels/new' as never)}>
          {t('newChannel')}
        </Button>
      </View>
      <View className="flex-row rounded-2xl bg-muted/50 p-1">
        {(['mine', 'explore'] as const).map((key) => (
          <Pressable
            key={key}
            onPress={() => setTab(key)}
            className={`flex-1 items-center rounded-xl py-2 ${tab === key ? 'bg-background' : ''}`}
          >
            <Text className={`text-sm font-medium ${tab === key ? 'text-foreground' : 'text-muted-foreground'}`}>
              {t(key)}
            </Text>
          </Pressable>
        ))}
      </View>
      {loading && channels.length === 0 ? (
        <View className="items-center py-16">
          <Spinner />
        </View>
      ) : channels.length === 0 ? (
        <View className="items-center gap-2 rounded-3xl border border-dashed border-border/60 px-6 py-12">
          <Text className="font-medium">{t('empty')}</Text>
          <Text className="text-center text-sm text-muted-foreground">{t('emptyHint')}</Text>
        </View>
      ) : (
        <View>
          {channels.map((channel) => (
            <ChannelCard
              key={channel.id}
              channel={channel}
              isOwner={owned.has(channel.slug)}
              isJoined={joined.has(channel.slug)}
              joining={joining === channel.slug}
              onJoin={
                tab === 'explore' && !joined.has(channel.slug) && !owned.has(channel.slug)
                  ? () => void handleJoin(channel.slug)
                  : undefined
              }
            />
          ))}
        </View>
      )}
    </View>
  )
}
