import type { Identity } from "@dfinity/agent"
import { call, query, type Outcome } from "@/services/client"
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
export function resolveUsername(
  identity: Identity | undefined,
  name: string
): Promise<string | null> {
  return query(identity, async (actor) => {
    const [principal] = await actor.resolveUsername(name)
    return principal ? principal.toText() : null
  })
}
