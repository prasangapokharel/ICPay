"use client"

import { useEffect } from "react"
import useSWR, { useSWRConfig } from "swr"
import useSWRImmutable from "swr/immutable"
import type { Identity } from "@icp-sdk/core/agent"
import { Principal } from "@icp-sdk/core/principal"
import { useAuth } from "@/components/auth/auth-provider"
import { readHoldings, writeHoldings, patchHoldings } from "@/lib/holdings-cache"
import { requiredBalance, requiredIcpSwapBalance, icpServiceDebit } from "@/lib/swap-utils"
import type { DashboardData, UserPublic } from "@/services/types"
import { getDashboard } from "@/services/dashboard/dashboard"
import { getDepositAddress } from "@/services/deposit/deposit"
import { getTransactions } from "@/services/transactions/transactions"
import { getProfile, resolveUsername, searchUsers, getRecipientProfile } from "@/services/profile/profile"
import { listBookmarks } from "@/services/bookmark/bookmark"
import { USERNAME_MIN_LENGTH } from "@/lib/username"
import { checkUsername } from "@/services/buy/buy"
import { compareBySuggestion } from "@/lib/verifed/premium-tick"
import { fetchAccountStats, type AccountStats } from "@/services/account/account"
import {
  listLedgerIds,
  listLaunchedLedgerIds,
  fetchBalances,
  fetchTokenMetadata,
  custodialSubaccount,
  ICP_LEDGER_ID,
  PINNED_LEDGER_IDS,
  type TokenHolding,
} from "@/services/tokens"

// Keys are arrays so every page asking for the same data hits one cache entry.
// The principal is included so switching identity cannot serve a stale balance.
const keyFor = (identity: Identity | undefined, ...parts: string[]) =>
  identity ? ([...parts, identity.getPrincipal().toText()] as const) : null

// getDashboard is a query, but a heavy one — it walks the ledger, so it is
// fetched once and refreshed on explicit action rather than on focus or
// remount. Queries are free on the IC, so the retry cap is a courtesy to the
// ledger, not a cycles concern.
const FETCH_ONCE = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  revalidateIfStale: false,
  keepPreviousData: true,
  dedupingInterval: 300_000,
  errorRetryCount: 3,
} as const

export function useDashboard() {
  const { identity } = useAuth()

  const { data, error, isLoading, mutate } = useSWR(
    keyFor(identity, "dashboard"),
    () => getDashboard(identity),
    FETCH_ONCE
  )

  return {
    data: data as DashboardData | undefined,
    error,
    isLoading,
    refresh: mutate,
  }
}

// The custodian principal that holds everyone's funds. Read only from
// getDepositAddress, which is a query: taking it from the dashboard as well
// would make every balance read pull in that update call, which is the cost
// this hook exists to avoid.
function useCustodian(): Principal | undefined {
  const { data: deposit } = useDepositAddress()
  return deposit?.address.owner
}

// One ledger's balance for the signed-in user, read straight from that ledger as
// a query rather than through the dashboard, so a page that only needs a number
// never pays for an update call. Every caller shares one key per ledger, which
// is what keeps /wallet and a token page from asking twice for the same balance.
function useLedgerBalance(ledgerId: string | null) {
  const { identity } = useAuth()
  const custodian = useCustodian()

  const { data, isLoading } = useSWR(
    ledgerId && custodian && identity ? keyFor(identity, "token-balance", ledgerId) : null,
    async () => {
      const balances = await fetchBalances(
        [ledgerId!],
        custodian!,
        custodialSubaccount(identity!.getPrincipal()),
        identity
      )
      return balances.get(ledgerId!) ?? 0n
    },
    { revalidateOnFocus: false, keepPreviousData: true, dedupingInterval: 60_000 }
  )

  return { balance: data, isLoading }
}

// undefined until the ledger answers, which callers render as a skeleton.
// Returning 0n instead would show a real holder an empty wallet.
export function useLiveBalance() {
  return useLedgerBalance(ICP_LEDGER_ID).balance
}

