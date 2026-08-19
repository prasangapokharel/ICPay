import { isPremiumHandle } from '@/lib/verifed/premium-tick'

export function canCreateLiveRoom(username: string | null | undefined): boolean {
  return isPremiumHandle(username)
}
