import type { Identity } from "@icp-sdk/core/agent"
import { markPlaybackUnlocked, wasPlaybackUnlocked } from "@/lib/live-audio-perms"
import { postLiveSignal, type LivePeer } from "@/services/live/live"

const STUN = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
]

/** IC queries — free; keep modest to reduce replica load. */
export const LIVE_SIGNAL_POLL_MS = 500
export const LIVE_SIGNAL_POLL_MAX_MS = 2_000
export const LIVE_PEER_SYNC_MS = 2_500
export const LIVE_ROOM_POLL_MS = 12_000

/** Local WebRTC retry — no canister calls. */
/** Batch ICE into one update call — postLiveSignal burns cycles. */
const ICE_FLUSH_MS = 80
/** Local WebRTC retry when a peer is unhealthy — no canister calls. */
const PEER_RETRY_MS = 3_000

type SignalPayload =
  | { type: "offer"; sdp: string }
  | { type: "answer"; sdp: string }
  | { type: "ice"; candidate: RTCIceCandidateInit }
  | { type: "iceBatch"; candidates: RTCIceCandidateInit[] }

export type LiveAudioStatus = "idle" | "connecting" | "listening" | "speaking" | "needsTap"

type PeerState = {
  pc: RTCPeerConnection
  pendingIce: RTCIceCandidateInit[]
  remoteReady: boolean
  makingOffer: boolean
}

export class LiveAudioSession {
  readonly roomId: string
  readonly tabId: string
  private identity: Identity
  private peers = new Map<string, PeerState>()
  private localStream: MediaStream | null = null
  private micEnabled = false
  private remoteAudio = new Map<string, HTMLAudioElement>()
  private onPeerCount?: (n: number) => void
  private onStatus?: (status: LiveAudioStatus) => void
  private onSpeaking?: (tabId: string, speaking: boolean) => void
  private running = false
  private lastSignalId = 0n
  private pollTimer: ReturnType<typeof setTimeout> | null = null
  private pollDelayMs = LIVE_SIGNAL_POLL_MS
  private emptyPolls = 0
  private visibilityPaused = false
  private boundVisibility: (() => void) | null = null
  private iceQueues = new Map<string, RTCIceCandidateInit[]>()
  private iceFlushTimers = new Map<string, ReturnType<typeof setTimeout>>()
  private lastRemotePeers: LivePeer[] = []
  private peerLive = false
  private signalChain = Promise.resolve()
  private playbackUnlocked = false
  private signalingEnabled = false
  private audioCtx: AudioContext | null = null
  private speakTimer: ReturnType<typeof setInterval> | null = null
  private localSpeaking = false
  private lastPeerCount = -1
  private lastStatus: LiveAudioStatus | null = null
  private peerRetryTimer: ReturnType<typeof setInterval> | null = null

  constructor(identity: Identity, roomId: string, tabId: string) {
    this.identity = identity
    this.roomId = roomId
    this.tabId = tabId
  }

  setOnPeerCount(fn: (n: number) => void) {
    this.onPeerCount = fn
  }

  setOnStatus(fn: (status: LiveAudioStatus) => void) {
    this.onStatus = fn
  }

  setOnSpeaking(fn: (tabId: string, speaking: boolean) => void) {
    this.onSpeaking = fn
  }

  isMicOn(): boolean {
    return this.micEnabled
  }

  getStatus(): LiveAudioStatus {
    if (this.micEnabled) return "speaking"
    const others = this.lastRemotePeers.filter((p) => p.tabId !== this.tabId)
    if (others.length === 0) return "idle"
    const anyReady = [...this.peers.values()].some((p) => p.remoteReady)
    if (anyReady) return "listening"
    if (!this.playbackUnlocked && !wasPlaybackUnlocked()) return "needsTap"
    return "connecting"
  }

  private emitStatus() {
    const status = this.getStatus()
    if (status === this.lastStatus) return
    this.lastStatus = status
    this.onStatus?.(status)
  }

  private emitPeerCount(n: number) {
    if (n === this.lastPeerCount) return
    this.lastPeerCount = n
    this.onPeerCount?.(n)
  }

  unlockPlayback() {
    this.playbackUnlocked = true
    markPlaybackUnlocked()
    for (const audio of this.remoteAudio.values()) {
      this.tryPlayRemote(audio)
    }
  }

