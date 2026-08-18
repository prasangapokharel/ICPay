"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { usePathname } from "next/navigation"
import { useSWRConfig } from "swr"
import { useAuth } from "@/components/auth/auth-provider"
import { useLivePeers, livePeersKey } from "@/hooks/use-live-peers"
import { liveRoomKey, useLiveRoom } from "@/hooks/use-live-room"
import {
  createTabId,
  LiveAudioSession,
  type LiveAudioStatus,
} from "@/lib/live-webrtc"
import {
  clearLiveSession,
  readLiveSession,
  writeLiveSession,
} from "@/lib/live-session-store"
import { micPermissionGranted, wasPlaybackUnlocked } from "@/lib/live-audio-perms"
import {
  joinLiveRoom,
  leaveLiveRoom,
  listLivePeers,
  liveStateLabel,
  type LivePeer,
  type LiveRoomPublic,
} from "@/services/live/live"

type JoinOpts = {
  tabId?: string
  restoreMic?: boolean
}

type LiveSessionContextValue = {
  roomId: string | null
  tabId: string | null
  room: LiveRoomPublic | null
  joined: boolean
  joining: boolean
  micOn: boolean
  micBusy: boolean
  audioStatus: LiveAudioStatus
  peerCount: number
  speakingTabs: ReadonlySet<string>
  livePeers: LivePeer[]
  error: string | null
  visible: boolean
  join: (roomId: string, inviteToken?: string, opts?: JoinOpts) => Promise<void>
  leave: () => Promise<void>
  toggleMic: () => Promise<void>
  refreshRoom: () => Promise<void>
  unlockAudio: () => void
  setRoom: (room: LiveRoomPublic) => void
}

const LiveSessionContext = createContext<LiveSessionContextValue | null>(null)

export function useLiveSession(): LiveSessionContextValue {
  const ctx = useContext(LiveSessionContext)
  if (!ctx) throw new Error("useLiveSession must be used within LiveSessionProvider")
  return ctx
}