// What the user holds at their OWN principal rather than in ICPay. Funds land
// there whenever a sender drops the subaccount suffix from the deposit address,
// which most exchanges do because they only accept a bare principal.
export function useSelfCustodyBalance(ledgerId: string | null) {
  const { identity } = useAuth()

  const { data } = useSWR(
    ledgerId && identity ? keyFor(identity, "self-custody", ledgerId) : null,
    async () => {
      const balances = await fetchBalances(
        [ledgerId!],
        identity!.getPrincipal(),
        undefined,
        identity
      )
      return balances.get(ledgerId!) ?? 0n
    },
    { revalidateOnFocus: false, keepPreviousData: true, dedupingInterval: 60_000 }
  )

  return data
}

// Pinned tokens plus the ones ICPay launched, not all ~58 ledgers. Two ways to
// end up here: an exchange withdrawal typed against a bare principal, which only
// happens for ICP and the ck tokens; or launching a token, whose whole supply is
// paid to the creator's own principal. Both are sweepable, and flagging funds we
// would then refuse to move is worse than staying quiet.
export function useSelfCustodyPinned() {
  const { identity } = useAuth()

  const { data } = useSWR(
    keyFor(identity, "self-custody-pinned"),
    async () => {
      const launched = await listLaunchedLedgerIds(identity)
      const ids = [...PINNED_LEDGER_IDS, ...launched.filter((id) => !PINNED_LEDGER_IDS.includes(id))]
      return await fetchBalances(ids, identity!.getPrincipal(), undefined, identity)
    },
    { revalidateOnFocus: false, keepPreviousData: true, dedupingInterval: 60_000 }
  )

  return data
}

export function useDepositAddress() {
  const { identity } = useAuth()

  // A principal's deposit address is derived and never changes, so it is read
  // once per session and never revalidated.
  const { data, error, isLoading } = useSWRImmutable(
    keyFor(identity, "deposit-address"),
    () => getDepositAddress(identity)
  )

  return { data, error, isLoading }
}

export function useTransactions(page = 0, pageSize = 20) {
  const { identity } = useAuth()

  const { data, error, isLoading, mutate } = useSWR(
    keyFor(identity, "transactions", String(page), String(pageSize)),
    () => getTransactions(identity, page, pageSize),
    // History changes only when this user moves funds, and every such action
    // already calls useRefreshWallet.
    FETCH_ONCE
  )

  return {
    items: data?.items ?? [],
    total: data?.total ?? 0n,
    error,
    isLoading,
    refresh: mutate,
  }
}

// Only these change when funds move. Matching every key for the principal would
// also refetch the deposit address (derived, constant) and cached username
// lookups, turning one transfer into a burst of calls.
const FUNDS_KEYS = [
  "dashboard",
  "token-balance",
  "transactions",
  "token-balances",
  "self-custody",
  "self-custody-pinned",
]

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
        FUNDS_KEYS.includes(key[0] as string),
      undefined,
      { revalidate: true }
    )
  }
}

export type SwapBalanceUpdate = {
  tokenInId: string
  tokenOutId: string
  amountIn: bigint
  amountOut: bigint
  tokenInFee: bigint
  icpFee: bigint
}

