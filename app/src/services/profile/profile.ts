import type { Identity } from "@icp-sdk/core/agent"
import { call, query, type Outcome } from "@/services/client"
import { getWalletActor } from "@/services/wallet"
import type { UserPublic } from "@/services/types"

// Returns null for a principal with no account yet, which is how the caller
// distinguishes a new user from a load failure.
export function getProfile(
  identity: Identity | undefined
): Promise<UserPublic | null> {
  return query(identity, async (actor) => {
    const [user] = await actor.getUser()
    return user ?? null
  })
}

// Claims a free handle. The canister enforces the length floor that keeps short
// names as paid inventory, and a claim is permanent.
export function updateUsername(
  identity: Identity | undefined,
  username: string
): Promise<Outcome<UserPublic>> {
  return call(identity, "Failed to update username", (actor) =>
    actor.updateUsername(username)
  )
}

export function searchUsers(
  identity: Identity | undefined,
  search: string
): Promise<UserPublic[]> {
  return query(identity, (actor) => actor.searchUsers(search))
}

// Resolves a handle to the principal behind it, or null when unclaimed.
// The canister method takes no caller, so this runs anonymously rather than
// through query(), which rejects without an identity -- a public payment link
// has to resolve for a stranger with no account.
export async function resolveUsername(
  identity: Identity | undefined,
  name: string
): Promise<string | null> {
  const actor = await getWalletActor(identity)
  const [principal] = await actor.resolveUsername(name)
  return principal ? principal.toText() : null
}

// Fetches the full UserPublic for a known username to get trust signals.
// searchUsers is a free query; exact-match filter is safe because handles are
// ≤8 chars and the 25-result cap cannot be saturated by such short substrings.
export async function getRecipientProfile(
  identity: Identity | undefined,
  username: string
): Promise<UserPublic | null> {
  const lower = username.toLowerCase()
  const results = await searchUsers(identity, lower)
  return results.find((u) => u.username[0]?.toLowerCase() === lower) ?? null
}
