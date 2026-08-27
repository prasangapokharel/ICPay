"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useIcrcTokenHistory } from "@/hooks/ledger/useIcrcTokenHistory"
import type { IcrcTxRow } from "@/services/ledger/icrcHistory"
import { formatTokenAmount } from "@/lib/wallet/utils"
import type { TokenHolding } from "@/services/tokens"

export function TokenHistoryList({
  token,
  enabled = true,
}: {
  token: TokenHolding
  enabled?: boolean
}) {
  const t = useTranslations("tokenHistory")
  const { page, isLoading, fetchPage } = useIcrcTokenHistory(token.ledgerId, enabled)
  const [older, setOlder] = useState<IcrcTxRow[]>([])
  const [cursor, setCursor] = useState<bigint | undefined>()
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  const rows = [...(page?.rows ?? []), ...older]
  const showMore = older.length ? hasMore : (page?.hasMore ?? false)
  const nextCursor = older.length ? cursor : page?.oldestId

  const onLoadMore = async () => {
    if (!nextCursor || loadingMore) return
    setLoadingMore(true)
    try {
      const next = await fetchPage(nextCursor)
      setOlder((prev) => [...prev, ...next.rows])
      setCursor(next.oldestId)
      setHasMore(next.hasMore)
    } finally {
      setLoadingMore(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Spinner className="size-5 text-muted-foreground" />
      </div>
    )
  }

  if (!rows.length) {
    return <p className="py-4 text-center text-sm text-muted-foreground">{t("empty")}</p>
  }

  return (
    <div className="space-y-2">
      <ul className="divide-y divide-border/50 rounded-xl border border-border/40">
        {rows.map((row) => (
          <li key={row.id.toString()} className="flex items-center justify-between gap-3 px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-sm font-medium capitalize">
                {row.kind === "send" ? t("kind.send") : t("kind.receive")}
              </p>
              <p className="truncate text-xs text-muted-foreground">#{row.id.toString()}</p>
            </div>
            <p className="shrink-0 text-sm font-semibold tabular-nums">
              {row.kind === "send" ? "−" : "+"}
              {formatTokenAmount(row.amount, token.decimals, 4)} {token.symbol}
            </p>
          </li>
        ))}
      </ul>
      {showMore ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          disabled={loadingMore}
          onClick={() => void onLoadMore()}
        >
          {loadingMore ? <Spinner className="size-4" /> : t("loadMore")}
        </Button>
      ) : null}
    </div>
  )
}
