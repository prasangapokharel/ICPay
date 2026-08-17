"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { createAvatar } from "@dicebear/core"
import { adventurer } from "@dicebear/collection"
import { HugeiconsIcon } from "@hugeicons/react"
import { LinkSquare02Icon, Share08Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { formatTokenAmount, explorerTxUrl } from "@/lib/wallet-utils"
import { ReceiptPreview } from "@/components/wallet/receipt-preview"
import { useIcpPrice } from "@/hooks/use-icp-price"
import { playSuccessChime } from "@/lib/success-chime"
import { cn } from "@/lib/utils"

type SendSuccessProps = {
  amount: bigint
  recipient: string
  blockIndex: bigint
  memo?: string
  kind?: "send" | "tip" | "purchase" | "icpayBuy"
  // Default to ICP: every caller but the token page sends ICP, and its ledger
  // ships no metadata to read a symbol from.
  symbol?: string
  decimals?: number
  onDone: () => void
}

export function SendSuccess({
  amount,
  recipient,
  blockIndex,
  memo,
  kind = "send",
  symbol = "ICP",
  decimals = 8,
  onDone,
}: SendSuccessProps) {
  const t = useTranslations("success")
  const tc = useTranslations("common")
  const [previewOpen, setPreviewOpen] = useState(false)
  const { price } = useIcpPrice()

  // Ref-guarded so the chime belongs to the payment, not to the render: a dev
  // remount or parent state change would otherwise replay it on-screen.
  const chimed = useRef(false)
  useEffect(() => {
    if (chimed.current) return
    chimed.current = true
    playSuccessChime()
  }, [])

  const avatarUri = useMemo(
    () => createAvatar(adventurer, { seed: recipient }).toDataUri(),
    [recipient]
  )

  // Identity-stable so the preview does not re-render the card on every parent
  // render; the price settling is a real change and should refresh it. The ICP
  // quote only applies to ICP, so another token's card carries no fiat row.
  const receipt = useMemo(
    () => ({
      amount,
      recipient,
      blockIndex,
      memo,
      symbol,
      decimals,
      usdPrice: symbol === "ICP" ? price?.usd : undefined,
    }),
    [amount, recipient, blockIndex, memo, symbol, decimals, price?.usd]
  )

  const label = recipient.startsWith("@")
    ? recipient
    : recipient.length > 16
      ? `${recipient.slice(0, 6)}…${recipient.slice(-4)}`
      : recipient

  return (
    <div className="flex flex-col items-center pt-6 text-center">
      <div className="animate-in fade-in zoom-in-75 mb-5 flex size-18 items-center justify-center rounded-full bg-success/10 duration-300 ease-out">
        <span className="flex size-13 items-center justify-center rounded-full bg-success text-background shadow-sm">
          <HugeiconsIcon icon={Tick02Icon} className="size-8" strokeWidth={3} />
        </span>
      </div>

      <h1 className="mt-6 text-2xl font-bold tracking-tight">{t(kind)}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t(`${kind}Body`, { name: label, symbol })}
      </p>

      <p className="mt-8 text-xs text-muted-foreground">{t("total")}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums">
        {formatTokenAmount(amount, decimals, decimals)} {symbol}
      </p>

      <div className="mt-8 w-full border-t border-dashed pt-6 text-left">
        <p className="text-xs text-muted-foreground">
          {kind === "purchase"
            ? t("username")
            : kind === "icpayBuy"
              ? t("destination")
              : t("recipient")}
        </p>
        <div className="mt-3 flex items-center gap-3 rounded-2xl bg-muted/50 p-3">
          <Avatar className="size-11 shrink-0">
            <AvatarImage src={avatarUri} alt="" />
            <AvatarFallback className="text-xs">
              {recipient.replace(/^@/, "").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className={cn("truncate text-sm font-medium", !recipient.startsWith("@") && "font-mono text-xs")}>
              {label}
            </p>
            <a
              href={explorerTxUrl(blockIndex)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground underline underline-offset-2"
            >
              {t("viewOnDashboard")}
              <HugeiconsIcon icon={LinkSquare02Icon} className="size-3" />
            </a>
          </div>
        </div>
      </div>

      <div className="mt-8 flex w-full items-center gap-2">
        <Button className="flex-1" onClick={onDone}>
          {tc("done")}
        </Button>
        {/* A purchase pays the treasury, so the receipt card -- which is framed
            around who received the money -- would read as a transfer to us. */}
        {kind !== "purchase" && (
          <>
            <Button
              variant="outline"
              size="icon-lg"
              onClick={() => setPreviewOpen(true)}
              aria-label={t("shareReceipt")}
              className="size-12 rounded-2xl"
            >
              <HugeiconsIcon icon={Share08Icon} className="size-4.5" />
            </Button>
            <ReceiptPreview
              open={previewOpen}
              onOpenChange={setPreviewOpen}
              receipt={receipt}
            />
          </>
        )}
      </div>
    </div>
  )
}
