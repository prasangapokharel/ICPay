"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { LiveParticipantGrid } from "@/components/live/live-participant-grid"
import { LiveMicControl } from "@/components/live/live-mic-control"
import {
  createTabId,
  LiveAudioSession,
  type LiveAudioStatus,
} from "@/lib/live-webrtc"
import {
  endLiveRoom,
  getLiveRoom,
  joinLiveRoom,
  leaveLiveRoom,
  liveStateLabel,
  pauseLiveRoom,
  resumeLiveRoom,
  startLiveRoom,
  type LivePeer,
  type LiveRoomPublic,
} from "@/services/live/live"
import { useAuth } from "@/components/auth/auth-provider"
import { useOwnProfile } from "@/hooks/use-wallet-data"
import { useLivePeers } from "@/hooks/use-live-peers"
import { dedupeLivePeers } from "@/lib/live-peers"

export function LiveRoomView({ roomId }: { roomId: string }) {
  const t = useTranslations("live")
  const { identity } = useAuth()
  const { data: profile } = useOwnProfile()
  const params = useSearchParams()
  const tabId = useMemo(() => createTabId(), [])
  const sessionRef = useRef<LiveAudioSession | null>(null)

  const [room, setRoom] = useState<LiveRoomPublic | null>(null)
  const [peerCount, setPeerCount] = useState(0)
  const [audioStatus, setAudioStatus] = useState<LiveAudioStatus>("idle")
  const [speakingTabs, setSpeakingTabs] = useState<Set<string>>(() => new Set())
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [micBusy, setMicBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [joined, setJoined] = useState(false)
  const [micOn, setMicOn] = useState(false)

  const inviteToken =
    params.get("t") ??
    (typeof window !== "undefined" ? sessionStorage.getItem(`live:invite:${roomId}`) : null)

  const selfUsername = profile?.username[0] ?? null
  const liveActive = joined && room ? liveStateLabel(room.state) === "live" : false
  const { peers: livePeers } = useLivePeers(roomId, liveActive, tabId)

  const isHost =
    room && identity ? room.host.toText() === identity.getPrincipal().toText() : false

  const refreshRoom = useCallback(async () => {
    if (!identity) return
    const r = await getLiveRoom(identity, roomId)
    setRoom(r)
  }, [identity, roomId])

  useEffect(() => {
    if (!identity) return
    let cancelled = false
    ;(async () => {
      try {
        await joinLiveRoom(identity, roomId, tabId, inviteToken ?? undefined)
        if (cancelled) return
        setJoined(true)
        await refreshRoom()
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
      sessionRef.current?.teardown()
      sessionRef.current = null
      void leaveLiveRoom(identity, roomId, tabId).catch(() => {})
    }
  }, [identity, roomId, tabId, inviteToken, refreshRoom])

  useEffect(() => {
    if (!identity || !joined || !room) return
    const state = liveStateLabel(room.state)
    if (state !== "live") {
      sessionRef.current?.disableSignaling()
      void sessionRef.current?.syncPeers([], false)
      return
    }

    if (!sessionRef.current) {
      const session = new LiveAudioSession(identity, roomId, tabId)
      session.setOnPeerCount(setPeerCount)
      session.setOnStatus(setAudioStatus)
      session.setOnSpeaking((id, speaking) => {
        setSpeakingTabs((prev) => {
          const next = new Set(prev)
          if (speaking) next.add(id)
          else next.delete(id)
          return next
        })
      })
      sessionRef.current = session
    }

    sessionRef.current.enableSignaling()
    sessionRef.current.beginPolling()
    sessionRef.current.unlockPlayback()

    const sync = async () => {
      try {
        await sessionRef.current?.syncPeers(livePeers, true)
      } catch {
        // ignore
      }
    }
    void sync()
  }, [identity, joined, room, roomId, tabId, livePeers])

  const runHost = async (fn: () => Promise<LiveRoomPublic | void>) => {
    if (!identity || busy) return
    setBusy(true)
    setError(null)
    try {
      const updated = await fn()
      if (updated && "id" in updated) setRoom(updated)
      else await refreshRoom()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  const toggleMic = async () => {
    const session = sessionRef.current
    if (!session || micBusy) return
    setMicBusy(true)
    setError(null)
    try {
      if (micOn) {
        session.stopMic()
        setMicOn(false)
        setSpeakingTabs((prev) => {
          const next = new Set(prev)
          next.delete(tabId)
          return next
        })
      } else {
        await session.startMic()
        setMicOn(true)
        session.unlockPlayback()
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setMicBusy(false)
    }
  }

  const unlockAudio = () => {
    sessionRef.current?.unlockPlayback()
  }

  const micOnTabIds = useMemo(() => {
    const ids = new Set<string>()
    if (micOn) ids.add(tabId)
    return ids
  }, [micOn, tabId])

  const gridPeers = useMemo(() => {
    const deduped = dedupeLivePeers(livePeers, tabId)
    const selfPeer: LivePeer | null =
      identity && joined
        ? {
            tabId,
            principal: identity.getPrincipal(),
            username: selfUsername ? [selfUsername] : [],
            joinedAt: 0n,
          }
        : null
    const merged = [...deduped]
    if (selfPeer && !merged.some((p) => p.tabId === tabId)) {
      merged.unshift(selfPeer)
    }
    return dedupeLivePeers(merged, tabId)
  }, [livePeers, identity, joined, tabId, selfUsername])

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    )
  }

  if (!room) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error ?? t("roomNotFound")}</AlertDescription>
      </Alert>
    )
  }

  const state = liveStateLabel(room.state)
  const hostName = room.hostUsername[0] ? `@${room.hostUsername[0]}` : t("host")
  const effectiveMicOn = state === "live" && micOn
  const canMic = state === "live" && joined && !micBusy
  const audioHint = state === "live" ? t(`audioStatus.${audioStatus}`) : null

  return (
    <div className="space-y-6 pt-2" onClick={unlockAudio} onTouchStart={unlockAudio}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link href="/live" className="text-xs text-muted-foreground hover:text-foreground">
            ← {t("title")}
          </Link>
          <h1 className="mt-1 text-xl font-bold tracking-tight">{room.title}</h1>
          <p className="text-sm text-muted-foreground">
            {hostName} · {Number(room.peerCount)} {t("participants")}
          </p>
        </div>
        <Badge variant={state === "live" ? "default" : "secondary"}>{t(`state.${state}`)}</Badge>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {state === "live" && (
        <>
          {audioHint && <p className="text-xs text-muted-foreground">{audioHint}</p>}
          {identity && (
            <LiveParticipantGrid
              peers={gridPeers}
              selfTabId={tabId}
              selfUsername={selfUsername}
              hostPrincipal={room.host}
              micOnTabIds={micOnTabIds}
              speakingTabIds={speakingTabs}
            />
          )}
          <LiveMicControl
            micOn={effectiveMicOn}
            busy={micBusy}
            disabled={!canMic}
            onToggle={toggleMic}
          />
        </>
      )}

      {isHost && (
        <div className="flex flex-wrap gap-2">
            {(state === "draft" || state === "paused") && (
              <Button
                disabled={busy}
                onClick={() =>
                  runHost(() =>
                    state === "paused"
                      ? resumeLiveRoom(identity!, roomId)
                      : startLiveRoom(identity!, roomId)
                  )
                }
              >
                {state === "paused" ? t("resume") : t("start")}
              </Button>
            )}
            {state === "live" && (
              <Button
                variant="secondary"
                disabled={busy}
                onClick={() => runHost(() => pauseLiveRoom(identity!, roomId))}
              >
                {t("stop")}
              </Button>
            )}
            {state !== "ended" && (
              <Button
                variant="destructive"
                disabled={busy}
                onClick={() =>
                  runHost(async () => {
                    await endLiveRoom(identity!, roomId)
                    sessionRef.current?.teardown()
                    sessionRef.current = null
                    setMicOn(false)
                  })
                }
              >
                {t("end")}
              </Button>
            )}
        </div>
      )}

      {state === "draft" && !isHost && (
        <p className="text-sm text-muted-foreground">{t("waitingHost")}</p>
      )}
      {state === "paused" && <p className="text-sm text-muted-foreground">{t("pausedHint")}</p>}
      {state === "live" && peerCount > 0 && (
        <p className="text-[11px] text-muted-foreground">{t("liveHint", { count: peerCount })}</p>
      )}
    </div>
  )
}
