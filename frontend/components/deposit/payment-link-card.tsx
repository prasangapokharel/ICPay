"use client"

import { useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, Share08Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { QrCode } from "@/components/shared/qr-code"
import { buildPaymentLink } from "@/services/pay/pay"
import { copyText, memoByteLength, MEMO_MAX_BYTES, parseIcp } from "@/lib/wallet-utils"

// A request for money, not an address to send it to: the amount and the reason
// travel inside the link, so the payer scans once and reviews rather than typing
// both by hand. Which is the difference between a wallet and a till.
export function PaymentLinkCard({ username }: { username?: string }) {
  const t = useTranslations("paymentLink")
  const tc = useTranslations("common")
  const [amount, setAmount] = useState("")
  const [memo, setMemo] = useState("")
  const [copied, setCopied] = useState(false)

  // Nothing to address a request to, so the card says so rather than rendering a
  // form that cannot produce a link.
  if (!username) {
    return (
      <Alert>
        <AlertDescription className="flex flex-col items-start gap-3">
          {t("needsUsername")}
          <Button size="sm" nativeButton={false} render={<Link href="/username" />}>
            {t("claimUsername")}
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  const parsedAmount = parseIcp(amount)
  const trimmedMemo = memo.trim()
  const memoTooLong = memoByteLength(trimmedMemo) > MEMO_MAX_BYTES
  // An amount that is typed but unparseable is an error, an empty one is simply
  // "pay me anything" -- the link is still worth generating for that.
  const amountInvalid = amount.trim() !== "" && parsedAmount === null

  const link =
    amountInvalid || memoTooLong
      ? null
      : buildPaymentLink({
          username,
          amount: parsedAmount ?? undefined,
          memo: trimmedMemo || undefined,
        })

  const handleCopy = async () => {
    if (!link) return
    await copyText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  // Share sheet where the browser has one, copy everywhere else. Dismissing the
  // sheet rejects with AbortError, which is a choice rather than a failure and
  // must not fall through to a surprise copy.
  const handleShare = async () => {
    if (!link) return
    const payload = {
      title: t("shareSheetTitle"),
      text: parsedAmount
        ? t("shareSheetTextAmount", { name: username, amount: amount.trim() })
        : t("shareSheetText", { name: username }),
      url: link,
    }
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(payload)
        return
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return
      }
    }
    await handleCopy()
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="request-amount">{t("amountLabel")}</Label>
          <Input
            id="request-amount"
            inputMode="decimal"
            autoComplete="off"
            placeholder={t("amountPlaceholder")}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="h-12 tabular-nums"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <Label htmlFor="request-memo">{t("memoLabel")}</Label>
            <span
              className={
                memoTooLong
                  ? "text-xs font-medium tabular-nums text-destructive"
                  : "text-xs tabular-nums text-muted-foreground"
              }
            >
              {memoByteLength(trimmedMemo)}/{MEMO_MAX_BYTES}
            </span>
          </div>
          <Input
            id="request-memo"
            autoComplete="off"
            placeholder={t("memoPlaceholder")}
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="h-12"
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">{t("optionalHint")}</p>

      {amountInvalid && (
        <Alert variant="destructive">
          <AlertDescription>{t("amountInvalid")}</AlertDescription>
        </Alert>
      )}
      {memoTooLong && (
        <Alert variant="destructive">
          <AlertDescription>{t("memoTooLong", { max: MEMO_MAX_BYTES })}</AlertDescription>
        </Alert>
      )}

      {link && (
        <div className="flex flex-col items-center gap-4">
          <QrCode value={link} />

          <p className="w-full break-all rounded-xl bg-muted/50 px-3 py-2.5 text-center font-mono text-xs">
            {link.replace(/^https?:\/\//, "")}
          </p>

          <div className="grid w-full grid-cols-2 gap-2">
            <Button variant="outline" onClick={handleCopy} className="h-11">
              <HugeiconsIcon icon={copied ? Tick02Icon : Copy01Icon} className="size-4" />
              {copied ? tc("copied") : tc("copy")}
            </Button>
            <Button onClick={handleShare} className="h-11">
              <HugeiconsIcon icon={Share08Icon} className="size-4" />
              {tc("share")}
            </Button>
          </div>

          <p className="text-center text-[11px] text-muted-foreground">{t("hint")}</p>
        </div>
      )}
    </div>
  )
}