/** Optimistic wallet patch after swap — /wallet updates instantly, then ledgers confirm. */
export function useApplySwapBalances() {
  const { identity } = useAuth()
  const { mutate } = useSWRConfig()
  const refreshWallet = useRefreshWallet()

  return (update: SwapBalanceUpdate) => {
    if (!identity) return
    const principal = identity.getPrincipal().toText()
    const serviceDebit = icpServiceDebit(update.icpFee)
    const tokenDebit =
      update.tokenInId === ICP_LEDGER_ID
        ? requiredIcpSwapBalance(update.amountIn, update.tokenInFee, serviceDebit)
        : requiredBalance(update.amountIn, update.tokenInFee)

    const patchBalanceMap = (map: Map<string, bigint> | undefined) => {
      if (!map) return map
      const next = new Map(map)
      next.set(update.tokenInId, (next.get(update.tokenInId) ?? 0n) - tokenDebit)
      next.set(update.tokenOutId, (next.get(update.tokenOutId) ?? 0n) + update.amountOut)
      if (update.tokenInId !== ICP_LEDGER_ID) {
        next.set(ICP_LEDGER_ID, (next.get(ICP_LEDGER_ID) ?? 0n) - serviceDebit)
      }
      return next
    }

    const balancesKey = keyFor(identity, "token-balances")
    if (balancesKey) {
      mutate(balancesKey, patchBalanceMap, { revalidate: false })
    }

    const inKey = keyFor(identity, "token-balance", update.tokenInId)
    const outKey = keyFor(identity, "token-balance", update.tokenOutId)
    const icpKey = keyFor(identity, "token-balance", ICP_LEDGER_ID)
    if (inKey) {
      mutate(inKey, (bal: bigint | undefined) => (bal ?? 0n) - tokenDebit, { revalidate: false })
    }
    if (outKey) {
      mutate(outKey, (bal: bigint | undefined) => (bal ?? 0n) + update.amountOut, {
        revalidate: false,
      })
    }
    if (icpKey && update.tokenInId !== ICP_LEDGER_ID) {
      mutate(icpKey, (bal: bigint | undefined) => (bal ?? 0n) - serviceDebit, { revalidate: false })
    }

    const patches = [
      { ledgerId: update.tokenInId, delta: -tokenDebit },
      { ledgerId: update.tokenOutId, delta: update.amountOut },
    ]
    if (update.tokenInId !== ICP_LEDGER_ID) {
      patches.push({ ledgerId: ICP_LEDGER_ID, delta: -serviceDebit })
    }
    patchHoldings(principal, patches)

    refreshWallet()
  }
}

// /profile has no dashboard subscriber mounted, so invalidating that key there
// has no fetcher to revalidate with -- and since the dashboard never revalidates
// on stale, the prompt kept reading the old empty username until a hard refresh.
// Writing the record straight in also avoids a second heavy getDashboard.
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

// resolveUsername is a query call, so this is safe to run while the user types.
// The key deliberately omits the principal: this is an unauthenticated lookup
// and keyFor would return null for a signed-out visitor, which reads as "no
// such user" on the public profile page rather than as "not fetched".
export function useResolvedUsername(name: string) {
  const { identity } = useAuth()
  const trimmed = name.trim().toLowerCase()
  // 1 is the shortest handle the backend can issue (the "ultra" paid tier).
  const enabled = trimmed.length >= USERNAME_MIN_LENGTH

  const { data, isLoading } = useSWR(
    enabled ? (["resolve-username", trimmed] as const) : null,
    () => resolveUsername(identity, trimmed),
    // keepPreviousData would show the previous match against the new text, so
    // it is deliberately off.
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      keepPreviousData: false,
      dedupingInterval: 60_000,
    }
  )

  return { principal: data ?? null, isLoading: enabled && isLoading }
}

// Fetches full UserPublic for a resolved username to get createdAt for trust
// signals. Fires only once the principal is confirmed — no wasted call on a
// failed lookup. Same free query path as resolveUsername.
export function useRecipientProfile(username: string, principal: string | null) {
  const { identity } = useAuth()
  const trimmed = username.trim().toLowerCase()
  const enabled = trimmed.length >= USERNAME_MIN_LENGTH && principal !== null

  const { data } = useSWR(
    enabled ? (["recipient-profile", trimmed] as const) : null,
    () => getRecipientProfile(identity, trimmed),
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      keepPreviousData: false,
      dedupingInterval: 120_000,
    }
  )

  return data ?? null
}

// Fetches raw tx count for a recipient principal from the NNS index (free
// query). Used only for the risk score — no subaccount needed because the
// caller wants public on-chain history for that principal, not custodial funds.
export function useRecipientTxCount(principal: string | null) {
  const { identity } = useAuth()
  const { data } = useSWR(
    principal ? (["recipient-tx-count", principal] as const) : null,
    () => fetchAccountStats(principal!, undefined, identity).then((s) => s.txCount),
    { revalidateOnFocus: false, revalidateIfStale: false, dedupingInterval: 120_000 }
  )
  return data ?? null
}

