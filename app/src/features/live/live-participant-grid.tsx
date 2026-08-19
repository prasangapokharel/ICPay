import { View } from 'react-native'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Badge } from '@/components/ui/badge'
import { Text } from '@/components/ui/text'
import { UserAvatar } from '@/components/ui/user-avatar'
import type { LivePeer } from '@/services/live/live'

export function LiveParticipantGrid({
  peers,
  selfTabId,
  hostText,
}: {
  peers: LivePeer[]
  selfTabId: string
  hostText: string
}) {
  const t = useTranslations('live')
  if (peers.length === 0) {
    return (
      <View className="items-center gap-2 py-6">
        <View className="size-16 items-center justify-center rounded-full bg-muted/60">
          <Text className="text-2xl">👤</Text>
        </View>
        <Text className="text-xs text-muted-foreground">{t('gridEmpty')}</Text>
      </View>
    )
  }

  const hostPeer = peers.find((p) => p.principal.toText() === hostText) ?? peers[0]
  const guests = peers.filter((p) => p.tabId !== hostPeer.tabId)

  return (
    <View className="items-center gap-6">
      <ParticipantTile peer={hostPeer} selfTabId={selfTabId} isHost />
      {guests.length > 0 ? (
        <View className="w-full flex-row flex-wrap justify-center gap-x-5 gap-y-5">
          {guests.map((peer) => (
            <ParticipantTile key={peer.tabId} peer={peer} selfTabId={selfTabId} isHost={false} />
          ))}
        </View>
      ) : null}
    </View>
  )
}

function ParticipantTile({
  peer,
  selfTabId,
  isHost,
}: {
  peer: LivePeer
  selfTabId: string
  isHost: boolean
}) {
  const t = useTranslations('live')
  const handle = peer.username[0] ?? peer.principal.toText()
  const label = peer.tabId === selfTabId ? t('gridYou') : peer.username[0] ? `@${peer.username[0]}` : handle
  const isSelf = peer.tabId === selfTabId

  return (
    <View className="items-center gap-2" style={{ width: isHost ? 88 : 72 }}>
      <View className="relative">
        <View
          className={isHost ? 'rounded-full border-2 border-primary/20 p-1' : isSelf ? 'rounded-full border-2 border-border p-0.5' : ''}
        >
          <UserAvatar seed={handle} size={isHost ? 80 : 56} />
        </View>
        {isHost ? (
          <View className="absolute -bottom-1.5 self-center">
            <Badge className="px-2 py-0.5">
              <Text className="text-[10px] font-semibold">{t('host')}</Text>
            </Badge>
          </View>
        ) : null}
      </View>
      <Text className="w-full text-center text-xs font-medium" numberOfLines={1}>
        {label}
      </Text>
    </View>
  )
}
