"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { LiveParticipantGrid } from "@/components/live/live-participant-grid"
import { LiveMicControl } from "@/components/live/live-mic-control"
import { useLiveSession } from "@/components/live/live-session-provider"
import {
  endLiveRoom,
  pauseLiveRoom,
  resumeLiveRoom,
  startLiveRoom,
  liveStateLabel,
  type LivePeer,
  type LiveRoomPublic,
} from "@/services/live/live"
import { useAuth } from "@/components/auth/auth-provider"
import { useOwnProfile } from "@/hooks/use-wallet-data"
import { dedupeLivePeers } from "@/lib/live-peers"
import { readLiveSession } from "@/lib/live-session-store"
import { cn } from "@/lib/utils"

export function LiveRoomView({ roomId }: { roomId: string }) {
  const t = useTranslations("live")
  const { identity } = useAuth()
  const { data: profile } = useOwnProfile()
  const params = useSearchParams()
  const [busy, setBusy] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const {
    tabId,
    room: sessionRoom,
    joined,
    joining,
    micOn,
    micBusy,
    audioStatus,
    speakingTabs,
    livePeers,
    error: sessionError,
    join,
    leave,
    toggleMic,
    refreshRoom,
    unlockAudio,
    setRoom,
  } = useLiveSession()

  const joinRef = useRef(join)
  useEffect(() => {
    joinRef.current = join
  }, [join])

  const inviteToken =
    params.get("t") ??
    (typeof window !== "undefined" ? sessionStorage.getItem(`live:invite:${roomId}`) : null)

  const ready = joined && !!sessionRoom && !!tabId
  const selfUsername = profile?.username[0] ?? null

  useEffect(() => {
    if (!identity) return
    const saved = readLiveSession()
    const principal = identity.getPrincipal().toText()
    const restore =
      saved?.roomId === roomId && saved.principal === principal
        ? { tabId: saved.tabId, restoreMic: saved.micOn }
        : undefined
    void joinRef.current(roomId, inviteToken ?? undefined, restore)
  }, [identity, roomId, inviteToken])

  useEffect(() => {
    if (!ready) return
    unlockAudio()
  }, [ready, unlockAudio])

  const runHost = async (fn: () => Promise<LiveRoomPublic | void>) => {
    if (!identity || busy) return
    setBusy(true)
    setLocalError(null)
    try {
      const updated = await fn()
      if (updated && "id" in updated) setRoom(updated)
      else await refreshRoom()
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  const micOnTabIds = useMemo(() => {
    const ids = new Set<string>()
    if (micOn && tabId) ids.add(tabId)
    return ids
  }, [micOn, tabId])

  const gridPeers = useMemo(() => {
    if (!tabId) return dedupeLivePeers(livePeers, "")
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

  if (!identity || !ready) {
    if (sessionError && !joining) {
      return (
        <Alert variant="destructive">
          <AlertDescription>{sessionError}</AlertDescription>
        </Alert>
      )
    }
    return (
      <div className="flex justify-center py-16">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    )
  }

  const displayRoom = sessionRoom
  const roomLive = liveStateLabel(displayRoom.state) === "live"
  const isHost = displayRoom.host.toText() === identity.getPrincipal().toText()
  const state = liveStateLabel(displayRoom.state)
  const hostName = displayRoom.hostUsername[0] ? `@${displayRoom.hostUsername[0]}` : t("host")
  const effectiveMicOn = roomLive && micOn
  const canMic = roomLive && !micBusy
  const audioHint =
    roomLive && audioStatus !== "speaking" ? t(`audioStatus.${audioStatus}`) : null

  return (
    <>
      <div
        className={cn("space-y-4 pt-2", state === "live" && "pb-36")}
        onClick={unlockAudio}
        onTouchStart={unlockAudio}
      >
        <div className="flex items-start justify-between gap-3">
          {!isHost && state !== "ended" ? (
            <Button
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => void leave()}
              className="rounded-full bg-background"
            >
              {t("sessionBarLeave")}
            </Button>
          ) : (
            <span className="size-9 shrink-0" aria-hidden />
          )}
          <Badge variant={state === "live" ? "default" : "secondary"}>{t(`state.${state}`)}</Badge>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{displayRoom.title}</h1>
          <p className="flex flex-wrap items-baseline gap-x-1.5 text-sm font-medium text-muted-foreground">
            <span>
              {hostName} · {Number(displayRoom.peerCount)} {t("participants")}
            </span>
          </p>
        </div>

        {localError && (
          <Alert variant="destructive">
            <AlertDescription>{localError}</AlertDescription>
          </Alert>
        )}

        {state === "live" && (
          <section className="rounded-2xl border bg-card/40 px-3 py-4">
            {audioHint && (
              <p
                className={cn(
                  "mb-3 text-center text-xs",
                  audioStatus === "needsTap"
                    ? "font-medium text-primary"
                    : "text-muted-foreground"
                )}
              >
                {audioHint}
              </p>
            )}
            <LiveParticipantGrid
              peers={gridPeers}
              selfTabId={tabId}
              selfUsername={selfUsername}
              hostPrincipal={displayRoom.host}
              micOnTabIds={micOnTabIds}
              speakingTabIds={speakingTabs}
            />
          </section>
        )}

        {isHost && (
          <div className="flex flex-wrap gap-2">
            {(state === "draft" || state === "paused") && (
              <Button
                disabled={busy}
                onClick={() =>
                  runHost(() =>
                    state === "paused"
                      ? resumeLiveRoom(identity, roomId)
                      : startLiveRoom(identity, roomId)
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
                onClick={() => runHost(() => pauseLiveRoom(identity, roomId))}
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
                    await endLiveRoom(identity, roomId)
                    await leave()
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
      </div>

      {state === "live" && (
        <div className="sticky bottom-24 z-[60] flex justify-center pt-4">
          <LiveMicControl
            variant="inline"
            micOn={effectiveMicOn}
            busy={micBusy}
            disabled={!canMic}
            onToggle={() => void toggleMic()}
          />
        </div>
      )}
    </>
  )
}
