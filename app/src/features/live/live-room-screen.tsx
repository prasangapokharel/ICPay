import { useEffect, useRef, useState } from 'react'
import { View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { LiveParticipantGrid } from '@/features/live/live-participant-grid'
import { useAuth } from '@/components/auth/auth-provider'
import {
  endLiveRoom,
  getLiveRoom,
  joinLiveRoom,
  leaveLiveRoom,
  listLivePeers,
  liveStateLabel,
  pauseLiveRoom,
  resumeLiveRoom,
  startLiveRoom,
  type LivePeer,
  type LiveRoomPublic,
} from '@/services/live/live'

export function LiveRoomScreen() {
  const t = useTranslations('live')
  const { id } = useLocalSearchParams<{ id: string }>()
  const roomId = typeof id === 'string' ? id : ''
  const { identity } = useAuth()
  const tabId = useRef(`tab-${Date.now().toString(36)}`).current
  const [room, setRoom] = useState<LiveRoomPublic | null>(null)
  const [peers, setPeers] = useState<LivePeer[]>([])
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const router = useRouter()
  const principal = identity?.getPrincipal().toText() ?? ''
  const isHost = room ? room.host.toText() === principal : false
  const state = room ? liveStateLabel(room.state) : 'draft'
  const hostName = room?.hostUsername[0] ? `@${room.hostUsername[0]}` : t('host')
  const hostText = room?.host.toText() ?? ''

  useEffect(() => {
    if (!identity || !roomId) return
    let active = true
    const load = async () => {
      try {
        const joined = await joinLiveRoom(identity, roomId, tabId)
        if (!active) return
        setRoom(joined)
        setPeers(await listLivePeers(identity, roomId))
      } catch (e) {
        const existing = await getLiveRoom(identity, roomId)
        if (!active) return
        if (existing) {
          setRoom(existing)
          setPeers(await listLivePeers(identity, roomId).catch(() => []))
        } else setError(e instanceof Error ? e.message : t('roomNotFound'))
      }
    }
    void load()
    return () => {
      active = false
      void leaveLiveRoom(identity, roomId, tabId).catch(() => undefined)
    }
  }, [identity, roomId, tabId, t])

  const run = async (fn: () => Promise<LiveRoomPublic | void>) => {
    setBusy(true)
    try {
      const next = await fn()
      if (next) setRoom(next)
      if (identity) setPeers(await listLivePeers(identity, roomId))
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  const leave = async () => {
    if (identity) await leaveLiveRoom(identity, roomId, tabId).catch(() => undefined)
    router.replace('/live')
  }

  if (!room && !error) {
    return (
      <View className="items-center gap-3 pt-10">
        <Spinner />
        <Text className="text-sm text-muted-foreground">{t('connecting')}</Text>
      </View>
    )
  }

  if (!room) {
    return (
      <View className="gap-4 pt-2">
        <Alert variant="destructive">
          <AlertDescription>{error ?? t('roomNotFound')}</AlertDescription>
        </Alert>
      </View>
    )
  }

  return (
    <View className="flex-1 gap-5 pt-4">
      <View className="gap-3">
        <View className="flex-row items-start justify-between gap-3">
          <View className="min-w-0 flex-1 gap-1.5">
            <Text className="text-2xl font-bold leading-tight">{room.title}</Text>
            <View className="flex-row items-center gap-2">
              <Text className="text-sm text-muted-foreground">{hostName}</Text>
              <View className="size-1 rounded-full bg-muted-foreground/40" />
              <Text className="text-sm text-muted-foreground">
                {Number(room.peerCount)} {t('participants')}
              </Text>
            </View>
          </View>
          <Badge variant={state === 'live' ? 'default' : 'secondary'} className="mt-1">
            {t(`state.${state}`)}
          </Badge>
        </View>

        {!isHost && state !== 'ended' ? (
          <Button variant="outline" size="sm" disabled={busy} onPress={() => void leave()}>
            {t('sessionBarLeave')}
          </Button>
        ) : null}
      </View>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {state === 'live' ? (
        <View className="flex-1 gap-4">
          <View className="rounded-3xl border border-border/50 bg-card/50 px-4 py-6">
            <LiveParticipantGrid peers={peers} selfTabId={tabId} hostText={hostText} />
          </View>
          <Text className="text-center text-xs text-muted-foreground">{t('audioStatus.listening')}</Text>
        </View>
      ) : null}

      {state === 'draft' && !isHost ? (
        <View className="items-center gap-3 py-8">
          <View className="size-16 items-center justify-center rounded-full bg-muted/60">
            <Text className="text-3xl">⏸️</Text>
          </View>
          <Text className="text-center text-sm text-muted-foreground">{t('waitingHost')}</Text>
        </View>
      ) : null}

      {state === 'paused' ? (
        <View className="items-center gap-3 py-8">
          <View className="size-16 items-center justify-center rounded-full bg-muted/60">
            <Text className="text-3xl">⏸️</Text>
          </View>
          <Text className="text-center text-sm text-muted-foreground">{t('pausedHint')}</Text>
        </View>
      ) : null}

      {isHost ? (
        <View className="gap-2">
          {state === 'draft' || state === 'paused' ? (
            <Button
              disabled={busy}
              size="lg"
              onPress={() => void run(() => (state === 'paused' ? resumeLiveRoom(identity, roomId) : startLiveRoom(identity, roomId)))}
            >
              {state === 'paused' ? t('resume') : t('start')}
            </Button>
          ) : null}
          {state === 'live' ? (
            <Button variant="secondary" size="lg" disabled={busy} onPress={() => void run(() => pauseLiveRoom(identity, roomId))}>
              {t('stop')}
            </Button>
          ) : null}
          {state !== 'ended' ? (
            <Button
              variant="destructive"
              size="lg"
              disabled={busy}
              onPress={() =>
                void run(async () => {
                  await endLiveRoom(identity, roomId)
                  router.replace('/live')
                })
              }
            >
              {t('end')}
            </Button>
          ) : null}
        </View>
      ) : null}
    </View>
  )
}