export function LiveSessionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { identity } = useAuth()
  const { mutate: globalMutate } = useSWRConfig()

  const [roomId, setRoomId] = useState<string | null>(null)
  const [tabId, setTabId] = useState<string | null>(null)
  const [activeRoom, setActiveRoom] = useState<LiveRoomPublic | null>(null)
  const [joined, setJoined] = useState(false)
  const [joining, setJoining] = useState(false)
  const [micOn, setMicOn] = useState(false)
  const [micBusy, setMicBusy] = useState(false)
  const [audioStatus, setAudioStatus] = useState<LiveAudioStatus>("idle")
  const [peerCount, setPeerCount] = useState(0)
  const [speakingTabs, setSpeakingTabs] = useState<Set<string>>(() => new Set())
  const [error, setError] = useState<string | null>(null)

  const sessionRef = useRef<LiveAudioSession | null>(null)
  const restoredRef = useRef(false)
  const micOnRef = useRef(false)
  const joinLockRef = useRef<Promise<void> | null>(null)
  const joinRef = useRef<LiveSessionContextValue["join"]>(() => Promise.resolve())
  const pendingMicRestoreRef = useRef(false)
  const targetRoomRef = useRef<string | null>(null)

  const { room: polledRoom, mutate: mutateSessionRoom } = useLiveRoom(roomId ?? "", joined && !!roomId)
  const sessionRoom = polledRoom ?? activeRoom ?? null
  const roomLive = sessionRoom != null && liveStateLabel(sessionRoom.state) === "live"
  const { peers: livePeers, peerKey: livePeerKey, refresh: refreshPeers } = useLivePeers(
    roomId ?? "",
    joined && roomLive,
    tabId ?? ""
  )

  const refreshPeersRef = useRef(refreshPeers)
  useEffect(() => {
    refreshPeersRef.current = refreshPeers
  }, [refreshPeers])

  const persist = useCallback(
    (next: { roomId: string; tabId: string; micOn: boolean }) => {
      if (!identity) return
      writeLiveSession({
        ...next,
        principal: identity.getPrincipal().toText(),
      })
    },
    [identity]
  )

  const attachSession = useCallback((session: LiveAudioSession) => {
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
    return session
  }, [])

  const ensureSession = useCallback(() => {
    if (!identity || !roomId || !tabId) return null
    const current = sessionRef.current
    if (current && current.roomId === roomId && current.tabId === tabId) {
      return current
    }
    current?.teardown()
    sessionRef.current = null
    return attachSession(new LiveAudioSession(identity, roomId, tabId))
  }, [attachSession, identity, roomId, tabId])

  const teardown = useCallback(() => {
    sessionRef.current?.teardown()
    sessionRef.current = null
    setMicOn(false)
    micOnRef.current = false
    setPeerCount(0)
    setSpeakingTabs(new Set())
    setAudioStatus("idle")
  }, [])

  const leaveInternal = useCallback(async () => {
    const rid = roomId
    const tid = tabId
    teardown()
    setJoined(false)
    setRoomId(null)
    setTabId(null)
    setActiveRoom(null)
    clearLiveSession()
    if (identity && rid && tid) {
      await leaveLiveRoom(identity, rid, tid).catch(() => {})
    }
  }, [identity, roomId, tabId, teardown])

  const refreshRoom = useCallback(async () => {
    if (!roomId) return
    const next = await mutateSessionRoom()
    if (next && liveStateLabel(next.state) === "ended") {
      await leaveInternal()
    }
  }, [roomId, mutateSessionRoom, leaveInternal])

  const join = useCallback(
    async (targetRoomId: string, inviteToken?: string, opts?: JoinOpts) => {
      if (!identity) return

      if (roomId === targetRoomId && joined) {
        await refreshRoom()
        return
      }

      setJoining(true)
      setError(null)
      targetRoomRef.current = targetRoomId

      const run = async () => {
        try {
          if (joined) await leaveInternal()

          const nextTabId = opts?.tabId ?? createTabId()
          const saved = readLiveSession()
          if (
            saved?.roomId === targetRoomId &&
            saved.tabId !== nextTabId &&
            saved.principal === identity.getPrincipal().toText()
          ) {
            await leaveLiveRoom(identity, targetRoomId, saved.tabId).catch(() => {})
          }
          const joinedRoom = await joinLiveRoom(identity, targetRoomId, nextTabId, inviteToken)
          const peerList = await listLivePeers(identity, targetRoomId)

          void globalMutate(liveRoomKey(targetRoomId), joinedRoom, { revalidate: false })
          void globalMutate(
            livePeersKey(identity.getPrincipal().toText(), targetRoomId),
            peerList,
            { revalidate: false }
          )
          setActiveRoom(joinedRoom)
          setRoomId(targetRoomId)
          setTabId(nextTabId)
          setJoined(true)
          setError(null)
          persist({ roomId: targetRoomId, tabId: nextTabId, micOn: false })

          pendingMicRestoreRef.current = !!(
            opts?.restoreMic && liveStateLabel(joinedRoom.state) === "live"
          )
        } catch (e) {
          if (targetRoomRef.current === targetRoomId) {
            setError(e instanceof Error ? e.message : String(e))
            clearLiveSession()
          }
        } finally {
          if (targetRoomRef.current === targetRoomId) {
            setJoining(false)
          }
        }
      }

      const prior = joinLockRef.current
      const work = (async () => {
        if (prior) await prior.catch(() => {})
        await run()
      })()
      joinLockRef.current = work
      try {
        await work
      } finally {
        if (joinLockRef.current === work) joinLockRef.current = null
      }
    },
    [
      identity,
      roomId,
      joined,
      leaveInternal,
      persist,
      refreshRoom,
      globalMutate,
    ]
  )

  useEffect(() => {
    joinRef.current = join
  }, [join])

  const leave = useCallback(async () => {
    setError(null)
    await leaveInternal()
  }, [leaveInternal])

  const setRoom = useCallback(
    (next: LiveRoomPublic) => {
      setActiveRoom(next)
      void globalMutate(liveRoomKey(next.id), next, { revalidate: false })
    },
    [globalMutate]
  )

  const prevIdentityRef = useRef(identity)

  useEffect(() => {
    if (prevIdentityRef.current && !identity) {
      window.setTimeout(() => void leaveInternal(), 0)
    }
    prevIdentityRef.current = identity
  }, [identity, leaveInternal])

  useEffect(() => {
    if (!identity) return
    if (restoredRef.current) return
    const saved = readLiveSession()
    if (!saved) {
      restoredRef.current = true
      return
    }
    if (saved.principal !== identity.getPrincipal().toText()) {
      clearLiveSession()
      restoredRef.current = true
      return
    }
    restoredRef.current = true
    if (/^\/live\/[^/]+$/.test(pathname)) return
    void joinRef.current(saved.roomId, undefined, {
      tabId: saved.tabId,
      restoreMic: saved.micOn,
    })
  }, [identity, pathname])

  useEffect(() => {
    if (!identity || !joined || !sessionRoom || !roomId || !tabId) return
    const live = liveStateLabel(sessionRoom.state) === "live"
    if (!live) {
      sessionRef.current?.disableSignaling()
      void sessionRef.current?.syncPeers([], false)
      return
    }

    const session = ensureSession()
    if (!session) return
    session.enableSignaling()
    session.beginPolling()
    session.primeListening()
    if (wasPlaybackUnlocked()) session.unlockPlayback()

    const retry = window.setTimeout(() => {
      void refreshPeersRef.current()
    }, 1200)

    if (!pendingMicRestoreRef.current) {
      return () => window.clearTimeout(retry)
    }
    pendingMicRestoreRef.current = false
    void (async () => {
      if (!(await micPermissionGranted())) return
      const ok = await session.tryStartMic()
      if (!ok) return
      micOnRef.current = true
      setMicOn(true)
      persist({ roomId, tabId, micOn: true })
    })()
    return () => window.clearTimeout(retry)
  }, [identity, joined, sessionRoom, roomId, tabId, ensureSession, persist])

  useEffect(() => {
    if (!joined || !sessionRoom || !roomId || !tabId) return
    if (liveStateLabel(sessionRoom.state) !== "live") return
    const session = sessionRef.current
    if (!session) return
    void session.syncPeers(livePeers, true)
  }, [joined, sessionRoom, roomId, tabId, livePeerKey, livePeers])

  const toggleMic = useCallback(async () => {
    const session = ensureSession()
    if (!session || micBusy || !roomId || !tabId) return
    setMicBusy(true)
    setError(null)
    try {
      if (micOnRef.current) {
        session.stopMic()
        micOnRef.current = false
        setMicOn(false)
        setSpeakingTabs((prev) => {
          const next = new Set(prev)
          next.delete(tabId)
          return next
        })
      } else {
        await session.startMic()
        micOnRef.current = true
        setMicOn(true)
        session.unlockPlayback()
      }
      persist({ roomId, tabId, micOn: micOnRef.current })
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setMicBusy(false)
    }
  }, [ensureSession, micBusy, roomId, tabId, persist])

  const unlockAudio = useCallback(() => {
    sessionRef.current?.unlockPlayback()
  }, [])

  const onRoomPage = roomId != null && pathname === `/live/${roomId}`
  const visible = joined && !!roomId && !onRoomPage

  const value = useMemo(
    (): LiveSessionContextValue => ({
      roomId,
      tabId,
      room: sessionRoom,
      joined,
      joining,
      micOn,
      micBusy,
      audioStatus,
      peerCount,
      speakingTabs,
      livePeers,
      error,
      visible,
      join,
      leave,
      toggleMic,
      refreshRoom,
      unlockAudio,
      setRoom,
    }),
    [
      roomId,
      tabId,
      sessionRoom,
      joined,
      joining,
      micOn,
      micBusy,
      audioStatus,
      peerCount,
      speakingTabs,
      livePeers,
      error,
      visible,
      join,
      leave,
      toggleMic,
      refreshRoom,
      unlockAudio,
      setRoom,
    ]
  )

  return <LiveSessionContext.Provider value={value}>{children}</LiveSessionContext.Provider>
}