// checkUsername is a query call, so this can run as the buyer types. Availability
// is a state read and cannot be derived locally the way the price can.
export function useUsernameAvailability(name: string) {
  const { identity } = useAuth()
  const trimmed = name.trim().toLowerCase()

  const { data, isLoading } = useSWR(
    trimmed ? keyFor(identity, "check-username", trimmed) : null,
    () => checkUsername(identity, trimmed),
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      // Showing the previous name's verdict against the new text would read as
      // a confident answer about the wrong name.
      keepPreviousData: false,
      dedupingInterval: 30_000,
    }
  )

  return { available: data ?? null, isLoading: trimmed !== "" && isLoading }
}

// Passing an empty string matches every username, which is what fills the
// suggestion list before anyone searches.
export function useUserSearch(search: string, limit = 10) {
  const { identity } = useAuth()
  const trimmed = search.trim().toLowerCase()
  const ownId = useOwnUserId()

  const { data, isLoading } = useSWR(
    keyFor(identity, "search-users", trimmed),
    () => searchUsers(identity, trimmed),
    // searchUsers is a query call, so a refetch costs no cycles. It is the one
    // list that changes underneath you -- someone buys a handle and the old row
    // has to go -- so it revalidates on focus and only dedupes typing bursts.
    { revalidateOnFocus: true, keepPreviousData: true, dedupingInterval: 2_000 }
  )

  // Matched on id, not username: an account that bought a handle keeps its old
  // ones as aliases, and every alias renders the current username. Comparing
  // strings dropped every one of those rows, so the buyer vanished from the
  // list entirely rather than appearing once.
  return {
    users: dedupeById(data ?? [])
      // Only usernamed accounts are addressable, and tipping yourself is not a
      // thing, so neither belongs in the list.
      .filter((u) => u.username.length > 0 && u.id !== ownId)
      // Ranked before the slice: the backend now returns matches in suggestion
      // order, but the client keeps the same sort so ranking stays stable if the
      // response ever comes from an older canister.
      .sort((a, b) => compareBySuggestion(a.username[0] ?? "", b.username[0] ?? ""))
      .slice(0, limit),
    // The list is withheld until the viewer is known, otherwise their own row
    // renders for a moment and then disappears once the filter can be applied.
    isLoading: isLoading || ownId === undefined,
  }
}

// getUser is a query answering in about a second, where the same record inside
// getDashboard rides a heavy ledger query. Anything that only needs the caller's
// own handle or id should read it from here. Keyed as /profile keys it, so the
// claim there mutates this too rather than leaving a second copy behind.
export function useOwnProfile() {
  const { identity } = useAuth()
  return useSWRImmutable(keyFor(identity, "profile"), () => getProfile(identity))
}

export function useBookmarks() {
  const { identity } = useAuth()
  const { data, mutate } = useSWR(
    keyFor(identity, "bookmarks"),
    () => listBookmarks(identity),
    { revalidateOnFocus: false, dedupingInterval: 30_000 }
  )
  return { bookmarks: data ?? [], mutate }
}

// The self-filter needs it before the list paints, so it is read from the fast
// path.
function useOwnUserId(): string | undefined {
  return useOwnProfile().data?.id
}

// Buying a handle keeps the old one as an alias, and a canister that still
// keys the listing by handle emits the account once per handle it has held.
// Every copy renders the current username, so one person shows up as several
// identical rows. Deduping here keeps the list right whatever the canister does.
function dedupeById(users: UserPublic[]): UserPublic[] {
  const seen = new Set<string>()
  return users.filter((u) => !seen.has(u.id) && seen.add(u.id))
}

