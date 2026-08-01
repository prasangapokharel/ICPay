"use client"

import useSWR, { useSWRConfig } from "swr"
import type { Identity } from "@dfinity/agent"
import { getWalletActor } from "@/services/wallet"
import { useAuth } from "@/components/auth/auth-provider"
import type { DashboardData, TransactionPublic, UserPublic } from "@/services/types"
import {
  listLedgerIds,
  fetchBalances,
  fetchTokenMetadata,
  custodialSubaccount,
  ICP_LEDGER_ID,
  type TokenHolding,
} from "@/services/tokens"

// Keys are arrays so every page asking for the same data hits one cache entry.
// The principal is part of the key: switching identity must not serve the
// previous user's cached balance.
const keyFor = (identity: Identity | undefined, ...parts: string[]) =>
  identity ? ([...parts, identity.getPrincipal().toText()] as const) : null

export function useDashboard() {
  const { identity } = useAuth()

  const { data, error, isLoading, mutate } = useSWR(
    keyFor(identity, "dashboard"),
    async () => {
      const actor = await getWalletActor(identity!)
      const result = await actor.getDashboard()
      if ("err" in result) throw new Error(result.err)
      return result.ok
    },
    // getDashboard is an update call: it goes through consensus and makes an
    // inter-canister call to the ledger, measured at ~6.6s. Revalidating on
    // focus or on remount meant every trip back to the dashboard paid that
    // again, so it is fetched once and then only on explicit refresh --
    // useRefreshWallet already runs after any action that changes the balance.
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      keepPreviousData: true,
      dedupingInterval: 300_000,
    }
  )

  return {
    data: data as DashboardData | undefined,
    error,
    isLoading,
    refresh: mutate,
  }
}

// The dashboard's balance arrives inside a ~6.6s update call. The same number
// is readable straight from the ledger as a query in about a second, so the
// balance card can settle long before the rest of the dashboard does.
export function useLiveBalance() {
  const { identity } = useAuth()
  const { data: dashboard } = useDashboard()
  const custodian = dashboard?.depositAddress.owner

  const { data } = useSWR(
    custodian && identity ? keyFor(identity, "live-balance") : null,
    async () => {
      const balances = await fetchBalances(
        [ICP_LEDGER_ID],
        custodian!,
        custodialSubaccount(identity!.getPrincipal()),
        identity
      )
      return balances.get(ICP_LEDGER_ID) ?? 0n
    },
    { revalidateOnFocus: false, keepPreviousData: true, dedupingInterval: 30_000 }
  )

  // Falls back to the dashboard's copy until the ledger query lands, so the
  // card never renders an empty balance it already knows.
  return data ?? dashboard?.icpBalance
}

export function useDepositAddress() {
  const { identity } = useAuth()

  const { data, error, isLoading } = useSWR(
    keyFor(identity, "deposit-address"),
    async () => {
      const actor = await getWalletActor(identity!)
      const [address, accountId] = await Promise.all([
        actor.getDepositAddress(),
        actor.getDepositAccountIdentifier(),
      ])
      return { address, accountId }
    },
    // A principal's deposit address is derived and never changes, so this can
    // stay cached for the whole session instead of refetching per visit.
    { revalidateOnFocus: false, revalidateIfStale: false }
  )

  return { data, error, isLoading }
}

export function useTransactions(page = 0, pageSize = 20) {
  const { identity } = useAuth()

  const { data, error, isLoading, mutate } = useSWR(
    keyFor(identity, "transactions", String(page), String(pageSize)),
    async () => {
      const actor = await getWalletActor(identity!)
      const result = await actor.getTransactions(BigInt(page), BigInt(pageSize))
      if ("err" in result) throw new Error(result.err)
      return result.ok
    },
    // History only changes when this user moves funds, and every such action
    // already calls useRefreshWallet. Left on SWR's defaults this refetched on
    // each visit to Activity and on every window focus.
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      dedupingInterval: 300_000,
    }
  )

  return {
    items: (data?.items ?? []) as TransactionPublic[],
    total: data?.total ?? 0n,
    error,
    isLoading,
    refresh: mutate,
  }
}

// Only these actually change when funds move. Matching every key for the
// principal instead would also re-fetch the deposit address (derived, constant)
// and cached username lookups, turning one transfer into a burst of calls.
const FUNDS_KEYS = ["dashboard", "live-balance", "transactions", "token-balances"]

// Anything that moves funds invalidates balance and history together, so both
// are refetched from one call rather than each page tracking its own staleness.
export function useRefreshWallet() {
  const { identity } = useAuth()
  const { mutate } = useSWRConfig()

  return () => {
    if (!identity) return
    const principal = identity.getPrincipal().toText()
    mutate(
      (key) =>
        Array.isArray(key) &&
        key[key.length - 1] === principal &&
        FUNDS_KEYS.includes(key[0] as string)
    )
  }
}

