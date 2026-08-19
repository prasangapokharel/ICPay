import { isPremiumHandle } from "@/lib/verified/premiumTick"

/** Hosting requires a paid username (ultra 1–3 chars or premium 4 chars). */
export function canCreateLiveRoom(username: string | null | undefined): boolean {
  return isPremiumHandle(username)
}
