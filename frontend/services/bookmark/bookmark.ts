import type { Identity } from "@icp-sdk/core/agent"
import { call, query, type Outcome } from "@/services/client"
import type { Bookmark } from "@/services/types"

export function listBookmarks(identity: Identity | undefined): Promise<Bookmark[]> {
  return query(identity, async (actor) => {
    const result = await actor.listBookmarks()
    if ("err" in result) throw new Error(result.err)
    return result.ok
  })
}

export function addBookmark(
  identity: Identity | undefined,
  targetUserId: string
): Promise<Outcome<Bookmark>> {
  return call(identity, "Failed to add bookmark", (actor) => actor.addBookmark(targetUserId))
}

export function removeBookmark(
  identity: Identity | undefined,
  targetUserId: string
): Promise<Outcome<null>> {
  return call(identity, "Failed to remove bookmark", (actor) => actor.removeBookmark(targetUserId))
}
