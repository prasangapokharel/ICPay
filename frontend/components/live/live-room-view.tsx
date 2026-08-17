"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { createTabId, LiveAudioSession } from "@/lib/live-webrtc"
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
  type LiveRoomPublic,
} from "@/services/live/live"
import { useAuth } from "@/components/auth/auth-provider"

export function LiveRoomView({ roomId }: { roomId: string }) {
  const t = useTranslations("live")
  const { identity } = useAuth()
  const params = useSearchParams()
  const tabId = useMemo(() => createTabId(), [])
  const sessionRef = useRef<LiveAudioSession | null>(null)

  const [room, setRoom] = useState<LiveRoomPublic | null>(null)
  const [peerCount, setPeerCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [joined, setJoined] = useState(false)
  const [micOn, setMicOn] = useState(false)

  const inviteToken =
    params.get("t") ??
    (typeof window !== "undefined" ? sessionStorage.getItem(`live:invite:${roomId}`) : null)

  const isHost =
    room && identity
      ? room.host.toText() === identity.getPrincipal().toText()
      : false

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
      void leaveLiveRoom(identity, roomId, tabId).catch(() => {})
      sessionRef.current?.teardown()
    }
  }, [identity, roomId, tabId, inviteToken, refreshRoom])

  useEffect(() => {
    if (!identity || !joined || !room) return
    const state = liveStateLabel(room.state)
    if (state !== "live") {
      sessionRef.current?.stopPolling()
      sessionRef.current?.syncPeers([], false)
      return
    }

    if (!sessionRef.current) {
      sessionRef.current = new LiveAudioSession(identity, roomId, tabId)
      sessionRef.current.setOnPeerCount(setPeerCount)
    }
    sessionRef.current.beginPolling()

    const tick = async () => {
      try {
        const peers = await listLivePeers(identity, roomId)
        await sessionRef.current?.syncPeers(peers, true)
        await refreshRoom()
      } catch {
        // ignore poll errors
      }
    }
    void tick()
    const id = setInterval(tick, 3000)
    return () => clearInterval(id)
  }, [identity, joined, room, roomId, tabId, refreshRoom])

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
    if (!session) return
    if (micOn) {
      session.stopMic()
      setMicOn(false)
    } else {
      try {
        await session.startMic()
        setMicOn(true)
        const peers = identity ? await listLivePeers(identity, roomId) : []
        await session.syncPeers(peers, liveStateLabel(room?.state ?? { draft: null }) === "live")
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
      }
    }
  }

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

  return (
    <div className="space-y-6 pt-2">
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

      <div className="flex flex-wrap gap-2">
        <Button variant={micOn ? "default" : "outline"} onClick={toggleMic} disabled={state !== "live"}>
          {micOn ? t("micOn") : t("micOff")}
        </Button>

        {isHost && (
          <>
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
                onClick={() => runHost(async () => {
                  await endLiveRoom(identity!, roomId)
                  sessionRef.current?.teardown()
                })}
              >
                {t("end")}
              </Button>
            )}
          </>
        )}
      </div>

      {state === "draft" && !isHost && (
        <p className="text-sm text-muted-foreground">{t("waitingHost")}</p>
      )}
      {state === "paused" && (
        <p className="text-sm text-muted-foreground">{t("pausedHint")}</p>
      )}
      {state === "live" && (
        <p className="text-sm text-muted-foreground">
          {t("liveHint", { count: peerCount })}
        </p>
      )}
    </div>
  )
}
