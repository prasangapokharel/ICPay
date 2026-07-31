import { HttpAgent, type Identity } from "@dfinity/agent"
import type { Principal } from "@dfinity/principal"

const LOCAL_IC_HOST = "http://127.0.0.1:4943"
const IC_HOST = "https://icp0.io"
const LOCAL_CANISTER_ID = "u6s2n-gx777-77774-qaaba-cai"
const MAINNET_CANISTER_ID = "6vbhm-nqaaa-aaaan-q6muq-cai"
const LOCAL_II_CANISTER_ID = "rdmx6-jaaaa-aaaaa-aaadq-cai"

// Replica choice is all-or-nothing. A delegation from mainnet Internet Identity
// is signed with the mainnet root key and a local replica cannot verify it (it
// fails as "Invalid delegation / Invalid canister signature"), so host, canister
// and identity provider must always name the SAME network. Deriving all three
// from this single value is what keeps them from drifting apart.
export function getIsLocal(): boolean {
  if (typeof window === "undefined") return false
  if (process.env.NEXT_PUBLIC_IC_NETWORK === "ic") return false
  const hostname = window.location.hostname
  return hostname === "localhost" || hostname === "127.0.0.1"
}

export function getHost(): string {
  return getIsLocal() ? LOCAL_IC_HOST : IC_HOST
}

export async function createAgent(identity?: Identity): Promise<HttpAgent> {
  const host = getHost()
  const agent = HttpAgent.createSync({ identity, host })
  if (getIsLocal()) {
    await agent.fetchRootKey()
  }
  return agent
}

export function idlToPrincipal(principal: Principal): string {
  return principal.toText()
}

export function principalToIdl(principalText: string): string {
  return principalText
}

export const WALLET_CANISTER_ID = getIsLocal()
  ? LOCAL_CANISTER_ID
  : process.env.NEXT_PUBLIC_WALLET_CANISTER_ID ?? MAINNET_CANISTER_ID

export function getIdentityProvider(): string {
  if (getIsLocal()) return `http://${LOCAL_II_CANISTER_ID}.localhost:4943`
  return process.env.NEXT_PUBLIC_II_URL ?? "https://id.ai"
}

// Internet Identity derives a principal from the origin that asked for it, so
// the same II account yields a different principal -- and therefore a different
// wallet and balance -- on each origin the app is served from. Naming one
// canister origin here makes every deployment resolve to that single principal.
// The canister must serve /.well-known/ii-alternative-origins listing the other
// origins; II rejects a derivationOrigin that is not canister-hosted.
//
// This value is permanent: changing it changes every user's principal and
// strands the funds held under the old one.
export function getDerivationOrigin(): string | undefined {
  if (getIsLocal()) return undefined
  return process.env.NEXT_PUBLIC_DERIVATION_ORIGIN || undefined
}
