"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
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
import { PremiumBadge } from "@/components/verifed/premium-badge"
import type { TransactionPublic } from "@/services/types"
import { formatTokenAmount, formatTime, getTxStatusVariant, txTypeLabel, txStatusLabel, explorerTxUrl, shortenCounterparty } from "@/lib/wallet-utils"
import { useLedgerSymbol } from "@/hooks/use-wallet-data"
import { cn } from "@/lib/utils"

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

  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed py-12 text-center">
        <HugeiconsIcon icon={InboxIcon} className="mx-auto size-6 text-muted-foreground/50" />
        <p className="mt-3 text-sm font-medium">{td("noTransactions")}</p>
        <p className="mt-1 text-xs text-muted-foreground">{td("noTransactionsHint")}</p>
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
            {t("page", { page: page + 1, total: totalPages })}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!hasPrev}
              onClick={() => onPageChange(page - 1)}
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3" />
              {t("previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasNext}
              onClick={() => onPageChange(page + 1)}
            >
              {t("next")}
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function TransactionItem({ tx }: { tx: TransactionPublic }) {
  const t = useTranslations("transactions")
  const tp = useTranslations("profileView")
  const router = useRouter()
  const type = txTypeLabel(tx.txType)
  const incoming = type === "deposit"
  const status = txStatusLabel(tx.status)
  const counterparty = incoming ? tx.from : tx.to
  const memo = tx.memo?.[0]
  const { symbol, decimals } = useLedgerSymbol(tx.ledgerId)

  const avatarUri = useMemo(
    () => createAvatar(adventurer, { seed: counterparty }).toDataUri(),
    [counterparty]
  )

  // Only a username resolves to an ICPverse profile; a raw principal or account
  // identifier has no page to open.
  const handle = counterparty.startsWith("@") ? counterparty.slice(1) : null

  return (
    <AccordionItem value={tx.id} className="border-b-0 px-0">
      {/* The trigger appends its own chevron with ml-auto; gap-2 and a shrunk
          icon keep it from pushing the amount column off the right edge. */}
      <AccordionTrigger className="items-center gap-2 px-4 py-3.5 hover:no-underline **:data-[slot=accordion-trigger-icon]:ml-1 **:data-[slot=accordion-trigger-icon]:size-3.5">
        {handle ? (
          // Rendered as a span inside the trigger button -- a nested <a> would be
          // invalid HTML -- so the navigation is done by hand, and the click is
          // stopped from also toggling the accordion.
          <span
            role="link"
            tabIndex={0}
            aria-label={tp("viewProfile", { name: handle })}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              router.push(`/icpverse/${handle}`)
            }}
            onKeyDown={(e) => {
              if (e.key !== "Enter" && e.key !== " ") return
              e.preventDefault()
              e.stopPropagation()
              router.push(`/icpverse/${handle}`)
            }}
            className="shrink-0 rounded-full outline-none transition-transform focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
          >
            <Avatar className="size-10">
              <AvatarImage src={avatarUri} alt="" />
              <AvatarFallback className="bg-muted text-xs">
                {counterparty.replace(/^@/, "").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </span>
        ) : (
          <Avatar className="size-10 shrink-0">
            <AvatarImage src={avatarUri} alt="" />
            <AvatarFallback className="bg-muted text-xs">
              {counterparty.replace(/^@/, "").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}

        <div className="min-w-0 flex-1 text-left">
          <p className={cn("flex items-center gap-1 truncate text-sm font-medium", !counterparty.startsWith("@") && "font-mono text-sm tracking-tight")}>
            {handle ? `@${handle}` : shortenCounterparty(counterparty)}
            {handle && <PremiumBadge name={handle} className="size-3.5" />}
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

        <div className="shrink-0 text-right">
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
      </AccordionTrigger>

      <AccordionContent className="px-4 pb-4">
        <dl className="space-y-2.5 rounded-xl bg-muted/40 p-3 text-xs">
          <Row label={t("rowFrom")}>
            <span className="break-all font-mono">{tx.from}</span>
          </Row>
          <Row label={t("rowTo")}>
            <span className="break-all font-mono">{tx.to}</span>
          </Row>
          <Row label={t("rowAmount")}>
            <span className="tabular-nums">{formatTokenAmount(tx.amount, decimals, decimals)} {symbol}</span>
          </Row>
          <Row label={t("rowNetworkFee")}>
            <span className="tabular-nums">{formatTokenAmount(tx.fee, decimals, decimals)} {symbol}</span>
          </Row>
          <Row label={t("rowStatus")}>
            <Badge variant={getTxStatusVariant(tx.status)} className="text-[10px]">
              {t(`status.${status}`)}
            </Badge>
          </Row>
          {tx.blockIndex?.[0] !== undefined && (
            <Row label={t("rowBlock")}>
              <a
                href={explorerTxUrl(tx.blockIndex[0])}
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

