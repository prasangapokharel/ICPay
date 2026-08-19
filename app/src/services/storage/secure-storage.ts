import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'

function safeKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9._-]/g, '.')
}

const native = Platform.OS !== 'web'

export async function getSecure(key: string): Promise<string | null> {
  const k = safeKey(key)
  if (!native) return AsyncStorage.getItem(k)
  try {
    return await SecureStore.getItemAsync(k)
  } catch {
    return null
  }
}

export async function setSecure(key: string, value: string): Promise<void> {
  const k = safeKey(key)
  if (!native) {
    await AsyncStorage.setItem(k, value)
    return
  }
  await SecureStore.setItemAsync(k, value, {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
  })
}

export async function removeSecure(key: string): Promise<void> {
  const k = safeKey(key)
  if (!native) {
    await AsyncStorage.removeItem(k)
    return
  }
  try {
    await SecureStore.deleteItemAsync(k)
  } catch {
    // Missing or unsupported store should not block logout.
  }
}
