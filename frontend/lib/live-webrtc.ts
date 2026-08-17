import type { Identity } from "@icp-sdk/core/agent"
import { postLiveSignal, type LivePeer } from "@/services/live/live"

const STUN = [{ urls: "stun:stun.l.google.com:19302" }]
const POLL_MS = 450
const PEER_SYNC_MS = 1200

type SignalPayload =
  | { type: "offer"; sdp: string }
  | { type: "answer"; sdp: string }
  | { type: "ice"; candidate: RTCIceCandidateInit }

export type LiveAudioStatus = "idle" | "connecting" | "listening" | "speaking"

type PeerState = {
  pc: RTCPeerConnection
  pendingIce: RTCIceCandidateInit[]
  remoteReady: boolean
  makingOffer: boolean
}

export class LiveAudioSession {
  private identity: Identity
  private roomId: string
  private tabId: string
  private peers = new Map<string, PeerState>()
  private localStream: MediaStream | null = null
  private micEnabled = false
  private remoteAudio = new Map<string, HTMLAudioElement>()
  private onPeerCount?: (n: number) => void
  private onStatus?: (status: LiveAudioStatus) => void
  private onSpeaking?: (tabId: string, speaking: boolean) => void
  private running = false
  private lastSignalId = 0n
  private pollTimer: ReturnType<typeof setInterval> | null = null
  private signalChain = Promise.resolve()
  private playbackUnlocked = false
  private signalingEnabled = false

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
    if (this.peers.size === 0) return "idle"
    const anyReady = [...this.peers.values()].some((p) => p.remoteReady)
    return anyReady ? "listening" : "connecting"
  }

  private emitStatus() {
    this.onStatus?.(this.getStatus())
  }

  unlockPlayback() {
    this.playbackUnlocked = true
    for (const audio of this.remoteAudio.values()) {
      void audio.play().catch(() => {})
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
    this.emitStatus()
  }

  stopMic() {
    this.micEnabled = false
    const track = this.localStream?.getAudioTracks()[0]
    if (track) track.enabled = false
    this.onSpeaking?.(this.tabId, false)
    this.emitStatus()
  }

  async syncPeers(remotePeers: LivePeer[], live: boolean) {
    if (!live) {
      this.closeAllPeers()
      this.emitStatus()
      return
    }

    const others = remotePeers.filter((p) => p.tabId !== this.tabId)
    this.onPeerCount?.(others.length)

    for (const peer of others) {
      if (this.peers.has(peer.tabId)) continue
      if (this.tabId < peer.tabId) {
        await this.connectAsOfferer(peer.tabId)
      }
    }

    for (const tabId of [...this.peers.keys()]) {
      if (!others.some((p) => p.tabId === tabId)) {
        this.closePeer(tabId)
      }
    }
    this.emitStatus()
  }

  beginPolling() {
    if (!this.signalingEnabled || this.pollTimer) return
    this.running = true
    void this.poll()
    this.pollTimer = setInterval(() => void this.poll(), POLL_MS)
  }

  stopPolling() {
    this.running = false
    if (this.pollTimer) {
      clearInterval(this.pollTimer)
      this.pollTimer = null
    }
  }

  teardown() {
    this.disableSignaling()
    this.localStream?.getTracks().forEach((t) => t.stop())
    this.localStream = null
    this.micEnabled = false
    this.closeAllPeers()
    this.emitStatus()
  }

  static peerSyncIntervalMs() {
    return PEER_SYNC_MS
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
      const offerCollision = state.makingOffer || pc.signalingState !== "stable"
      if (offerCollision && this.tabId < fromTab) {
        return
      }
      if (offerCollision) {
        await pc.setLocalDescription({ type: "rollback" } as RTCSessionDescriptionInit)
      }
      await pc.setRemoteDescription({ type: "offer", sdp: data.sdp })
      await this.flushPendingIce(state)
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      await this.send(fromTab, { type: "answer", sdp: answer.sdp ?? "" })
    } else if (data.type === "answer") {
      const state = this.peers.get(fromTab)
      if (!state) return
      await state.pc.setRemoteDescription({ type: "answer", sdp: data.sdp })
      await this.flushPendingIce(state)
    } else if (data.type === "ice") {
      const state = this.peers.get(fromTab)
      if (!state || !data.candidate) return
      await this.addIceCandidate(state, data.candidate)
    }
  }

  private async connectAsOfferer(toTab: string) {
    const state = await this.ensurePeer(toTab)
    if (state.makingOffer) return
    state.makingOffer = true
    try {
      const offer = await state.pc.createOffer()
      await state.pc.setLocalDescription(offer)
      await this.send(toTab, { type: "offer", sdp: offer.sdp ?? "" })
    } finally {
      state.makingOffer = false
    }
  }

  private async renegotiate(remoteTab: string) {
    const state = this.peers.get(remoteTab)
    if (!state || state.makingOffer) return
    if (state.pc.signalingState !== "stable") return
    state.makingOffer = true
    try {
      const offer = await state.pc.createOffer()
      await state.pc.setLocalDescription(offer)
      await this.send(remoteTab, { type: "offer", sdp: offer.sdp ?? "" })
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

    track.onunmute = () => this.onSpeaking?.(remoteTab, true)
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
    void audio.play().catch(() => {
      if (this.playbackUnlocked) void audio!.play().catch(() => {})
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
      if (!ev.candidate) return
      void this.send(remoteTab, { type: "ice", candidate: ev.candidate.toJSON() })
    }

    pc.ontrack = (ev) => {
      state.remoteReady = true
      this.emitStatus()
      this.bindRemoteTrack(remoteTab, ev.track)
    }

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed") {
        this.closePeer(remoteTab)
        this.emitStatus()
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

  private async send(toTab: string, payload: SignalPayload) {
    if (!this.signalingEnabled) return
    try {
      await postLiveSignal(this.identity, this.roomId, this.tabId, toTab, JSON.stringify(payload))
    } catch {
      // Room left or join not confirmed yet — ignore transient signaling errors.
    }
  }

  private closePeer(tabId: string) {
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
