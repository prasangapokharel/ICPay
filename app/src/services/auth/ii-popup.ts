import { Delegation, DelegationChain } from '@icp-sdk/core/identity'
import { Principal } from '@icp-sdk/core/principal'
import type { Identity } from '@icp-sdk/core/agent'
import { createSessionIdentity, persistIdentity } from '@/services/auth/auth'
import { getDerivationOrigin, getIdentityProvider } from '@/services/icp'

const TTL = 2_592_000_000_000_000n
const POPUP_W = 432
const POPUP_H = 620

type IiDelegation = {
  signature: unknown
  delegation: { pubkey: unknown; expiration: unknown; targets?: unknown }
}

type IiSuccess = {
  kind?: string
  userPublicKey?: unknown
  publicKey?: unknown
  delegations?: IiDelegation[]
}

export class PopupBlockedError extends Error {
  constructor() {
    super('Allow popups for this site, then try again.')
    this.name = 'PopupBlockedError'
  }
}

export function loginWithPopup(provider?: string): Promise<Identity | null> {
  const win = typeof window === 'undefined' ? null : window
  if (!win) return Promise.reject(new Error('Sign-in is only available in a browser.'))

  const identityProvider = provider ?? getIdentityProvider()
  const authorizeUrl = identityProvider.includes('#') ? identityProvider : `${identityProvider}/#authorize`
  const session = createSessionIdentity()

  return new Promise((resolve, reject) => {
    let settled = false
    let popup: Window | null = null
    const key = new Uint8Array(session.getPublicKey().toDer())
    const derivationOrigin = getDerivationOrigin()

    const fail = (error: unknown) => {
      if (settled) return
      settled = true
      win.removeEventListener('message', onMessage)
      clearInterval(tick)
      reject(error instanceof Error ? error : new Error('Could not connect.'))
    }

    const finish = (identity: Identity | null) => {
      if (settled) return
      settled = true
      win.removeEventListener('message', onMessage)
      clearInterval(tick)
      if (popup && !popup.closed) popup.close()
      resolve(identity)
    }

    const onMessage = (event: MessageEvent) => {
      try {
        const data = event.data as IiSuccess | null
        if (!data || typeof data !== 'object') return
        if (data.kind === 'authorize-ready') {
          popup?.postMessage(
            {
              kind: 'authorize-client',
              sessionPublicKey: key,
              maxTimeToLive: TTL,
              ...(derivationOrigin ? { derivationOrigin } : {}),
            },
            event.origin,
          )
          return
        }
        if (data.kind === 'authorize-client-failure') {
          finish(null)
          return
        }
        if (data.kind !== 'authorize-client-success' || !data.delegations) return
        void persistIdentity(session, chainFromIiSuccess(data)).then(finish).catch(fail)
      } catch (error) {
        fail(error)
      }
    }

    win.addEventListener('message', onMessage)
    popup = openCentered(win, authorizeUrl)
    if (!popup) {
      win.removeEventListener('message', onMessage)
      reject(new PopupBlockedError())
      return
    }

    const tick = setInterval(() => {
      if (popup?.closed) finish(null)
    }, 400)
  })
}

function openCentered(win: Window, url: string): Window | null {
  const left = Math.round(win.screenX + (win.outerWidth - POPUP_W) / 2)
  const top = Math.round(win.screenY + (win.outerHeight - POPUP_H) / 2)
  return win.open(
    url,
    'icpay-ii',
    `popup=yes,width=${POPUP_W},height=${POPUP_H},left=${left},top=${top}`,
  )
}

function chainFromIiSuccess(data: IiSuccess): DelegationChain {
  const delegations = (data.delegations ?? []).map((item) => ({
    delegation: new Delegation(
      toBytes(item.delegation.pubkey),
      toExpiration(item.delegation.expiration),
      toTargets(item.delegation.targets),
    ),
    signature: toBytes(item.signature) as never,
  }))
  return DelegationChain.fromDelegations(delegations, toBytes(data.userPublicKey ?? data.publicKey) as never)
}

function toBytes(value: unknown): Uint8Array {
  if (value instanceof Uint8Array) return value
  if (value instanceof ArrayBuffer) return new Uint8Array(value)
  if (ArrayBuffer.isView(value)) {
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength)
  }
  if (Array.isArray(value)) return Uint8Array.from(value as number[])
  if (value && typeof value === 'object' && 'length' in value) {
    return Uint8Array.from(value as ArrayLike<number>)
  }
  if (typeof value === 'string') {
    const hex = value.replace(/^0x/i, '')
    if (hex.length >= 64 && hex.length % 2 === 0 && /^[0-9a-fA-F]+$/.test(hex)) {
      const out = new Uint8Array(hex.length / 2)
      for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
      return out
    }
  }
  throw new Error('Invalid public key.')
}

function toExpiration(value: unknown): bigint {
  if (typeof value === 'bigint') return value
  if (typeof value === 'number') return BigInt(value)
  if (typeof value === 'string') {
    const raw = value.replace(/^0x/i, '')
    return /^[0-9]+$/.test(value) ? BigInt(value) : BigInt(`0x${raw}`)
  }
  throw new Error('Invalid public key.')
}

function toTargets(value: unknown): Principal[] | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined
  return value.map((item) => {
    if (typeof item === 'string') {
      try {
        return Principal.fromText(item)
      } catch {
        return Principal.fromHex(item)
      }
    }
    return Principal.fromUint8Array(toBytes(item))
  })
}
