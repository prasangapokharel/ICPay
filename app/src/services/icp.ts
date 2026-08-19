import { HttpAgent, type Identity } from '@icp-sdk/core/agent'
import { Platform } from 'react-native'
import {
  DERIVATION_ORIGIN,
  IC_HOST,
  II_URL,
  WALLET_CANISTER_ID as MAINNET_CANISTER_ID,
} from '@/constants/images'

const LOCAL_IC_HOST = 'http://127.0.0.1:4943'
const LOCAL_CANISTER_ID = 'u6s2n-gx777-77774-qaaba-cai'

const ALTERNATIVE_ORIGINS = [
  'https://ic-pay.vercel.app',
  'https://icpay.app',
  'https://www.icpay.app',
]

export function getIsLocal(): boolean {
  return process.env.EXPO_PUBLIC_IC_NETWORK === 'local'
}

export function getHost(): string {
  return getIsLocal() ? LOCAL_IC_HOST : IC_HOST
}

let cachedAgent: HttpAgent | null = null
let cachedFor: Identity | null = null

export async function createAgent(identity?: Identity): Promise<HttpAgent> {
  if (cachedAgent && cachedFor === (identity ?? null)) return cachedAgent

  const agent = HttpAgent.createSync({ identity, host: getHost() })
  if (getIsLocal()) await agent.fetchRootKey()

  cachedAgent = agent
  cachedFor = identity ?? null
  return agent
}

export function clearAgentCache(): void {
  cachedAgent = null
  cachedFor = null
}

export const WALLET_CANISTER_ID = getIsLocal()
  ? LOCAL_CANISTER_ID
  : (process.env.EXPO_PUBLIC_WALLET_CANISTER_ID ?? MAINNET_CANISTER_ID)

export function getIdentityProvider(): string {
  return process.env.EXPO_PUBLIC_II_URL ?? II_URL
}

export const NFID_PROVIDER =
  'https://nfid.one/authenticate/?applicationName=ICPay#authorize'

export function getDerivationOrigin(): string | undefined {
  const origin = process.env.EXPO_PUBLIC_DERIVATION_ORIGIN ?? DERIVATION_ORIGIN
  if (Platform.OS !== 'web') return undefined
  if (typeof window === 'undefined') return undefined
  const here = window.location.origin
  if (here === origin) return origin
  return ALTERNATIVE_ORIGINS.includes(here) ? origin : undefined
}

