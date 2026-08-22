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

/** Room grid: deduped peers with the local tab inserted when missing from the list. */
export function gridLivePeers(
  livePeers: LivePeer[],
  selfTabId: string,
  selfPeer: LivePeer | null
): LivePeer[] {
  const deduped = dedupeLivePeers(livePeers, selfTabId)
  const merged = [...deduped]
  if (selfPeer && !merged.some((p) => p.tabId === selfTabId)) {
    merged.unshift(selfPeer)
  }
  return dedupeLivePeers(merged, selfTabId)
}