// Read straight from each ICRC-1 ledger, never through the wallet canister:
// icrc1_balance_of is a query, so the sweep costs no cycles and adds no backend
// load.
export function useTokenHoldings() {
  const { identity } = useAuth()
  const custodian = useCustodian()

  // Phase 1 -- balances only, across every known ledger. Discovery is folded in
  // so the whole sweep is one cache entry.
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

  // Phase 2 -- metadata for every discovered ledger, not just the held ones. A
  // token nobody holds still needs a name and a logo to be worth depositing to,
  // and naming all of them is now one request to the NNS token index rather than
  // one ledger call each. Keyed by the id list so it refetches when a new token
  // appears rather than on every balance change, and immutable because a symbol
  // and decimals never change.
  const shownIds = balances ? [...balances.keys()].sort() : []
  const { data: metadata, isLoading: loadingMetadata } = useSWRImmutable(
    shownIds.length ? (["token-metadata", shownIds.join(",")] as const) : null,
    async () => {
      const entries = await Promise.all(shownIds.map((id) => fetchTokenMetadata(id, identity)))
      return new Map(entries.flatMap((m) => (m ? [[m.ledgerId, m] as const] : [])))
    }
  )

  const holdings: TokenHolding[] = shownIds.flatMap((ledgerId) => {
    const meta = metadata?.get(ledgerId)
    // A row whose metadata has not landed is withheld rather than shown as
    // "UNKNOWN", so the list never flashes placeholder symbols.
    if (!meta) return []
    return [{ ...meta, balance: balances!.get(ledgerId)! }]
  })

  const principal = identity?.getPrincipal().toText()

  useEffect(() => {
    if (principal && holdings.length > 0) writeHoldings(principal, holdings)
    // Serialised because the array identity changes every render; only a real
    // change in the numbers should rewrite the cache.
  }, [principal, holdings.map((h) => `${h.ledgerId}:${h.balance}`).join(",")]) // eslint-disable-line react-hooks/exhaustive-deps

  // A reload has an empty SWR cache, so the real list takes a ledger sweep to
  // arrive and the wallet reads as empty until it does. The last known holdings
  // stand in for that window rather than a skeleton.
  const seeded = holdings.length === 0 && principal ? readHoldings(principal) : undefined
  const shown = seeded ?? holdings

  return {
    // ICP, then anything held, then the chain-key tokens, then the rest by
    // symbol. Now that every discovered ledger renders, the pinned ones need
    // their own tier or they sort into the alphabetical run among ~38 zeros --
    // the tokens most users came for would be somewhere under "c".
    holdings: shown.slice().sort((a, b) => {
      if (a.ledgerId === ICP_LEDGER_ID) return -1
      if (b.ledgerId === ICP_LEDGER_ID) return 1
      if (a.balance > 0n !== b.balance > 0n) return a.balance > 0n ? -1 : 1
      const pinnedA = PINNED_LEDGER_IDS.includes(a.ledgerId)
      if (pinnedA !== PINNED_LEDGER_IDS.includes(b.ledgerId)) return pinnedA ? -1 : 1
      return a.symbol.localeCompare(b.symbol)
    }),
    isLoading:
      shown.length === 0 &&
      (loadingBalances || (shownIds.length > 0 && loadingMetadata && !metadata)),
  }
}

// The symbol and scale for a ledger, without its balance. Transaction rows carry
// a ledgerId and nothing else, so every row was labelled "ICP" whatever token it
// actually moved. Shares useTokenHolding's key, and seeds from the holdings cache
// so a row renders its real ticker on the first paint rather than after a round
// trip. ICP is the fallback because its ledger publishes no metadata.
export function useLedgerSymbol(ledgerId: string): { symbol: string; decimals: number } {
  const { identity } = useAuth()
  const { data } = useSWRImmutable(["token-metadata-one", ledgerId] as const, () =>
    fetchTokenMetadata(ledgerId, identity)
  )

  const principal = identity?.getPrincipal().toText()
  const cached = data
    ? undefined
    : principal
      ? readHoldings(principal)?.find((h) => h.ledgerId === ledgerId)
      : undefined
  const meta = data ?? cached

  return { symbol: meta?.symbol ?? "ICP", decimals: meta?.decimals ?? 8 }
}

