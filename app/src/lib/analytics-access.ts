import { USERNAME_MIN_LENGTH } from "@/lib/username"

export const ANALYTICS_MAX_USERNAME_LENGTH = 4

export const ANALYTICS_EXPORT_FEE_E8S = 10_000_000n

export function hasAnalyticsAccess(username: string | null | undefined): boolean {
  if (!username) return false
  const name = username.replace(/^@/, "").trim()
  return name.length >= USERNAME_MIN_LENGTH && name.length <= ANALYTICS_MAX_USERNAME_LENGTH
}

export function hasFreeAnalyticsExport(username: string | null | undefined): boolean {
  return hasAnalyticsAccess(username)
}