// The dashboard carries its own copy of the user record, and the mandatory
// username prompt reads it. /profile has no dashboard subscriber mounted, so a
// plain invalidation there has no fetcher to revalidate with -- and because the
// dashboard is configured revalidateIfStale: false, remounting it just re-served
// the cached record with the empty username until a hard refresh. Writing the
// updated user straight into the cache avoids both the staleness and a second
// ~6.6s getDashboard call.
export function usePatchDashboardUser() {
  const { identity } = useAuth()
  const { mutate } = useSWRConfig()

  return (user: UserPublic) => {
    const key = keyFor(identity, "dashboard")
    if (!key) return
    mutate(
      key,
      (current: DashboardData | undefined) =>
        current ? { ...current, user } : current,
      { revalidate: false }
    )
  }
}

// Resolves a typed username to its principal so the UI can confirm a recipient
// exists before any transfer is attempted. resolveUsername is a query call, so
// this is safe to run while the user types -- it costs no cycles.
export function useResolvedUsername(name: string) {
  const { identity } = useAuth()
  const trimmed = name.trim().toLowerCase()
  // 3 is the minimum the transfer form treats as a candidate username.
  const enabled = trimmed.length >= 3

  const { data, isLoading } = useSWR(
    enabled ? keyFor(identity, "resolve-username", trimmed) : null,
    async () => {
      const actor = await getWalletActor(identity!)
      const [principal] = await actor.resolveUsername(trimmed)
      return principal ? principal.toText() : null
    },
    // Usernames are effectively immutable once claimed, so a resolution can be
    // cached hard. keepPreviousData would show the previous user's card against
    // the new text, so it is deliberately off.
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      keepPreviousData: false,
      dedupingInterval: 60_000,
    }
  )

  return { principal: data ?? null, isLoading: enabled && isLoading }
}

// searchUsers is a query call too. Passing an empty string matches every
// username, which is what fills the suggestion list before anyone searches.
export function useUserSearch(search: string, limit = 10) {
  const { identity } = useAuth()
  const trimmed = search.trim().toLowerCase()
  const { data: dashboard } = useDashboard()

  const { data, isLoading } = useSWR(
    keyFor(identity, "search-users", trimmed),
    async () => {
      const actor = await getWalletActor(identity!)
      const users = await actor.searchUsers(trimmed)
      return users
    },
    { revalidateOnFocus: false, keepPreviousData: true, dedupingInterval: 30_000 }
  )

  // Compared by username, not id: UserPublic.id is a UUID, and searchUsers
  // returns no principal, so the username is the only shared identifier.
  const ownUsername = dashboard?.user.username?.[0]

  return {
    users: (data ?? [])
      // Only usernamed accounts are addressable, and tipping yourself is not a
      // thing, so neither belongs in the list.
      .filter((u) => u.username.length > 0 && u.username[0] !== ownUsername)
      .slice(0, limit),
    isLoading,
  }
}

// Holdings are read straight from each ICRC-1 ledger, never through the wallet
// canister: icrc1_balance_of is a query, so the sweep costs this app nothing in
// cycles and adds no load to the backend.
export function useTokenHoldings() {
  const { identity } = useAuth()
  const { data: dashboard } = useDashboard()
  const custodian = dashboard?.depositAddress.owner

  // Phase 1 -- balances only, across every known ledger. Discovery is folded in
  // here so the whole sweep is one cache entry that either has balances or not.
  const { data: balances, isLoading: loadingBalances } = useSWR(
    custodian && identity ? keyFor(identity, "token-balances") : null,
    async () => {
      const ledgerIds = await listLedgerIds(identity)
      const owner = custodian!
      const subaccount = custodialSubaccount(identity!.getPrincipal())
      return await fetchBalances(ledgerIds, owner, subaccount, identity)
    },
    { revalidateOnFocus: false, keepPreviousData: true, dedupingInterval: 60_000 }
  )

  // Phase 2 -- symbol, decimals and logo for held tokens only. Keyed by the
  // held ledger ids so it refetches when a new token appears, not on every
  // balance change, and skips metadata entirely for the ~50 tokens at zero.
  const heldIds = balances ? [...balances.keys()].sort() : []
  const { data: metadata, isLoading: loadingMetadata } = useSWR(
    heldIds.length ? (["token-metadata", heldIds.join(",")] as const) : null,
    async () => {
      const entries = await Promise.all(heldIds.map((id) => fetchTokenMetadata(id, identity)))
      return new Map(entries.flatMap((m) => (m ? [[m.ledgerId, m] as const] : [])))
    },
    // Token metadata is immutable in practice, so it never needs revalidating.
    { revalidateOnFocus: false, revalidateIfStale: false, dedupingInterval: 3_600_000 }
  )

  const holdings: TokenHolding[] = heldIds.flatMap((ledgerId) => {
    const meta = metadata?.get(ledgerId)
    // A held token whose metadata has not landed yet is withheld rather than
    // shown as "UNKNOWN", so the list never flashes placeholder symbols.
    if (!meta) return []
    return [{ ...meta, balance: balances!.get(ledgerId)! }]
  })

  return {
    // ICP first; the rest by balance so the biggest holding leads.
    holdings: holdings.sort((a, b) => {
      if (a.ledgerId === ICP_LEDGER_ID) return -1
      if (b.ledgerId === ICP_LEDGER_ID) return 1
      return a.symbol.localeCompare(b.symbol)
    }),
    isLoading: loadingBalances || (heldIds.length > 0 && loadingMetadata && !metadata),
  }
}
