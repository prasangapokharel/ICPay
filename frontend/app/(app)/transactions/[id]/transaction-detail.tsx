"use client"

import Link from "next/link"
import { useMemo, useState, type ReactNode } from "react"
import { useTranslations } from "next-intl"
import { createAvatar } from "@dicebear/core"
import { adventurer } from "@dicebear/collection"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  CheckmarkCircle02Icon,
  Copy01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { TokenFiatHint } from "@/components/token/token-fiat-hint"
import { PremiumBadge } from "@/components/verifed/premium-badge"
import { useLedgerSymbol, useTransactionDetail } from "@/hooks/wallet/useWalletData"
import { useRewrittenLastSegment } from "@/lib/routing/rewrittenRoute"
import type { TransactionPublic } from "@/services/types"
import {
  copyText,
  explorerTxUrl,
  formatDetailTime,
  formatTokenAmount,
  isIncomingTx,
  shortenCounterparty,
  txStatusLabel,
  txTypeKey,
} from "@/lib/wallet/utils"
import { cn } from "@/lib/ui/utils"

export function TransactionDetail() {
  const txId = useRewrittenLastSegment()
  const { tx, error, isLoading } = useTransactionDetail(txId || null)
  const t = useTranslations("transactions")

  if (!txId) {
    return (
      <div className="space-y-4">
        <BackButton />
        <Alert variant="destructive">
          <AlertDescription>{t("notFound")}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <BackButton />

      {isLoading && !tx ? (
        <TransactionDetailSkeleton />
      ) : error || !tx ? (
        <Alert variant="destructive">
          <AlertDescription>{t("notFound")}</AlertDescription>
        </Alert>
      ) : (
        <TransactionDetailBody tx={tx} />
      )}
    </div>
  )
}

function BackButton() {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className="-ml-2"
      nativeButton={false}
      render={<Link href="/transactions" />}
      aria-label="Back"
    >
      <HugeiconsIcon icon={ArrowLeft01Icon} className="size-5" strokeWidth={1.75} />
    </Button>
  )
}

