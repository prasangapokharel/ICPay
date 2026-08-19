import type { Identity } from "@icp-sdk/core/agent"
import { call, query, optional, type Outcome } from "@/services/client"
import type { TokenPublic, LaunchFee } from "@/services/types"
import { TOKEN_DECIMALS, normalizeSymbol } from "@/lib/token/launch"

export type LaunchInput = {
  name: string
  symbol: string
  description: string
  logo?: string
  website?: string
  telegram?: string
  twitter?: string
  // Base units already, scaled by parseSupply in lib/launch.
  totalSupply: bigint
  immutable: boolean
}

// The one update call in this feature. It charges the fee, creates the ledger
// canister and hands control away in a single message, so it is slow and must
// never be retried blindly -- a second call is a second 5 ICP.
export function launchToken(
  identity: Identity | undefined,
  input: LaunchInput
): Promise<Outcome<TokenPublic>> {
  return call(identity, "Launch failed", (actor) =>
    actor.launchToken({
      name: input.name.trim(),
      symbol: normalizeSymbol(input.symbol),
      description: input.description.trim(),
      // optional() maps "" to the absent case. [""] is a present empty string,
      // which the canister validates as a malformed link.
      logo: optional(input.logo),
      website: optional(input.website?.trim()),
      telegram: optional(input.telegram?.trim()),
      twitter: optional(input.twitter?.trim()),
      decimals: TOKEN_DECIMALS,
      totalSupply: input.totalSupply,
      immutable: input.immutable,
    })
  )
}

// A query, so the form can ask on every keystroke at no cost. Reserved symbols
// and in-flight launches both read as unavailable here.
export function isSymbolAvailable(
  identity: Identity | undefined,
  symbol: string
): Promise<boolean> {
  return query(identity, (actor) => actor.isSymbolAvailable(normalizeSymbol(symbol)))
}

// Authoritative price. Read rather than hardcoded so a fee change ships with the
// canister instead of needing a matching frontend deploy.
export function getLaunchFee(identity: Identity | undefined): Promise<LaunchFee> {
  return query(identity, (actor) => actor.getLaunchFee())
}

// False when no wasm is sealed. Checked before the form is usable so nobody pays
// into a launch that has nothing to install.
export function isLaunchReady(identity: Identity | undefined): Promise<boolean> {
  return query(identity, (actor) => actor.isTokenLaunchReady())
}

export function getMyTokens(
  identity: Identity | undefined,
  limit: number,
  offset: number
): Promise<TokenPublic[]> {
  return query(identity, (actor) => actor.getMyTokens(BigInt(limit), BigInt(offset)))
}

// Every launched token, newest first. Only active rows appear here; a pending or
// failed launch is visible to its creator through getMyTokens alone.
export function listTokens(
  identity: Identity | undefined,
  limit: number,
  offset: number
): Promise<TokenPublic[]> {
  return query(identity, (actor) => actor.listTokens(BigInt(limit), BigInt(offset)))
}

// Keyed by the internal id, which exists before the canister does -- this is the
// only lookup that can find a launch that failed before creation.
export function getTokenById(
  identity: Identity | undefined,
  id: string
): Promise<TokenPublic | null> {
  return query(identity, async (actor) => {
    const [token] = await actor.getTokenById(id)
    return token ?? null
  })
}

export function getTokenByLedger(
  identity: Identity | undefined,
  canisterId: string
): Promise<TokenPublic | null> {
  return query(identity, async (actor) => {
    const [token] = await actor.getToken(canisterId)
    return token ?? null
  })
}

// Status crosses Candid as a one-key object. Narrowing it once here keeps the
// tag test out of every component that renders a token.
export type LaunchStatus = "pending" | "active" | "failed"

export function statusOf(token: TokenPublic): LaunchStatus {
  if ("active" in token.status) return "active"
  if ("failed" in token.status) return "failed"
  return "pending"
}

export function failureReason(token: TokenPublic): string | null {
  return "failed" in token.status ? token.status.failed : null
}
