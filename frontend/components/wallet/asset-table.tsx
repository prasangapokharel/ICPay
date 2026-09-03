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
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatTokenAmount, toPlainTokenAmount } from "@/lib/wallet/utils"
import { formatUsd, formatUsdFull } from "@/lib/market/format"
import { type TokenHolding, type TokenMetadata } from "@/services/tokens"
import { TokenLogo } from "@/components/token/token-logo"
import { AddTokenDrawer } from "@/components/wallet/add-token-drawer"
import { useAuth } from "@/components/auth/auth-provider"
import { useTokenPrices } from "@/hooks/market/useTokenPrices"
import { type TokenPrice } from "@/services/market/tokenPrice"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { prefetchAppRoute } from "@/lib/navigation/prefetchRoute"
import { readHideZeroBalances, writeHideZeroBalances, HIDE_ZERO_EVENT } from "@/lib/wallet/tokenListPrefs"
import { cn } from "@/lib/ui/utils"

const PAGE_SIZE = 20

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

export function AssetTable({
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
  const [view, setView] = useState<"asset" | "account">("asset")
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

  const pageLedgerIds = useMemo(() => pageItems.map((t) => t.ledgerId), [pageItems])
  const { prices } = useTokenPrices(pageLedgerIds)

  if (isLoading && holdings.length === 0) {
    return (
      <Card>
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
          <div className="space-y-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold">{t("myAssets")}</h3>
          {onAddCustom && (
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="size-9 rounded-full"
              aria-label={t("addToken")}
              onClick={() => setAddOpen(true)}
            >
              <HugeiconsIcon icon={Add01Icon} className="size-4" strokeWidth={2} />
            </Button>
          )}
        </div>

        <Tabs value={view} onValueChange={(v) => setView(v as typeof view)} className="mb-4">
          <TabsList className="grid w-full max-w-xs grid-cols-2">
            <TabsTrigger value="asset">{t("assetView")}</TabsTrigger>
            <TabsTrigger value="account">{t("accountView")}</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mb-3 flex items-center gap-3">
          <div className="relative flex-1">
            <HugeiconsIcon
              icon={Search01Icon}
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              strokeWidth={1.75}
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchTokens")}
              className="h-10 pl-9"
              aria-label={t("searchTokens")}
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="hide-zero-balances-table"
              checked={hideZero}
              onCheckedChange={(checked) => {
                writeHideZeroBalances(checked === true)
              }}
            />
            <Label htmlFor="hide-zero-balances-table" className="text-sm font-normal text-muted-foreground whitespace-nowrap">
              {t("hideSmall")}
            </Label>
          </div>
        </div>

        {pageItems.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">{holdings.length === 0 ? t("noTokens") : t("noTokensFound")}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-xs font-medium text-muted-foreground">
                    <th className="pb-2.5 text-left font-medium">{t("asset")}</th>
                    <th className="pb-2.5 text-right font-medium">{t("amount")}</th>
                    <th className="pb-2.5 text-right font-medium">{t("value")}</th>
                    <th className="pb-2.5 text-right font-medium">{t("price")}</th>
                    <th className="pb-2.5 text-right font-medium">{t("action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((token) => (
                    <AssetRow
                      key={token.ledgerId}
                      token={token}
                      price={prices.get(token.ledgerId)}
                      outside={
                        (outside?.get(token.ledgerId) ?? 0n) > token.fee
                          ? outside!.get(token.ledgerId)!
                          : undefined
                      }
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length > PAGE_SIZE && (
              <div className="mt-6 flex items-center justify-between gap-3 border-t pt-4">
                <p className="text-sm text-muted-foreground">
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
            )}
          </>
        )}
      </div>

      {onAddCustom && (
        <AddTokenDrawer
          open={addOpen}
          onOpenChange={setAddOpen}
          existingIds={existingLedgerIds}
          onAdded={onAddCustom}
        />
      )}
    </Card>
  )
}

function AssetRow({
  token,
  price,
  outside,
}: {
  token: TokenHolding
  price?: TokenPrice
  outside?: bigint
}) {
  const t = useTranslations("wallet")
  const { identity } = useAuth()
  const href = `/token/${token.ledgerId}`

  const balanceHuman = Number(token.balance) / 10 ** token.decimals
  const valueUsd = price ? balanceHuman * price.priceUsd : null
  const priceDigits = price && price.priceUsd < 1 ? 7 : 2

  const balanceDisplay = formatTokenAmount(token.balance, token.decimals, 7)
  const balanceFull = toPlainTokenAmount(token.balance, token.decimals)
  const balanceTruncated = balanceFull !== balanceDisplay.replace(/,/g, "")

  return (
    <tr
      className={cn(
        "group border-b last:border-0 transition-colors",
        "hover:bg-muted/30"
      )}
    >
      <td className="py-3">
        <Link
          href={href}
          prefetch
          onMouseEnter={() => prefetchAppRoute(href, identity)}
          onFocus={() => prefetchAppRoute(href, identity)}
          className="flex items-center gap-3 focus-visible:outline-none"
        >
          <TokenLogo token={token} />
          <div className="min-w-0">
            <p className="font-semibold">{token.symbol}</p>
            <p className="text-xs text-muted-foreground">{token.name}</p>
          </div>
        </Link>
      </td>
      <td className="py-3 text-right">
        {balanceTruncated ? (
          <Tooltip>
            <TooltipTrigger className="cursor-default">
              <p className="font-medium tabular-nums">{balanceDisplay}</p>
            </TooltipTrigger>
            <TooltipContent>{balanceFull}</TooltipContent>
          </Tooltip>
        ) : (
          <p className="font-medium tabular-nums">{balanceDisplay}</p>
        )}
        {outside !== undefined && (
          <p className="text-xs text-primary tabular-nums">
            +{formatTokenAmount(outside, token.decimals, 7)}
          </p>
        )}
      </td>
      <td className="py-3 text-right">
        <p className="font-medium tabular-nums">
          {formatUsd(valueUsd ?? 0)}
        </p>
      </td>
      <td className="py-3 text-right">
        <Tooltip>
          <TooltipTrigger className="cursor-default">
            <p className="font-medium tabular-nums">
              {formatUsd(price?.priceUsd ?? 0, priceDigits)}
            </p>
          </TooltipTrigger>
          <TooltipContent>{formatUsdFull(price?.priceUsd)}</TooltipContent>
        </Tooltip>
      </td>
      <td className="py-3 text-right">
        <div className="flex justify-end gap-3 text-xs">
          <Link
            href={`/swap?from=${token.ledgerId}`}
            className="text-muted-foreground transition-colors hover:text-foreground hover:underline"
          >
            {t("trade")}
          </Link>
          <Link
            href={`/token/${token.ledgerId}/deposit`}
            className="text-muted-foreground transition-colors hover:text-foreground hover:underline"
          >
            {t("deposit")}
          </Link>
        </div>
      </td>
    </tr>
  )
}
