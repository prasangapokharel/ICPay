import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import * as Crypto from 'expo-crypto'
import { getItem, setItem, removeItem } from '@/services/storage/kv'

const ON_SEND_KEY = 'icpay:lock:on-send'
const PIN_KEY = 'icpay:lock:pin'
const PAY_OK_KEY = 'icpay:pay:ok'

export function isSendLockEnabled(): boolean {
  return getItem(ON_SEND_KEY) === '1'
}

export function isPayVerified(): boolean {
  return getItem(PAY_OK_KEY) === '1'
}

export function setSendLockEnabled(value: boolean): void {
  setItem(ON_SEND_KEY, value ? '1' : '0')
}

export function setPayVerified(value: boolean): void {
  if (value) setItem(PAY_OK_KEY, '1')
  else removeItem(PAY_OK_KEY)
}

export async function hasPin(): Promise<boolean> {
  return (await readPinHash()) !== null
}

export async function savePin(pin: string): Promise<void> {
  await writePinHash(await hashPin(pin))
}

export async function verifyPin(pin: string): Promise<boolean> {
  const stored = await readPinHash()
  if (!stored) return false
  return stored === (await hashPin(pin))
}

export function clearLock(): void {
  setSendLockEnabled(false)
  setPayVerified(false)
  void deletePinHash()
}

async function hashPin(pin: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `icpay:pin:${pin}`)
}

async function readPinHash(): Promise<string | null> {
  if (Platform.OS === 'web') return getItem(PIN_KEY)
  try {
    return await SecureStore.getItemAsync(PIN_KEY)
  } catch {
    return getItem(PIN_KEY)
  }
}

async function writePinHash(hash: string): Promise<void> {
  if (Platform.OS === 'web') {
    setItem(PIN_KEY, hash)
    return
  }
  try {
    await SecureStore.setItemAsync(PIN_KEY, hash)
  } catch {
    setItem(PIN_KEY, hash)
  }
}

async function deletePinHash(): Promise<void> {
  removeItem(PIN_KEY)
  if (Platform.OS === 'web') return
  try {
    await SecureStore.deleteItemAsync(PIN_KEY)
  } catch {
    /* already cleared */
  }
}