  /** Resume listen-only audio without requesting the microphone. */
  primeListening() {
    if (wasPlaybackUnlocked()) {
      this.playbackUnlocked = true
    }
    for (const audio of this.remoteAudio.values()) {
      this.tryPlayRemote(audio)
    }
  }

  enableSignaling() {
    this.signalingEnabled = true
  }

  disableSignaling() {
    this.signalingEnabled = false
    this.stopPolling()
  }

  async startMic(): Promise<void> {
    const firstAcquire = !this.localStream
    if (!this.localStream) {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: false,
      })
    }
    const track = this.localStream.getAudioTracks()[0]
    if (track) track.enabled = true
    this.micEnabled = true
    if (firstAcquire) {
      await this.attachLocalAudioToAllPeers()
    }
    this.startLocalVoiceMonitor()
    this.emitStatus()
  }

  async tryStartMic(): Promise<boolean> {
    try {
      await this.startMic()
      return true
    } catch {
      this.micEnabled = false
      this.emitStatus()
      return false
    }
  }

  stopMic() {
    this.micEnabled = false
    this.stopLocalVoiceMonitor()
    const track = this.localStream?.getAudioTracks()[0]
    if (track) track.enabled = false
    this.onSpeaking?.(this.tabId, false)
    this.emitStatus()
  }

  async syncPeers(remotePeers: LivePeer[], live: boolean) {
    if (!this.running && !this.signalingEnabled) return
    this.lastRemotePeers = remotePeers
    this.peerLive = live
    await this.syncPeersInternal()
  }

  private peerHealthy(state: PeerState): boolean {
    const { pc } = state
    if (!this.pcUsable(pc)) return false
    return (
      state.remoteReady ||
      (pc.connectionState === "connected" && pc.getReceivers().some((r) => r.track?.kind === "audio"))
    )
  }

  private async syncPeersInternal() {
    if (!this.peerLive) {
      this.closeAllPeers()
      this.emitStatus()
      return
    }

    const others = this.lastRemotePeers.filter((p) => p.tabId !== this.tabId)
    this.emitPeerCount(others.length)

    for (const peer of others) {
      const existing = this.peers.get(peer.tabId)
      if (existing && this.peerHealthy(existing)) continue
      if (existing) this.closePeer(peer.tabId)
      await this.connectAsOfferer(peer.tabId)
    }

    for (const tabId of [...this.peers.keys()]) {
      if (!others.some((p) => p.tabId === tabId)) {
        this.closePeer(tabId)
      }
    }
    this.emitStatus()
  }

  beginPolling() {
    if (!this.signalingEnabled) return
    this.running = true
    this.visibilityPaused = false
    if (!this.pollTimer) {
      this.pollDelayMs = LIVE_SIGNAL_POLL_MS
      this.schedulePoll(80)
      this.bindVisibility()
    }
    if (!this.peerRetryTimer) {
      this.peerRetryTimer = setInterval(() => {
        if (!this.peerLive) return
        const others = this.lastRemotePeers.filter((p) => p.tabId !== this.tabId)
        if (others.length === 0) return
        const needsRetry = others.some((peer) => {
          const state = this.peers.get(peer.tabId)
          return !state || !this.peerHealthy(state)
        })
        if (needsRetry) void this.syncPeersInternal()
      }, PEER_RETRY_MS)
    }
  }

  private bindVisibility() {
    if (this.boundVisibility || typeof document === "undefined") return
    this.boundVisibility = () => {
      if (document.hidden) {
        this.visibilityPaused = true
        if (this.pollTimer) {
          clearTimeout(this.pollTimer)
          this.pollTimer = null
        }
        return
      }
      this.visibilityPaused = false
      if (this.running && this.signalingEnabled && !this.pollTimer) {
        this.schedulePoll(0)
      }
    }
    document.addEventListener("visibilitychange", this.boundVisibility)
  }

  private unbindVisibility() {
    if (this.boundVisibility && typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", this.boundVisibility)
    }
    this.boundVisibility = null
    this.visibilityPaused = false
  }

  private schedulePoll(delayMs?: number) {
    if (this.pollTimer) clearTimeout(this.pollTimer)
    if (!this.running || this.visibilityPaused) {
      this.pollTimer = null
      return
    }
    this.pollTimer = setTimeout(() => {
      this.pollTimer = null
      void this.poll().finally(() => {
        if (this.running && !this.visibilityPaused) {
          this.schedulePoll(this.pollDelayMs)
        }
      })
    }, delayMs ?? this.pollDelayMs)
  }

  stopPolling() {
    this.running = false
    if (this.pollTimer) {
      clearTimeout(this.pollTimer)
      this.pollTimer = null
    }
    if (this.peerRetryTimer) {
      clearInterval(this.peerRetryTimer)
      this.peerRetryTimer = null
    }
    this.unbindVisibility()
  }

  teardown() {
    this.peerLive = false
    this.lastRemotePeers = []
    this.lastPeerCount = -1
    this.lastStatus = null
    this.emptyPolls = 0
    this.pollDelayMs = LIVE_SIGNAL_POLL_MS
    this.flushAllIce()
    this.clearIceState()
    this.disableSignaling()
    this.stopLocalVoiceMonitor()
    this.localStream?.getTracks().forEach((t) => t.stop())
    this.localStream = null
    this.micEnabled = false
    this.closeAllPeers()
    this.emitStatus()
  }

  static peerSyncIntervalMs() {
    return LIVE_PEER_SYNC_MS
  }

  private notePollResult(count: number) {
    if (count === 0) {
      this.emptyPolls += 1
      this.pollDelayMs = Math.min(
        LIVE_SIGNAL_POLL_MAX_MS,
        LIVE_SIGNAL_POLL_MS + this.emptyPolls * 150
      )
      return
    }
    this.emptyPolls = 0
    this.pollDelayMs = LIVE_SIGNAL_POLL_MS
  }

  private startLocalVoiceMonitor() {
    if (!this.localStream) return
    this.stopLocalVoiceMonitor()
    this.audioCtx = new AudioContext()
    const source = this.audioCtx.createMediaStreamSource(this.localStream)
    const analyser = this.audioCtx.createAnalyser()
    analyser.fftSize = 256
    analyser.smoothingTimeConstant = 0.82
    source.connect(analyser)

    const buf = new Uint8Array(analyser.frequencyBinCount)
    this.speakTimer = setInterval(() => {
      analyser.getByteFrequencyData(buf)
      let sum = 0
      for (let i = 0; i < buf.length; i++) sum += buf[i]
      const speaking = sum / buf.length > 8
      if (speaking === this.localSpeaking) return
      this.localSpeaking = speaking
      this.onSpeaking?.(this.tabId, speaking)
    }, 120)
  }

  private stopLocalVoiceMonitor() {
    if (this.speakTimer) clearInterval(this.speakTimer)
    this.speakTimer = null
    void this.audioCtx?.close()
    this.audioCtx = null
    if (this.localSpeaking) {
      this.localSpeaking = false
      this.onSpeaking?.(this.tabId, false)
    }
  }

  private enqueueSignal(task: () => Promise<void>) {
    this.signalChain = this.signalChain.then(task).catch(() => {})
    return this.signalChain
  }

  private async poll() {
    if (!this.running) return
    try {
      const { pollLiveSignals } = await import("@/services/live/live")
      const msgs = await pollLiveSignals(this.identity, this.roomId, this.tabId, this.lastSignalId)
      this.notePollResult(msgs.length)
      for (const msg of msgs) {
        if (msg.id > this.lastSignalId) this.lastSignalId = msg.id
        if (msg.fromTab === this.tabId) continue
        await this.enqueueSignal(() => this.handleRemote(msg.fromTab, msg.payload))
      }
    } catch {
      // transient while joining
    }
  }

  private async handleRemote(fromTab: string, raw: string) {
    let data: SignalPayload
    try {
      data = JSON.parse(raw) as SignalPayload
    } catch {
      return
    }

    if (data.type === "offer") {
      const state = await this.ensurePeer(fromTab)
      const { pc } = state
      if (!this.pcUsable(pc)) return
      const offerCollision = state.makingOffer || pc.signalingState !== "stable"
      if (offerCollision && this.tabId < fromTab) {
        return
      }
      if (offerCollision) {
        await pc.setLocalDescription({ type: "rollback" } as RTCSessionDescriptionInit)
      }
      if (!this.pcUsable(pc)) return
      await pc.setRemoteDescription({ type: "offer", sdp: data.sdp })
      await this.flushPendingIce(state)
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      await this.send(fromTab, { type: "answer", sdp: answer.sdp ?? "" })
    } else if (data.type === "answer") {
      const state = this.peers.get(fromTab)
      if (!state || !this.pcUsable(state.pc)) return
      await state.pc.setRemoteDescription({ type: "answer", sdp: data.sdp })
      await this.flushPendingIce(state)
    } else if (data.type === "ice") {
      const state = this.peers.get(fromTab)
      if (!state || !data.candidate || !this.pcUsable(state.pc)) return
      await this.addIceCandidate(state, data.candidate)
    } else if (data.type === "iceBatch") {
      const state = this.peers.get(fromTab)
      if (!state || !this.pcUsable(state.pc)) return
      for (const candidate of data.candidates) {
        if (!candidate) continue
        await this.addIceCandidate(state, candidate)
      }
    }
  }

  private pcUsable(pc: RTCPeerConnection): boolean {
    return pc.connectionState !== "closed" && pc.signalingState !== "closed"
  }

  private async connectAsOfferer(toTab: string) {
    const state = await this.ensurePeer(toTab)
    if (!this.pcUsable(state.pc) || state.makingOffer) return
    state.makingOffer = true
    try {
      if (!this.pcUsable(state.pc)) return
      const offer = await state.pc.createOffer()
      await state.pc.setLocalDescription(offer)
      await this.send(toTab, { type: "offer", sdp: offer.sdp ?? "" })
    } catch {
      this.closePeer(toTab)
    } finally {
      state.makingOffer = false
    }
  }

  private async renegotiate(remoteTab: string) {
    const state = this.peers.get(remoteTab)
    if (!state || state.makingOffer || !this.pcUsable(state.pc)) return
    if (state.pc.signalingState !== "stable") return
    state.makingOffer = true
    try {
      if (!this.pcUsable(state.pc)) return
      const offer = await state.pc.createOffer()
      await state.pc.setLocalDescription(offer)
      await this.send(remoteTab, { type: "offer", sdp: offer.sdp ?? "" })
    } catch {
      this.closePeer(remoteTab)
    } finally {
      state.makingOffer = false
    }
  }

  private audioTransceiver(pc: RTCPeerConnection) {
    return pc.getTransceivers().find(
      (t) =>
        t.receiver.track?.kind === "audio" ||
        t.sender.track?.kind === "audio" ||
        t.mid !== null
    )
  }

  private setupAudioTransceiver(state: PeerState) {
    const { pc } = state
    const track = this.localStream?.getAudioTracks()[0]
    const sending = !!(track && this.micEnabled && track.enabled)
    const tx = this.audioTransceiver(pc)

    if (!tx) {
      if (sending && track && this.localStream) {
        pc.addTrack(track, this.localStream)
      } else {
        pc.addTransceiver("audio", { direction: "recvonly" })
      }
      return
    }

    if (sending && track) {
      void tx.sender.replaceTrack(track)
      tx.direction = "sendrecv"
    } else if (!tx.sender.track) {
      tx.direction = "recvonly"
    }
  }

  private bindRemoteTrack(remoteTab: string, track: MediaStreamTrack) {
    if (track.kind !== "audio") return

    track.onunmute = () => {
      this.onSpeaking?.(remoteTab, true)
      this.emitStatus()
    }
    track.onmute = () => this.onSpeaking?.(remoteTab, false)

    let audio = this.remoteAudio.get(remoteTab)
    if (!audio) {
      audio = new Audio()
      audio.autoplay = true
      ;(audio as HTMLAudioElement & { playsInline?: boolean }).playsInline = true
      this.remoteAudio.set(remoteTab, audio)
    }
    const stream = new MediaStream([track])
    audio.srcObject = stream
    this.tryPlayRemote(audio)
  }

  private tryPlayRemote(audio: HTMLAudioElement) {
    void audio.play().catch(() => {
      if (this.playbackUnlocked) void audio.play().catch(() => {})
    })
  }

  private async ensurePeer(remoteTab: string): Promise<PeerState> {
    const existing = this.peers.get(remoteTab)
    if (existing) return existing

    const pc = new RTCPeerConnection({ iceServers: STUN })
    const state: PeerState = {
      pc,
      pendingIce: [],
      remoteReady: false,
      makingOffer: false,
    }
    this.peers.set(remoteTab, state)

    pc.onicecandidate = (ev) => {
      if (!ev.candidate) {
        void this.flushIce(remoteTab)
        return
      }
      this.queueIce(remoteTab, ev.candidate.toJSON())
    }

    pc.ontrack = (ev) => {
      state.remoteReady = true
      this.bindRemoteTrack(remoteTab, ev.track)
      this.emitStatus()
    }

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed" || pc.connectionState === "closed") {
        this.closePeer(remoteTab)
        this.emitStatus()
        if (this.peerLive) void this.syncPeersInternal()
      }
    }

    this.setupAudioTransceiver(state)
    this.emitStatus()
    return state
  }

  private async attachLocalAudioToAllPeers() {
    const track = this.localStream?.getAudioTracks()[0]
    if (!track) return
    for (const [remoteTab, state] of this.peers) {
      if (!this.pcUsable(state.pc)) {
        this.closePeer(remoteTab)
        continue
      }
      this.setupAudioTransceiver(state)
      if (state.pc.signalingState === "stable") {
        await this.renegotiate(remoteTab)
      }
    }
  }

  private async addIceCandidate(state: PeerState, candidate: RTCIceCandidateInit) {
    if (!state.pc.remoteDescription) {
      state.pendingIce.push(candidate)
      return
    }
    try {
      await state.pc.addIceCandidate(candidate)
    } catch {
      // duplicate or stale
    }
  }

  private async flushPendingIce(state: PeerState) {
    const pending = [...state.pendingIce]
    state.pendingIce = []
    for (const candidate of pending) {
      await this.addIceCandidate(state, candidate)
    }
  }

  private queueIce(toTab: string, candidate: RTCIceCandidateInit) {
    const queue = this.iceQueues.get(toTab) ?? []
    queue.push(candidate)
    this.iceQueues.set(toTab, queue)
    if (this.iceFlushTimers.has(toTab)) return
    this.iceFlushTimers.set(
      toTab,
      setTimeout(() => {
        this.iceFlushTimers.delete(toTab)
        void this.flushIce(toTab)
      }, ICE_FLUSH_MS)
    )
  }

  private async flushIce(toTab: string) {
    const pending = this.iceFlushTimers.get(toTab)
    if (pending) {
      clearTimeout(pending)
      this.iceFlushTimers.delete(toTab)
    }
    const queue = this.iceQueues.get(toTab)
    if (!queue?.length) return
    this.iceQueues.set(toTab, [])
    if (queue.length === 1) {
      await this.send(toTab, { type: "ice", candidate: queue[0] })
      return
    }
    await this.send(toTab, { type: "iceBatch", candidates: queue })
  }

  private flushAllIce() {
    for (const toTab of this.iceQueues.keys()) {
      void this.flushIce(toTab)
    }
  }

  private clearIceState() {
    for (const timer of this.iceFlushTimers.values()) clearTimeout(timer)
    this.iceFlushTimers.clear()
    this.iceQueues.clear()
  }

  private async send(toTab: string, payload: SignalPayload) {
    if (!this.signalingEnabled) return
    try {
      await postLiveSignal(this.identity, this.roomId, this.tabId, toTab, JSON.stringify(payload))
    } catch {
      // Room left or join not confirmed yet — ignore transient signaling errors.
    }
  }

  private closePeer(tabId: string) {
    void this.flushIce(tabId)
    this.iceQueues.delete(tabId)
    const state = this.peers.get(tabId)
    state?.pc.close()
    this.peers.delete(tabId)
    this.onSpeaking?.(tabId, false)
    const audio = this.remoteAudio.get(tabId)
    if (audio) {
      audio.srcObject = null
      this.remoteAudio.delete(tabId)
    }
  }

  private closeAllPeers() {
    for (const tabId of [...this.peers.keys()]) this.closePeer(tabId)
  }
}

export function createTabId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `tab-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}
