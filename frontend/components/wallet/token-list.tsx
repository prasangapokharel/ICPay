"use client"

import { useMemo, useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, Search01Icon } from "@hugeicons/core-free-icons"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { formatTokenAmount } from "@/lib/wallet/utils"
import { type TokenHolding, type TokenMetadata } from "@/services/tokens"
import { TokenLogo } from "@/components/token/token-logo"
import { AddTokenDrawer } from "@/components/wallet/add-token-drawer"
import { useAuth } from "@/components/auth/auth-provider"
import { prefetchAppRoute } from "@/lib/navigation/prefetchRoute"
import { readHideZeroBalances, writeHideZeroBalances, HIDE_ZERO_EVENT } from "@/lib/wallet/tokenListPrefs"
import { cn } from "@/lib/ui/utils"

const PAGE_SIZE = 12

function useHideZeroBalances() {
  return useSyncExternalStore(
    (onStoreChange) => {
      const onChange = () => onStoreChange()
      window.addEventListener(HIDE_ZERO_EVENT, onChange)
      window.addEventListener("storage", onChange)
      return () => {
        window.removeEventListener(HIDE_ZERO_EVENT, onChange)
        window.removeEventListener("storage", onChange)
      }
    },
    () => readHideZeroBalances(),
    () => true
  )
}

function matchesSearch(token: TokenHolding, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    token.symbol.toLowerCase().includes(q) ||
    token.name.toLowerCase().includes(q) ||
    token.ledgerId.toLowerCase().includes(q)
  )
}

export function TokenList({
  holdings,
  isLoading,
  outside,
  existingLedgerIds = [],
  onAddCustom,
}: {
  holdings: TokenHolding[]
  isLoading: boolean
  outside?: Map<string, bigint>
  existingLedgerIds?: string[]
  onAddCustom?: (ledgerId: string, meta: TokenMetadata) => void
}) {
  const t = useTranslations("wallet")
  const tPage = useTranslations("transactions")
  const [addOpen, setAddOpen] = useState(false)
  const [query, setQuery] = useState("")
  const hideZero = useHideZeroBalances()
  const filterKey = `${query}|${hideZero}|${holdings.length}`
  const [pageState, setPageState] = useState({ key: filterKey, page: 0 })
  const page = pageState.key === filterKey ? pageState.page : 0
  const setPage = (next: number) => setPageState({ key: filterKey, page: next })

  const filtered = useMemo(() => {
    return holdings.filter((token) => {
      if (hideZero && token.balance === 0n) return false
      return matchesSearch(token, query)
    })
  }, [holdings, hideZero, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const pageItems = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)
  const hasNext = safePage < totalPages - 1
  const hasPrev = safePage > 0

  const toolbar = (
    <div className="space-y-3 border-b border-border/60 pb-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">{t("tokens")}</p>
        {onAddCustom ? (
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="size-8 rounded-full"
            aria-label={t("addToken")}
            onClick={() => setAddOpen(true)}
          >
            <HugeiconsIcon icon={Add01Icon} className="size-4" strokeWidth={2} />
          </Button>
        ) : null}
      </div>

      <div className="relative">
        <HugeiconsIcon
          icon={Search01Icon}
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          strokeWidth={1.75}
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchTokens")}
          className="h-9 pl-9"
          aria-label={t("searchTokens")}
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="hide-zero-balances"
          checked={hideZero}
          onCheckedChange={(checked) => {
            writeHideZeroBalances(checked === true)
          }}
        />
        <Label htmlFor="hide-zero-balances" className="text-sm font-normal text-muted-foreground">
          {t("hideZeroBalances")}
        </Label>
      </div>
    </div>
  )

  if (isLoading && holdings.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-4">
        {toolbar}
        <div className="mt-4 space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl px-2 py-2.5">
              <Skeleton className="size-9 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-14" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (holdings.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-4">
        {toolbar}
        <p className="py-8 text-center text-sm text-muted-foreground">{t("noTokens")}</p>
        {onAddCustom ? (
          <AddTokenDrawer
            open={addOpen}
            onOpenChange={setAddOpen}
            existingIds={existingLedgerIds}
            onAdded={onAddCustom}
          />
        ) : null}
      </div>
    )
  }

  return (
    <div className="rounded-2xl border bg-card p-4">
      {toolbar}

      {pageItems.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">{t("noTokensFound")}</p>
      ) : (
        <div className="mt-2 divide-y divide-border/60">
          {pageItems.map((token) => (
            <TokenRow
              key={token.ledgerId}
              token={token}
              outside={
                (outside?.get(token.ledgerId) ?? 0n) > token.fee
                  ? outside!.get(token.ledgerId)!
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {filtered.length > PAGE_SIZE ? (
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/60 pt-4">
          <p className="text-xs text-muted-foreground">
            {tPage("page", { page: safePage + 1, total: totalPages })}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={!hasPrev} onClick={() => setPage(safePage - 1)}>
              {tPage("previous")}
            </Button>
            <Button variant="outline" size="sm" disabled={!hasNext} onClick={() => setPage(safePage + 1)}>
              {tPage("next")}
            </Button>
          </div>
        </div>
      ) : null}

      {onAddCustom ? (
        <AddTokenDrawer
          open={addOpen}
          onOpenChange={setAddOpen}
          existingIds={existingLedgerIds}
          onAdded={onAddCustom}
        />
      ) : null}
    </div>
  )
}

function TokenRow({ token, outside }: { token: TokenHolding; outside?: bigint }) {
  const t = useTranslations("wallet")
  const { identity } = useAuth()
  const href = `/token/${token.ledgerId}`

  return (
    <Link
      href={href}
      prefetch
      onMouseEnter={() => prefetchAppRoute(href, identity)}
      onFocus={() => prefetchAppRoute(href, identity)}
      className={cn(
        "flex items-center gap-3 rounded-xl px-2 py-3 transition-colors",
        "hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none"
      )}
    >
      <TokenLogo token={token} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{token.symbol}</p>
        <p className="truncate text-xs text-muted-foreground">{token.name}</p>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-sm font-semibold tabular-nums">
          {formatTokenAmount(token.balance, token.decimals)}
        </p>
        {outside !== undefined ? (
          <p className="mt-0.5 text-[11px] font-medium text-primary tabular-nums">
            {t("outsideAmount", {
              amount: formatTokenAmount(outside, token.decimals),
            })}
          </p>
        ) : null}
      </div>
    </Link>
  )
}
