"use client"

import Link from "next/link"
import { useMemo } from "react"
import { createAvatar } from "@dicebear/core"
import { adventurer } from "@dicebear/collection"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, InboxIcon, Message01Icon } from "@hugeicons/core-free-icons"
import type { TransactionPublic } from "@/services/types"
import {
  formatAmount,
  formatTime,
  getTxStatusVariant,
  txTypeLabel,
  txStatusLabel,
} from "@/lib/wallet-utils"
import { cn } from "@/lib/utils"

type RecentTransactionsProps = {
  transactions: TransactionPublic[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Latest Transactions</h2>
        {transactions.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-xs"
            nativeButton={false}
            render={<Link href="/transactions" />}
          >
            See more
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-3" />
          </Button>
        )}
      </div>

      {transactions.length === 0 ? (
        <div className="rounded-2xl border border-dashed py-10 text-center">
          <HugeiconsIcon icon={InboxIcon} className="mx-auto size-6 text-muted-foreground/50" />
          <p className="mt-3 text-sm font-medium">No transactions yet</p>
          <p className="mt-1 text-xs text-muted-foreground">Deposit ICP to get started</p>
        </div>
      ) : (
        <ul className="divide-y rounded-2xl border">
          {transactions.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} />
          ))}
        </ul>
      )}
    </section>
  )
}

function TransactionRow({ tx }: { tx: TransactionPublic }) {
  const type = txTypeLabel(tx.txType)
  const incoming = type === "deposit"
  const status = txStatusLabel(tx.status)
  const counterparty = incoming ? tx.from : tx.to
  const memo = tx.memo?.[0]

  const avatarUri = useMemo(
    () => createAvatar(adventurer, { seed: counterparty }).toDataUri(),
    [counterparty]
  )

  return (
    <li className="flex items-center gap-3 px-4 py-3.5">
      <Avatar className="size-10 shrink-0">
        <AvatarImage src={avatarUri} alt="" />
        <AvatarFallback className="bg-muted text-xs">
          {counterparty.replace(/^@/, "").slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-sm font-medium", !counterparty.startsWith("@") && "font-mono text-sm tracking-tight")}>
          {formatCounterparty(counterparty)}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground/80">
          <span className="capitalize">{type}</span> · {formatTime(tx.createdAt)}
        </p>
        {memo && (
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <HugeiconsIcon icon={Message01Icon} className="size-3 shrink-0" />
            <span className="truncate rounded-full bg-muted px-2.5 py-0.5 text-xs">{memo}</span>
          </p>
        )}
      </div>

      <div className="shrink-0 text-right">
        <p
          className={cn(
            "text-sm font-semibold font-mono tabular-nums",
            incoming ? "text-success" : "text-foreground",
          )}
        >
          {incoming ? "+" : "−"}
          {formatAmount(tx.amount)} ICP
        </p>
        {status !== "completed" && (
          <Badge variant={getTxStatusVariant(tx.status)} className="mt-0.5 text-[10px]">
            {status}
          </Badge>
        )}
      </div>
    </li>
  )
}

// Username transfers are stored as "@name" and shown verbatim; raw addresses and
// principals are far too long for a mobile row, so they get middle-truncated.
function formatCounterparty(value: string): string {
  if (value.startsWith("@")) return value
  if (value.length <= 16) return value
  return `${value.slice(0, 6)}…${value.slice(-4)}`
}
