import * as WebBrowser from 'expo-web-browser'
import * as Linking from 'expo-linking'
import {
  DelegationChain,
  Ed25519KeyIdentity,
  isDelegationValid,
} from '@icp-sdk/core/identity'
import type { Identity } from '@icp-sdk/core/agent'
import { persistIdentity } from '@/services/auth/auth'
import type { OpenIdProvider } from '@/constants/images'

WebBrowser.maybeCompleteAuthSession()

export const II_CALLBACK = 'icpay://ii-callback'
export const AUTH_BRIDGE_URL = 'https://icpay.app/native-auth'

export type AuthBridgeOptions = {
  provider?: string
  openIdProvider?: OpenIdProvider
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

function sameBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  let n = 0
  for (let i = 0; i < a.length; i++) n |= a[i] ^ b[i]
  return n === 0
}

function resolveOptions(options?: AuthBridgeOptions | string): AuthBridgeOptions {
  return typeof options === 'string' ? { provider: options } : (options ?? {})
}

export function buildAuthBridgeUrl(session: Ed25519KeyIdentity, options?: AuthBridgeOptions | string): string {
  const { provider, openIdProvider } = resolveOptions(options)
  const params = new URLSearchParams({
    appKey: toHex(new Uint8Array(session.getPublicKey().toDer())),
    redirect: II_CALLBACK,
  })
  if (provider) params.set('provider', provider)
  if (openIdProvider) params.set('openIdProvider', openIdProvider)
  return `${AUTH_BRIDGE_URL}#${params.toString()}`
}

export async function identityFromCallback(url: string, session: Ed25519KeyIdentity): Promise<Identity> {
  const parsed = url.includes('#') ? url.slice(url.indexOf('#') + 1) : ''
  const payload = new URLSearchParams(parsed).get('delegation')
  if (!payload) throw new Error('Internet Identity did not return a session.')
  const chain = DelegationChain.fromJSON(JSON.parse(decodeURIComponent(payload)))
  if (!isDelegationValid(chain)) throw new Error('That sign-in expired. Try again.')
  const last = chain.delegations.at(-1)?.delegation.pubkey
  const expected = new Uint8Array(session.getPublicKey().toDer())
  if (!last || !sameBytes(new Uint8Array(last), expected)) {
    throw new Error('Sign-in did not match this device session.')
  }
  return persistIdentity(session, chain)
}

export function createAuthSession(): Ed25519KeyIdentity {
  return Ed25519KeyIdentity.generate()
}

export async function loginWithNative(
  options?: AuthBridgeOptions | string,
  session = createAuthSession(),
): Promise<Identity | null> {
  const authUrl = buildAuthBridgeUrl(session, options)
  const result = await WebBrowser.openAuthSessionAsync(authUrl, II_CALLBACK)
  if (result.type !== 'success' || !('url' in result) || !result.url) return null
  return identityFromCallback(result.url, session)
}

export function openAuthInBrowser(
  options?: AuthBridgeOptions | string,
  session = createAuthSession(),
): Ed25519KeyIdentity {
  void Linking.openURL(buildAuthBridgeUrl(session, options))
  return session
}
