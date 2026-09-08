import { Pressable, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslations } from '@/components/i18n/locale-provider'
import { CommunityAvatar } from '@/components/community/community-avatar'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { formatCommunityPriceE8s } from '@/lib/community/format'
import {
  isCommunityOpen,
  isCommunityPaid,
  type CommunityChannelPublic,
} from '@/services/community/community'

export function ChannelCard({
  channel,
  isOwner = false,
  isJoined = false,
  joining = false,
  onJoin,
}: {
  channel: CommunityChannelPublic
  isOwner?: boolean
  isJoined?: boolean
  joining?: boolean
  onJoin?: () => void
}) {
  const t = useTranslations('community')
  const router = useRouter()
  const paid = isCommunityPaid(channel.access)
  const meta = [
    paid ? `${formatCommunityPriceE8s(channel.priceE8s)} ICP` : null,
    t('membersCount', { count: channel.memberCount.toString() }),
    !isCommunityOpen(channel.visibility) ? t('private') : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <View className="flex-row items-center gap-3 border-b border-border/40 px-1 py-3">
      <Pressable
        className="min-w-0 flex-1 flex-row items-center gap-3"
        onPress={() => router.push(`/channels/${channel.slug}` as never)}
      >
        <CommunityAvatar slug={channel.slug} />
        <View className="min-w-0 flex-1">
          <Text className="text-sm font-semibold" numberOfLines={1}>
            {channel.name}
          </Text>
          <Text className="text-xs text-muted-foreground" numberOfLines={1}>
            {meta}
          </Text>
        </View>
      </Pressable>
      {isOwner ? (
        <Text className="shrink-0 text-xs text-muted-foreground">{t('ownerChannel')}</Text>
      ) : isJoined ? (
        <Text className="shrink-0 text-xs text-muted-foreground">{t('joined')}</Text>
      ) : onJoin ? (
        <Button size="sm" disabled={joining} onPress={onJoin}>
          {joining ? t('joining') : t('join')}
        </Button>
      ) : null}
    </View>
  )
}
