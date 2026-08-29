import { mutate as globalMutate, unstable_serialize } from "swr"
import { cache } from "swr/_internal"
import type { Identity } from "@icp-sdk/core/agent"
import type { DashboardData, UserPublic } from "@/services/types"
import type { DepositAddress } from "@/services/deposit/deposit"
import { getDashboard } from "@/services/dashboard/dashboard"
import { getDepositAddress } from "@/services/deposit/deposit"

export function walletKey(identity: Identity | undefined, ...parts: string[]) {
  return identity ? ([...parts, identity.getPrincipal().toText()] as const) : null
}

export function balancesCacheKey(identity: Identity, customLedgerIds: string[]) {
  const customKey = [...customLedgerIds].sort().join(",")
  return walletKey(identity, "token-balances", customKey)
}

function readCached<T>(key: readonly string[]): T | undefined {
  return cache.get(unstable_serialize(key))?.data as T | undefined
}

export function depositFromDashboard(data: DashboardData): DepositAddress {
  return {
    address: data.depositAddress,
    accountId: data.depositAccountIdentifier,
  }
}

export function seedDepositAndProfile(identity: Identity, data: DashboardData) {
  const depositKey = walletKey(identity, "deposit-address")
  const profileKey = walletKey(identity, "profile")
  const deposit = depositFromDashboard(data)
  if (depositKey) {
    void globalMutate(depositKey, deposit, { revalidate: false })
  }
  if (profileKey) {
    void globalMutate(profileKey, data.user, { revalidate: false })
  }
}

export async function loadDashboard(identity: Identity): Promise<DashboardData> {
  const data = await getDashboard(identity)
  seedDepositAndProfile(identity, data)
  return data
}

export async function resolveDeposit(identity: Identity): Promise<DepositAddress> {
  const key = walletKey(identity, "deposit-address")
  if (!key) return getDepositAddress(identity)

  const cached = readCached<DepositAddress>(key)
  if (cached) return cached

  const dashKey = walletKey(identity, "dashboard")
  const cachedDash = dashKey ? readCached<DashboardData>(dashKey) : undefined
  if (cachedDash) {
    const deposit = depositFromDashboard(cachedDash)
    seedDepositAndProfile(identity, cachedDash)
    return deposit
  }

  const data = await getDashboard(identity)
  seedDepositAndProfile(identity, data)
  return depositFromDashboard(data)
}

export async function resolveProfile(identity: Identity): Promise<UserPublic | null> {
  const key = walletKey(identity, "profile")
  if (!key) {
    const { getProfile } = await import("@/services/profile/profile")
    return getProfile(identity)
  }

  const cached = readCached<UserPublic | null>(key)
  if (cached) return cached

  const dashKey = walletKey(identity, "dashboard")
  const cachedDash = dashKey ? readCached<DashboardData>(dashKey) : undefined
  if (cachedDash) {
    void globalMutate(key, cachedDash.user, { revalidate: false })
    return cachedDash.user
  }

  const { getProfile } = await import("@/services/profile/profile")
  const user = await getProfile(identity)
  void globalMutate(key, user, { revalidate: false })
  return user
}
