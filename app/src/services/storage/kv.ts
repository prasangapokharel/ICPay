import AsyncStorage from '@react-native-async-storage/async-storage'

const memory = new Map<string, string>()
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((fn) => fn())
}

export function subscribeKv(fn: () => void): () => void {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

export async function hydrateKv(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys()
  if (keys.length === 0) return
  const pairs = await AsyncStorage.multiGet(keys)
  for (const [key, value] of pairs) {
    if (key && value != null) memory.set(key, value)
  }
}

export function getItem(key: string): string | null {
  return memory.get(key) ?? null
}

export function setItem(key: string, value: string): void {
  memory.set(key, value)
  notify()
  void AsyncStorage.setItem(key, value)
}

export function removeItem(key: string): void {
  memory.delete(key)
  notify()
  void AsyncStorage.removeItem(key)
}
