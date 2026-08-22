/** IC query intervals — queries are free; keep modest to reduce replica load. */
export const LIVE_SIGNAL_POLL_MS = 500
export const LIVE_SIGNAL_POLL_MAX_MS = 2_000
export const LIVE_PEER_SYNC_MS = 2_500
export const LIVE_ROOM_POLL_MS = 12_000

/** Local WebRTC retry when a peer is unhealthy — no canister calls. */
export const LIVE_PEER_RETRY_MS = 3_000

/** Batch ICE into one update call — postLiveSignal burns cycles. */
export const LIVE_ICE_FLUSH_MS = 80

export const LIVE_STUN_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
]
