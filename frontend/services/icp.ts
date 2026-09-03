import {
  HttpAgent,
  type Identity,
  type UpdateOptions,
  type PollingOptions,
} from "@icp-sdk/core/agent"
import type { Principal } from "@icp-sdk/core/principal"

const LOCAL_IC_HOST = "http://127.0.0.1:4943"
const IC_HOST = "https://icp0.io"
const LOCAL_CANISTER_ID = "u6s2n-gx777-77774-qaaba-cai"
const MAINNET_CANISTER_ID = "6vbhm-nqaaa-aaaan-q6muq-cai"
const MAINNET_TRADE_CANISTER_ID = "gomfy-saaaa-aaaan-q6onq-cai"
const LOCAL_II_CANISTER_ID = "rdmx6-jaaaa-aaaaa-aaadq-cai"

// Replica choice is all-or-nothing. A delegation from mainnet Internet Identity
// is signed with the mainnet root key and a local replica cannot verify it, so
// host, canister and identity provider must always name the SAME network.
export function getIsLocal(): boolean {
  if (typeof window === "undefined") return false
  if (process.env.NEXT_PUBLIC_IC_NETWORK === "ic") return false
  const hostname = window.location.hostname
  return hostname === "localhost" || hostname === "127.0.0.1"
}

export function getHost(): string {
  return getIsLocal() ? LOCAL_IC_HOST : IC_HOST
}

// One agent per identity, not one per call. An HttpAgent caches the subnet node
// keys it needs to verify query signatures, and a fresh agent has an empty cache
// -- so every balance read was firing a second read_state request for keys the
// previous agent had already fetched and thrown away. Reusing the agent turns
// that into one fetch per session.
let cachedAgent: HttpAgent | null = null
let cachedFor: Identity | null = null

/**
 * Long updates (executeTrade) often finish after the /api/v4 sync window.
 * Gateways then return certificate status "processing"; @icp-sdk/core throws
 * UnexpectedV4StatusErrorCode instead of polling — while the canister still
 * completes. Prefer async submit + poll so the client waits for replied.
 */
export function preferAsyncUpdates(agent: HttpAgent): HttpAgent {
  const original = agent.update.bind(agent)
  agent.update = (
    canisterId: Principal | string,
    fields: UpdateOptions,
    pollingOptions?: PollingOptions
  ) =>
    original(
      canisterId,
      { ...fields, callSync: fields.callSync ?? false },
      pollingOptions
    )
  return agent
}

export async function createAgent(identity?: Identity): Promise<HttpAgent> {
  if (cachedAgent && cachedFor === (identity ?? null)) return cachedAgent

  const host = getHost()
  const agent = preferAsyncUpdates(HttpAgent.createSync({ identity, host }))
  if (getIsLocal()) {
    await agent.fetchRootKey()
  }

  cachedAgent = agent
  cachedFor = identity ?? null
  return agent
}

// Signing out has to drop the agent as well as the actor: it holds the
// delegation, so a reused one would keep signing as the previous user.
export function clearAgentCache(): void {
  cachedAgent = null
  cachedFor = null
}

export const WALLET_CANISTER_ID = getIsLocal()
  ? LOCAL_CANISTER_ID
  : process.env.NEXT_PUBLIC_WALLET_CANISTER_ID ?? MAINNET_CANISTER_ID

export const TRADE_CANISTER_ID =
  process.env.NEXT_PUBLIC_TRADE_CANISTER_ID ?? MAINNET_TRADE_CANISTER_ID

export function getIdentityProvider(): string {
  if (getIsLocal()) return withAuthorizePath(`http://${LOCAL_II_CANISTER_ID}.localhost:4943`)
  return withAuthorizePath(process.env.NEXT_PUBLIC_II_URL ?? "https://id.ai")
}

function withAuthorizePath(url: string): string {
  if (url.includes("#")) return url
  const base = url.replace(/\/$/, "")
  return base.endsWith("/authorize") ? base : `${base}/authorize`
}

// Must stay identical to public/.well-known/ii-alternative-origins, which the
// canister serves and II actually checks against. An origin missing here just
// falls back to its own principal instead of the shared one.
const ALTERNATIVE_ORIGINS = [
  "https://ic-pay.vercel.app",
  "https://icpay.app",
  "https://www.icpay.app",
]

// Internet Identity derives a principal from the origin that asked for it, so
// the same II account yields a different principal -- and therefore a different
// wallet and balance -- on each origin the app is served from. Naming one
// canister origin makes every deployment resolve to that single principal.
//
// This value is permanent: changing it changes every user's principal and
// strands the funds held under the old one.
export function getDerivationOrigin(): string | undefined {
  const origin = process.env.NEXT_PUBLIC_DERIVATION_ORIGIN || undefined
  if (!origin) return undefined
  if (typeof window === "undefined") return origin
  // II only accepts a derivationOrigin when the page origin is the origin itself
  // or is listed in its ii-alternative-origins file. A dev server is neither,
  // and the list cannot fix that since II requires https and rejects localhost.
  const here = window.location.origin
  if (here === origin) return origin
  return ALTERNATIVE_ORIGINS.includes(here) ? origin : undefined
}
