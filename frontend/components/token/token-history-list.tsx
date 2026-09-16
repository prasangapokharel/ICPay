"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  LinkSquare02Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useIcrcTokenHistory } from "@/hooks/ledger/useIcrcTokenHistory"
import type { IcrcTxRow } from "@/services/ledger/icrcHistory"
import { formatTokenAmount } from "@/lib/wallet/utils"
import type { TokenHolding } from "@/services/tokens"
import { cn } from "@/lib/ui/utils"

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
    <div className="space-y-3">
      <ul className="divide-y divide-border/40 overflow-hidden rounded-2xl border border-border/60 bg-card/40">
        {rows.map((row) => {
          const isReceive = row.kind === "receive"
          return (
            <li
              key={row.id.toString()}
              className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/30"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full",
                    isReceive
                      ? "border border-success/20 bg-success/10 text-success"
                      : "border border-border/40 bg-muted text-muted-foreground"
                  )}
                >
                  <HugeiconsIcon
                    icon={isReceive ? ArrowDown01Icon : ArrowUp01Icon}
                    className="size-4"
                    strokeWidth={2}
                  />
                </span>
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm font-medium capitalize text-foreground">
                    {isReceive ? t("kind.receive") : t("kind.send")}
                  </p>
                  <a
                    href={`https://dashboard.internetcomputer.org/canister/${token.ledgerId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <span>#{row.id.toString()}</span>
                    <HugeiconsIcon
                      icon={LinkSquare02Icon}
                      className="size-3 opacity-60"
                      strokeWidth={1.75}
                    />
                  </a>
                </div>
              </div>
              <p
                className={cn(
                  "shrink-0 text-sm font-semibold tabular-nums",
                  isReceive ? "text-success" : "text-foreground"
                )}
              >
                {isReceive ? "+" : "−"}
                {formatTokenAmount(row.amount, token.decimals, 4)} {token.symbol}
              </p>
            </li>
          )
        })}
      </ul>

      {showMore ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full text-xs cursor-pointer"
          disabled={loadingMore}
          onClick={() => void onLoadMore()}
        >
          {loadingMore ? <Spinner className="size-3.5" /> : t("loadMore")}
        </Button>
      ) : null}
    </div>
  )
}
