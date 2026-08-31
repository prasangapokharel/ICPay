"use client"

import Link from "next/link"
import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { createAvatar } from "@dicebear/core"
import { adventurer } from "@dicebear/collection"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, InboxIcon, Message01Icon } from "@hugeicons/core-free-icons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PremiumBadge } from "@/components/verifed/premium-badge"
import type { TransactionPublic } from "@/services/types"
import {
  formatClockTime,
  formatTokenAmount,
  formatTransactionDateGroup,
  getTxStatusVariant,
  groupTransactionsByDate,
  isIncomingTx,
  shortenCounterparty,
  txStatusLabel,
  txTypeKey,
} from "@/lib/wallet/utils"
import { useLedgerSymbol } from "@/hooks/wallet/useWalletData"
import { cn } from "@/lib/ui/utils"

type TransactionListProps = {
  transactions: TransactionPublic[]
  total: bigint
  page: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function TransactionList({ transactions, total, page, pageSize, onPageChange }: TransactionListProps) {
  const t = useTranslations("transactions")
  const td = useTranslations("dashboard")
  const totalPages = Math.max(1, Math.ceil(Number(total) / pageSize))
  const hasNext = page < totalPages - 1
  const hasPrev = page > 0

  const groups = useMemo(() => groupTransactionsByDate(transactions), [transactions])
  const dateLabels = useMemo(
    () => ({ today: t("dateToday"), yesterday: t("dateYesterday") }),
    [t]
  )

  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed text-center">
        <HugeiconsIcon icon={InboxIcon} className="mx-auto size-6 text-muted-foreground/50" />
        <p className="mt-3 text-sm font-medium">{td("noTransactions")}</p>
        <p className="mt-1 text-xs text-muted-foreground">{td("noTransactionsHint")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-5">
        {groups.map((group) => (
          <section key={group.key}>
            <h2 className="mb-2 px-1 text-xs font-semibold tracking-wide text-muted-foreground">
              {formatTransactionDateGroup(group.items[0].createdAt, dateLabels)}
            </h2>
            <div className="divide-y overflow-hidden rounded-2xl border">
              {group.items.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {t("page", { page: page + 1, total: totalPages })}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!hasPrev}
              onClick={() => onPageChange(page - 1)}
            >
              {t("previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasNext}
              onClick={() => onPageChange(page + 1)}
            >
              {t("next")}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function TransactionRow({ tx }: { tx: TransactionPublic }) {
  const t = useTranslations("transactions")
  const type = txTypeKey(tx.txType)
  const incoming = isIncomingTx(tx.txType)
  const status = txStatusLabel(tx.status)
  const counterparty = incoming ? tx.from : tx.to
  const memo = tx.memo?.[0]
  const { symbol, decimals } = useLedgerSymbol(tx.ledgerId)

  const avatarUri = useMemo(
    () => createAvatar(adventurer, { seed: counterparty }).toDataUri(),
    [counterparty]
  )

  const handle = counterparty.startsWith("@") ? counterparty.slice(1) : null

  return (
    <Link
      href={`/transactions/${encodeURIComponent(tx.id)}`}
      prefetch
      className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/40 active:bg-muted/60"
    >
      <Avatar className="size-11 shrink-0">
        <AvatarImage src={avatarUri} alt="" />
        <AvatarFallback className="bg-muted text-xs">
          {counterparty.replace(/^@/, "").slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "flex items-center gap-1 truncate text-sm font-medium",
            !handle && "font-mono tracking-tight"
          )}
        >
          {handle ?? shortenCounterparty(counterparty)}
          <PremiumBadge name={handle} className="size-3.5" />
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground/80">
          <span>{t(`type.${type}`)}</span> · {formatClockTime(tx.createdAt)}
        </p>
        {memo ? (
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <HugeiconsIcon icon={Message01Icon} className="size-3 shrink-0" />
            <span className="truncate">{memo}</span>
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="text-right">
          <p
            className={cn(
              "text-sm font-semibold font-mono tabular-nums",
              incoming ? "text-success" : "text-foreground"
            )}
          >
            {incoming ? "+" : "−"}
            {formatTokenAmount(tx.amount, decimals, 4)} {symbol}
          </p>
          {status !== "completed" ? (
            <Badge variant={getTxStatusVariant(tx.status)} className="mt-0.5 text-[10px]">
              {t(`status.${status}`)}
            </Badge>
          ) : null}
        </div>
        <HugeiconsIcon icon={ArrowRight01Icon} className="size-4 text-muted-foreground" strokeWidth={1.75} />
      </div>
    </Link>
  )
}
