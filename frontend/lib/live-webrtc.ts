import type { Identity } from "@icp-sdk/core/agent"
import { postLiveSignal, type LivePeer } from "@/services/live/live"

const STUN = [{ urls: "stun:stun.l.google.com:19302" }]

type SignalPayload =
  | { type: "offer"; sdp: string }
  | { type: "answer"; sdp: string }
  | { type: "ice"; candidate: RTCIceCandidateInit }

export class LiveAudioSession {
  private identity: Identity
  private roomId: string
  private tabId: string
  private peers = new Map<string, RTCPeerConnection>()
  private localStream: MediaStream | null = null
  private remoteAudio = new Map<string, HTMLAudioElement>()
  private onPeerCount?: (n: number) => void
  private running = false
  private lastSignalId = 0n
  private pollTimer: ReturnType<typeof setInterval> | null = null

  constructor(identity: Identity, roomId: string, tabId: string) {
    this.identity = identity
    this.roomId = roomId
    this.tabId = tabId
  }

  setOnPeerCount(fn: (n: number) => void) {
    this.onPeerCount = fn
  }

  async startMic(): Promise<void> {
    if (this.localStream) return
    this.localStream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true },
      video: false,
    })
  }

  stopMic() {
    this.localStream?.getTracks().forEach((t) => t.stop())
    this.localStream = null
  }

  async syncPeers(remotePeers: LivePeer[], live: boolean) {
    if (!live) {
      this.closeAllPeers()
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
  }

  beginPolling() {
    if (this.pollTimer) return
    this.running = true
    this.pollTimer = setInterval(() => void this.poll(), 900)
  }

  stopPolling() {
    this.running = false
    if (this.pollTimer) {
      clearInterval(this.pollTimer)
      this.pollTimer = null
    }
  }

  teardown() {
    this.stopPolling()
    this.stopMic()
    this.closeAllPeers()
  }

  private async poll() {
    if (!this.running) return
    try {
      const { pollLiveSignals } = await import("@/services/live/live")
      const msgs = await pollLiveSignals(this.identity, this.roomId, this.tabId, this.lastSignalId)
      for (const msg of msgs) {
        if (msg.id > this.lastSignalId) this.lastSignalId = msg.id
        if (msg.fromTab === this.tabId) continue
        await this.handleRemote(msg.fromTab, msg.payload)
      }
    } catch {
      // query errors are transient while joining
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
      const pc = await this.ensurePeer(fromTab)
      await pc.setRemoteDescription({ type: "offer", sdp: data.sdp })
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      await this.send(fromTab, { type: "answer", sdp: answer.sdp ?? "" })
    } else if (data.type === "answer") {
      const pc = this.peers.get(fromTab)
      if (!pc) return
      await pc.setRemoteDescription({ type: "answer", sdp: data.sdp })
    } else if (data.type === "ice") {
      const pc = this.peers.get(fromTab)
      if (!pc || !data.candidate) return
      try {
        await pc.addIceCandidate(data.candidate)
      } catch {
        // duplicate or late candidate
      }
    }
  }

  private async connectAsOfferer(toTab: string) {
    const pc = await this.ensurePeer(toTab)
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    await this.send(toTab, { type: "offer", sdp: offer.sdp ?? "" })
  }

  private async ensurePeer(remoteTab: string): Promise<RTCPeerConnection> {
    const existing = this.peers.get(remoteTab)
    if (existing) return existing

    const pc = new RTCPeerConnection({ iceServers: STUN })
    this.peers.set(remoteTab, pc)

    pc.onicecandidate = (ev) => {
      if (!ev.candidate) return
      void this.send(remoteTab, {
        type: "ice",
        candidate: ev.candidate.toJSON(),
      })
    }

    pc.ontrack = (ev) => {
      let audio = this.remoteAudio.get(remoteTab)
      if (!audio) {
        audio = new Audio()
        audio.autoplay = true
        this.remoteAudio.set(remoteTab, audio)
      }
      audio.srcObject = ev.streams[0] ?? null
    }

    if (this.localStream) {
      for (const track of this.localStream.getTracks()) {
        pc.addTrack(track, this.localStream)
      }
    }

    return pc
  }

  private async send(toTab: string, payload: SignalPayload) {
    await postLiveSignal(this.identity, this.roomId, this.tabId, toTab, JSON.stringify(payload))
  }

  private closePeer(tabId: string) {
    this.peers.get(tabId)?.close()
    this.peers.delete(tabId)
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
