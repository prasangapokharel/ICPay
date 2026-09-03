"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon, BadgePlusIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { TokenAvatar } from "@/components/public/market/trade/token-avatar"
import { useAuth } from "@/components/auth/auth-provider"
import { searchTokenByCanister, customTokenToRow } from "@/services/market/customTokenSearch"
import type { TerminalPairRow } from "@/services/market/tradePairSnapshot"
import { formatUsd } from "@/lib/market/format"

export function CustomTokenSearch({
  onTokenFound,
}: {
  onTokenFound: (row: TerminalPairRow) => void
}) {
  const t = useTranslations("marketTrade")
  const { identity } = useAuth()
  const [open, setOpen] = useState(false)
  const [canisterId, setCanisterId] = useState("")
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<Extract<Awaited<ReturnType<typeof searchTokenByCanister>>, { found: true }> | null>(null)

  async function handleSearch() {
    const trimmed = canisterId.trim()
    if (!trimmed) return

    setSearching(true)
    setError(null)
    setResult(null)

    const searchResult = await searchTokenByCanister(trimmed, identity)
    setSearching(false)

    if (!searchResult.found) {
      setError(searchResult.error)
      return
    }

    setResult(searchResult)
  }

  function handleAdd() {
    if (!result) return
    const row = customTokenToRow(result.token, result.stats)
    onTokenFound(row)
    setOpen(false)
    setCanisterId("")
    setResult(null)
    setError(null)
  }

  function handleOpenChange(newOpen: boolean) {
    setOpen(newOpen)
    if (!newOpen) {
      setCanisterId("")
      setResult(null)
      setError(null)
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label={t("addToken")}
      >
        <HugeiconsIcon icon={BadgePlusIcon} size={16} strokeWidth={2} />
      </PopoverTrigger>
      <PopoverContent className="w-[420px] p-4" align="end">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold">{t("addCustomToken")}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{t("addCustomTokenDesc")}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="canister-id" className="text-xs">
              {t("canisterId")}
            </Label>
            <div className="flex gap-2">
              <Input
                id="canister-id"
                placeholder="ryjl3-tyaaa-aaaaa-aaaba-cai"
                value={canisterId}
                onChange={(e) => setCanisterId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !searching) {
                    void handleSearch()
                  }
                }}
                disabled={searching}
                className="text-xs"
              />
              <Button
                size="icon"
                onClick={() => void handleSearch()}
                disabled={!canisterId.trim() || searching}
              >
                {searching ? (
                  <Spinner className="size-4" />
                ) : (
                  <HugeiconsIcon icon={Search01Icon} size={18} strokeWidth={2} />
                )}
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <div className="flex items-center gap-3">
                <TokenAvatar
                  symbol={result.token.symbol}
                  ledgerId={result.token.ledgerId}
                  logoUrl={result.token.logoUrl}
                  className="size-10"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{result.token.symbol}</p>
                  <p className="truncate text-xs text-muted-foreground">{result.token.name}</p>
                  {result.stats?.priceUsd && (
                    <p className="text-xs font-medium tabular-nums text-foreground">
                      {formatUsd(result.stats.priceUsd)}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <p className="text-muted-foreground">{t("decimals")}</p>
                  <p className="font-medium text-foreground">{result.token.decimals}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("fee")}</p>
                  <p className="font-medium text-foreground">
                    {(Number(result.token.fee) / 10 ** result.token.decimals).toFixed(result.token.decimals)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleOpenChange(false)} className="flex-1">
              {t("cancel")}
            </Button>
            <Button size="sm" onClick={handleAdd} disabled={!result} className="flex-1">
              {t("addToWatchlist")}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