// One token by ledger id. Reads that single ledger rather than mounting
// useTokenHoldings: the sweep is ~50 balance calls and this page renders one row,
// so a deep link or a refresh here paid for the whole wallet. It shares
// useLedgerBalance's key, so arriving from /wallet reuses the cached balance.
export function useTokenHolding(ledgerId: string | null) {
  const { identity } = useAuth()
  const { balance, isLoading: loadingBalance } = useLedgerBalance(ledgerId)

  const { data: meta, isLoading: loadingMeta } = useSWRImmutable(
    ledgerId ? (["token-metadata-one", ledgerId] as const) : null,
    () => fetchTokenMetadata(ledgerId!, identity)
  )

  // Same reason as useTokenHoldings: on a reload neither the metadata nor the
  // balance is cached, so the page held a skeleton for the whole round trip.
  const principal = identity?.getPrincipal().toText()
  const cached =
    !meta && ledgerId && principal
      ? readHoldings(principal)?.find((h) => h.ledgerId === ledgerId)
      : undefined

  // The balance is not awaited before rendering: the symbol and logo are what
  // identify the page, and 0n reads correctly for a token held in no amount.
  const token: TokenHolding | undefined = meta
    ? { ...meta, balance: balance ?? cached?.balance ?? 0n }
    : cached

  return {
    token,
    isLoading: !cached && (loadingMeta || (loadingBalance && balance === undefined)),
  }
}

// Public account stats for any principal, read straight from the NNS index
// canister by query -- the ICPay canister is never involved, so viewing a
// profile costs it nothing.
export function useAccountStats(owner: string | null) {
  const { identity } = useAuth()
  const custodian = useCustodian()?.toText()

  const { data, isLoading } = useSWR(
    // The custodian is in the key because the fetcher reads it: without it the
    // first render caches a stats-at-own-principal result under the same key the
    // custodial lookup wants, and SWR never refetches once the dashboard lands.
    owner && custodian ? (["account-stats", owner, custodian] as const) : null,
    async () => {
      // An ICPay user's funds sit in a subaccount under the custodian, not at
      // their own principal, so the balance is looked up where it actually is.
      const stats = await fetchAccountStats(
        custodian!,
        custodialSubaccount(Principal.fromText(owner!)),
        identity
      )
      writeCachedStats(owner!, stats)
      return stats
    },
    {
      // The seed is the last value seen for this account, so a revisit paints
      // real numbers before the query lands rather than a skeleton.
      fallbackData: owner ? readCachedStats(owner) : undefined,
      revalidateOnFocus: false,
      keepPreviousData: false,
      dedupingInterval: 60_000,
    }
  )

  return { stats: data, isLoading: isLoading && !data }
}

const STATS_KEY = "icpay:stats:"

function readCachedStats(owner: string): AccountStats | undefined {
  if (typeof window === "undefined") return undefined
  try {
    const raw = localStorage.getItem(STATS_KEY + owner)
    if (!raw) return undefined
    const j = JSON.parse(raw)
    return {
      balance: BigInt(j.balance),
      txCount: j.txCount,
      firstBlock: j.firstBlock === null ? undefined : BigInt(j.firstBlock),
      lastBlock: j.lastBlock === null ? undefined : BigInt(j.lastBlock),
    }
  } catch {
    // A stale entry from an older shape is not worth reasoning about; the query
    // is already in flight and will overwrite it.
    return undefined
  }
}

function writeCachedStats(owner: string, s: AccountStats) {
  try {
    localStorage.setItem(
      STATS_KEY + owner,
      JSON.stringify({
        balance: s.balance.toString(),
        txCount: s.txCount,
        firstBlock: s.firstBlock?.toString() ?? null,
        lastBlock: s.lastBlock?.toString() ?? null,
      })
    )
  } catch {
    // Private-browsing quota rejections must not break the profile.
  }
}
