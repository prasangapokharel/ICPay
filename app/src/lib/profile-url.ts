import { Platform } from 'react-native'

export function profileUrlFor(username: string): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}/${username}`
  }
  return `https://icpay.app/${username}`
}
