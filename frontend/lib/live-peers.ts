import type { LivePeer } from "@/services/live/live"

/** One tile per principal — prefer the viewer's tab, else the newest join. */
export function dedupeLivePeers(peers: LivePeer[], selfTabId: string): LivePeer[] {
  const byPrincipal = new Map<string, LivePeer>()

  for (const peer of peers) {
    const key = peer.principal.toText()
    const existing = byPrincipal.get(key)
    if (!existing) {
      byPrincipal.set(key, peer)
      continue
    }
    if (peer.tabId === selfTabId) {
      byPrincipal.set(key, peer)
      continue
    }
    if (existing.tabId !== selfTabId && peer.joinedAt > existing.joinedAt) {
      byPrincipal.set(key, peer)
    }
  }

  return [...byPrincipal.values()]
}
