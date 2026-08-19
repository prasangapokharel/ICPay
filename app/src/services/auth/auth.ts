import {
  DelegationChain,
  DelegationIdentity,
  Ed25519KeyIdentity,
} from '@icp-sdk/core/identity'
import type { Identity } from '@icp-sdk/core/agent'
import { getWalletActor, clearActorCache } from '@/services/wallet'
import { clearAgentCache } from '@/services/icp'
import { getSecure, removeSecure, setSecure } from '@/services/storage/secure-storage'

const SESSION_KEY = 'icpay.ii-session'

type StoredSession = {
  identity: string
  chain: string
}

export async function restoreIdentity(): Promise<Identity | null> {
  const raw = await getSecure(SESSION_KEY)
  if (!raw) return null
  try {
    const stored = JSON.parse(raw) as StoredSession
    const session = Ed25519KeyIdentity.fromJSON(stored.identity)
    const chain = DelegationChain.fromJSON(JSON.parse(stored.chain))
    return DelegationIdentity.fromDelegation(session, chain)
  } catch {
    await removeSecure(SESSION_KEY)
    return null
  }
}

export async function persistIdentity(
  session: Ed25519KeyIdentity,
  chain: DelegationChain,
): Promise<Identity> {
  const identity = DelegationIdentity.fromDelegation(session, chain)
  await setSecure(
    SESSION_KEY,
    JSON.stringify({
      identity: JSON.stringify(session.toJSON()),
      chain: JSON.stringify(chain.toJSON()),
    } satisfies StoredSession),
  )
  return identity
}

export async function logout(): Promise<void> {
  await removeSecure(SESSION_KEY)
  clearActorCache()
  clearAgentCache()
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`timed out after ${ms}ms`)), ms),
    ),
  ])
}

export async function openBackendSession(identity: Identity): Promise<void> {
  const actor = await getWalletActor(identity)
  await withTimeout(actor.login(), 20_000)
}

export async function discardRejectedSession(): Promise<void> {
  await logout()
}

export function createSessionIdentity(): Ed25519KeyIdentity {
  return Ed25519KeyIdentity.generate()
}
