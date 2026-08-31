"use client"

import Link from "next/link"
import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { createAvatar } from "@dicebear/core"
import { adventurer } from "@dicebear/collection"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { PremiumBadge } from "@/components/verifed/premium-badge"
import { InboxIcon, Message01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import type { TransactionPublic } from "@/services/types"
import { formatTokenAmount, formatTime, getTxStatusVariant, isIncomingTx, shortenCounterparty, txStatusLabel, txTypeKey } from "@/lib/wallet/utils"
import { useLedgerSymbol } from "@/hooks/wallet/useWalletData"
import { cn } from "@/lib/ui/utils"

type RecentTransactionsProps = {
  transactions: TransactionPublic[]
  embedded?: boolean
}

export function RecentTransactions({ transactions, embedded }: RecentTransactionsProps) {
  const t = useTranslations("dashboard")
  return (
    <section className={embedded ? "space-y-0" : "space-y-3"}>
      {!embedded ? (
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">{t("latestTransactions")}</h2>
          {transactions.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              nativeButton={false}
              render={<Link href="/transactions" />}
            >
              {t("seeMore")}
            </Button>
          )}
        </div>
      ) : null}

      {transactions.length === 0 ? (
        <div className={cn("rounded-2xl border border-dashed text-center", embedded && "border-0")}>
          <HugeiconsIcon icon={InboxIcon} className="mx-auto size-4 text-muted-foreground/50" />
          <p className="mt-3 text-sm font-medium">{t("noTransactions")}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t("noTransactionsHint")}</p>
        </div>
      ) : (
        <ul className={cn("divide-y rounded-2xl border", embedded && "rounded-none border-0")}>
          {transactions.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} />
          ))}
        </ul>
      )}
    </section>
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
    <li>
      <Link
        href={`/transactions/${encodeURIComponent(tx.id)}`}
        prefetch
        className="flex items-center gap-3 px-4 py-2 transition-colors hover:bg-muted/40 active:bg-muted/60"
      >
        <Avatar className="size-10 shrink-0">
          <AvatarImage src={avatarUri} alt="" />
          <AvatarFallback className="bg-muted text-xs">
            {counterparty.replace(/^@/, "").slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <p className={cn("flex items-center gap-1 truncate text-sm font-medium", !handle && "font-mono text-sm tracking-tight")}>
            {handle ?? shortenCounterparty(counterparty)}
            <PremiumBadge name={handle} className="size-3.5" />
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground/80">
            <span>{t(`type.${type}`)}</span> · {formatTime(tx.createdAt)}
          </p>
          {memo && (
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <HugeiconsIcon icon={Message01Icon} className="size-3 shrink-0" />
              <span className="truncate rounded-full bg-muted px-2.5 py-0.5 text-xs">{memo}</span>
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="text-right">
            <p
              className={cn(
                "text-sm font-semibold font-mono tabular-nums",
                incoming ? "text-success" : "text-foreground",
              )}
            >
              {incoming ? "+" : "−"}
              {formatTokenAmount(tx.amount, decimals, 4)} {symbol}
            </p>
            {status !== "completed" && (
              <Badge variant={getTxStatusVariant(tx.status)} className="mt-0.5 text-[10px]">
                {t(`status.${status}`)}
              </Badge>
            )}
          </div>
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-4 text-muted-foreground" strokeWidth={1.75} />
        </div>
      </Link>
    </li>
  )
}