function TransactionDetailBody({ tx }: { tx: TransactionPublic }) {
  const t = useTranslations("transactions")
  const type = txTypeKey(tx.txType)
  const incoming = isIncomingTx(tx.txType)
  const status = txStatusLabel(tx.status)
  const counterparty = incoming ? tx.from : tx.to
  const memo = tx.memo?.[0]
  const { symbol, decimals } = useLedgerSymbol(tx.ledgerId)
  const blockIndex = tx.blockIndex?.[0]
  const showAction = type === "transfer" || type === "withdraw" || type === "deposit"
  const transferTarget = counterparty.replace(/^@/, "")
  const transferHref = `/transfer?to=${encodeURIComponent(transferTarget)}`
  const handle = counterparty.startsWith("@") ? counterparty.slice(1) : null

  const avatarUri = useMemo(
    () => createAvatar(adventurer, { seed: counterparty }).toDataUri(),
    [counterparty]
  )

  return (
    <>
      <div className="px-1 text-center">
        <Avatar className="mx-auto size-14">
          <AvatarImage src={avatarUri} alt="" />
          <AvatarFallback className="bg-muted text-sm">
            {counterparty.replace(/^@/, "").slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <p className="mt-3 flex items-center justify-center gap-1 text-sm font-medium">
          {handle ? (
            <Link href={`/icpverse/${handle}`} className="hover:underline">
              @{handle}
            </Link>
          ) : (
            <span className="font-mono text-sm tracking-tight">
              {shortenCounterparty(counterparty)}
            </span>
          )}
          <PremiumBadge name={handle} className="size-3.5" />
        </p>

        <p className="mt-4 text-sm text-muted-foreground">
          {incoming ? t("amountReceived") : t("amountSent")}
        </p>
        <p
          className={cn(
            "mt-2 text-[2rem] font-semibold leading-tight tabular-nums tracking-tight",
            incoming ? "text-success" : "text-foreground"
          )}
        >
          {incoming ? "+" : "−"}
          {formatTokenAmount(tx.amount, decimals, decimals)} {symbol}
        </p>
        <TokenFiatHint
          ledgerId={tx.ledgerId}
          amount={tx.amount}
          decimals={decimals}
          className="mt-1 text-sm text-muted-foreground tabular-nums"
        />
        <p
          className={cn(
            "mt-3 inline-flex items-center gap-1.5 text-sm font-medium",
            status === "completed" ? "text-success" : "text-muted-foreground"
          )}
        >
          {status === "completed" ? (
            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4" strokeWidth={1.75} />
          ) : null}
          {t(`status.${status}`)}
        </p>
      </div>

      {showAction ? (
        <Button
          variant="secondary"
          className="h-11 w-full rounded-xl"
          nativeButton={false}
          render={<Link href={transferHref} />}
        >
          {incoming ? t("repay") : t("sendAgain")}
        </Button>
      ) : null}

      <div className="space-y-0">
        <DetailRow
          label={t("rowAmount")}
          value={`${formatTokenAmount(tx.amount, decimals, decimals)} ${symbol}`}
        />
        <DetailRow
          label={t("rowNetworkFee")}
          value={`${formatTokenAmount(tx.fee, decimals, decimals)} ${symbol}`}
        />
        <DetailRow label={t("rowDate")} value={formatDetailTime(tx.createdAt)} />
        <DetailRow label={t("rowNetwork")} value={t("networkIcp")} />
        <DetailRow label={t("rowFrom")} value={tx.from} copyable mono />
        <DetailRow label={t("rowTo")} value={tx.to} copyable mono />
        {memo ? <DetailRow label={t("rowMemo")} value={memo} /> : null}
        <DetailRow label={t("rowId")} value={tx.id} copyable mono />
        {blockIndex !== undefined ? (
          <DetailRow
            label={t("rowBlock")}
            value={blockIndex.toString()}
            copyable
            mono
            href={explorerTxUrl(blockIndex)}
          />
        ) : null}
      </div>
    </>
  )
}

function DetailRow({
  label,
  value,
  mono,
  copyable,
  href,
  children,
}: {
  label: string
  value?: string
  mono?: boolean
  copyable?: boolean
  href?: string
  children?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b py-3.5 text-sm last:border-b-0">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      {children ?? (
        <DetailValue value={value ?? ""} mono={mono} copyable={copyable} href={href} />
      )}
    </div>
  )
}

function DetailValue({
  value,
  mono,
  copyable,
  href,
}: {
  value: string
  mono?: boolean
  copyable?: boolean
  href?: string
}) {
  const tc = useTranslations("common")
  const [copied, setCopied] = useState(false)

  const onCopy = async () => {
    await copyText(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex min-w-0 items-start justify-end gap-1.5">
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "min-w-0 break-all text-right underline underline-offset-2",
            mono && "font-mono text-xs"
          )}
        >
          {value}
        </a>
      ) : (
        <span className={cn("min-w-0 break-all text-right", mono && "font-mono text-xs")}>
          {value}
        </span>
      )}
      {copyable ? (
        <button
          type="button"
          onClick={() => void onCopy()}
          className="shrink-0 rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground"
          aria-label={tc("copy")}
        >
          <HugeiconsIcon
            icon={copied ? Tick02Icon : Copy01Icon}
            className="size-4"
            strokeWidth={1.75}
          />
        </button>
      ) : null}
    </div>
  )
}

function TransactionDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="px-1 text-center">
        <Skeleton className="mx-auto size-14 rounded-full" />
        <Skeleton className="mx-auto mt-3 h-4 w-24" />
        <Skeleton className="mx-auto mt-4 h-4 w-28" />
        <Skeleton className="mx-auto mt-3 h-10 w-48" />
        <Skeleton className="mx-auto mt-3 h-4 w-24" />
      </div>
      <Skeleton className="h-11 w-full rounded-xl" />
      <div className="space-y-0">
        <Skeleton className="h-12 w-full rounded-none" />
        <Skeleton className="h-12 w-full rounded-none" />
        <Skeleton className="h-12 w-full rounded-none" />
      </div>
    </div>
  )
}
