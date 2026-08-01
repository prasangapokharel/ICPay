"use client"

import { useMemo } from "react"
import { createAvatar } from "@dicebear/core"
import { adventurer } from "@dicebear/collection"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, ArrowRight01Icon, LinkSquare02Icon, InboxIcon, Message01Icon } from "@hugeicons/core-free-icons"
import type { TransactionPublic } from "@/services/types"
import { formatAmount, formatTime, getTxStatusVariant, txTypeLabel, txStatusLabel } from "@/lib/wallet-utils"
import { cn } from "@/lib/utils"

type TransactionListProps = {
  transactions: TransactionPublic[]
  total: bigint
  page: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function TransactionList({ transactions, total, page, pageSize, onPageChange }: TransactionListProps) {
  const totalPages = Math.max(1, Math.ceil(Number(total) / pageSize))
  const hasNext = page < totalPages - 1
  const hasPrev = page > 0

  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed py-12 text-center">
        <HugeiconsIcon icon={InboxIcon} className="mx-auto size-6 text-muted-foreground/50" />
        <p className="mt-3 text-sm font-medium">No transactions yet</p>
        <p className="mt-1 text-xs text-muted-foreground">Deposit ICP to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Accordion className="divide-y rounded-2xl border">
        {transactions.map((tx) => (
          <TransactionItem key={tx.id} tx={tx} />
        ))}
      </Accordion>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              disabled={!hasPrev}
              onClick={() => onPageChange(page - 1)}
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              disabled={!hasNext}
              onClick={() => onPageChange(page + 1)}
            >
              Next
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function TransactionItem({ tx }: { tx: TransactionPublic }) {
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
    <AccordionItem value={tx.id} className="border-b-0 px-0">
      {/* The trigger appends its own chevron with ml-auto; gap-2 and a shrunk
          icon keep it from pushing the amount column off the right edge. */}
      <AccordionTrigger className="items-center gap-2 px-4 py-3.5 hover:no-underline **:data-[slot=accordion-trigger-icon]:ml-1 **:data-[slot=accordion-trigger-icon]:size-3.5">
        <Avatar className="size-10 shrink-0">
          <AvatarImage src={avatarUri} alt="" />
          <AvatarFallback className="bg-muted text-xs">
            {counterparty.replace(/^@/, "").slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 text-left">
          <p className={cn("truncate text-sm font-medium", !counterparty.startsWith("@") && "font-mono text-xs")}>
            {shorten(counterparty)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            <span className="capitalize">{type}</span> · {formatTime(tx.createdAt)}
          </p>
          {memo && (
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <HugeiconsIcon icon={Message01Icon} className="size-3 shrink-0" />
              <span className="truncate rounded-full bg-muted px-2 py-0.5">{memo}</span>
            </p>
          )}
        </div>

        <div className="shrink-0 text-right">
          <p
            className={cn(
              "text-sm font-semibold font-mono tabular-nums",
              incoming ? "text-emerald-600 dark:text-emerald-400" : "text-foreground",
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
      </AccordionTrigger>

      <AccordionContent className="px-4 pb-4">
        <dl className="space-y-2.5 rounded-xl bg-muted/40 p-3 text-xs">
          <Row label="From">
            <span className="break-all font-mono">{tx.from}</span>
          </Row>
          <Row label="To">
            <span className="break-all font-mono">{tx.to}</span>
          </Row>
          <Row label="Amount">
            <span className="tabular-nums">{formatAmount(tx.amount)} ICP</span>
          </Row>
          <Row label="Network fee">
            <span className="tabular-nums">{formatAmount(tx.fee)} ICP</span>
          </Row>
          <Row label="Status">
            <Badge variant={getTxStatusVariant(tx.status)} className="text-[10px] capitalize">
              {status}
            </Badge>
          </Row>
          {tx.blockIndex?.[0] !== undefined && (
            <Row label="Block">
              <a
                href={`https://dashboard.internetcomputer.org/transaction/${tx.blockIndex[0]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono underline underline-offset-2"
              >
                {tx.blockIndex[0].toString()}
                <HugeiconsIcon icon={LinkSquare02Icon} className="size-3" />
              </a>
            </Row>
          )}
        </dl>
      </AccordionContent>
    </AccordionItem>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <dt className="w-24 shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 flex-1 text-right">{children}</dd>
    </div>
  )
}

// Username transfers are stored as "@name" and shown verbatim; addresses and
// principals are far too long for a mobile row, so they get middle-truncated.
function shorten(value: string): string {
  if (value.startsWith("@")) return value
  if (value.length <= 16) return value
  return `${value.slice(0, 6)}…${value.slice(-4)}`
}
