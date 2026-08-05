"use client"

import { useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { buildPaymentLink } from "@/services/pay/pay"
import { copyText, memoByteLength, MEMO_MAX_BYTES, parseIcp } from "@/lib/wallet-utils"

// A request for money, not an address to send it to: the amount and the reason
// travel inside the link, so the payer shares once and the payer reviews rather
// than typing both by hand. Which is the difference between a wallet and a till.
// The form opens in a modal so the deposit address stays the page's default view
// and, once generated, the link is the only thing shown -- copy it or rebuild.
export function PaymentLinkDialog({
  open,
  onOpenChange,
  username,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  username?: string
}) {
  const t = useTranslations("paymentLink")
  const tc = useTranslations("common")
  const [amount, setAmount] = useState("")
  const [memo, setMemo] = useState("")
  const [copied, setCopied] = useState(false)
  // The link is built only when the user asks for it, so the modal stays a pair
  // of inputs until then and the result is always a snapshot of what was asked.
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)

  const parsedAmount = parseIcp(amount)
  const trimmedMemo = memo.trim()
  const memoTooLong = memoByteLength(trimmedMemo) > MEMO_MAX_BYTES
  // An amount that is typed but unparseable is an error, an empty one is simply
  // "pay me anything" -- the link is still worth generating for that.
  const amountInvalid = amount.trim() !== "" && parsedAmount === null
  const canGenerate = !amountInvalid && !memoTooLong

  // Editing the inputs invalidates whatever link was generated from them.
  const clearOnEdit = (value: string, set: (v: string) => void) => {
    set(value)
    setGeneratedLink(null)
    setCopied(false)
  }

  const handleGenerate = () => {
    if (!username || !canGenerate) return
    setGeneratedLink(
      buildPaymentLink({
        username,
        amount: parsedAmount ?? undefined,
        memo: trimmedMemo || undefined,
      })
    )
    setCopied(false)
  }

  const handleCopy = async () => {
    if (!generatedLink) return
    await copyText(generatedLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("toggleLabel")}</DialogTitle>
          <DialogDescription>{t("toggleHint")}</DialogDescription>
        </DialogHeader>

        {/* Nothing to address a request to, so the modal says so rather than
            rendering a form that cannot produce a link. */}
        {!username ? (
          <Alert>
            <AlertDescription className="flex flex-col items-start gap-3">
              {t("needsUsername")}
              <Button
                size="sm"
                nativeButton={false}
                render={<Link href="/username" />}
              >
                {t("claimUsername")}
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="request-amount">{t("amountLabel")}</Label>
                <Input
                  id="request-amount"
                  size="lg"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder={t("amountPlaceholder")}
                  value={amount}
                  onChange={(e) => clearOnEdit(e.target.value, setAmount)}
                  className="tabular-nums"
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
                  size="lg"
                  autoComplete="off"
                  placeholder={t("memoPlaceholder")}
                  value={memo}
                  onChange={(e) => clearOnEdit(e.target.value, setMemo)}
                />
              </div>

              <p className="text-xs text-muted-foreground">{t("optionalHint")}</p>

              {amountInvalid && (
                <Alert variant="destructive">
                  <AlertDescription>{t("amountInvalid")}</AlertDescription>
                </Alert>
              )}
              {memoTooLong && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {t("memoTooLong", { max: MEMO_MAX_BYTES })}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter>
              <Button className="h-11 w-full text-base" disabled={!canGenerate} onClick={handleGenerate}>
                {t("generate")}
              </Button>
            </DialogFooter>

            {generatedLink && (
              <div className="space-y-3 rounded-xl bg-muted/50 p-3">
                <p className="break-all font-mono text-xs leading-relaxed text-foreground">
                  {generatedLink.replace(/^https?:\/\//, "")}
                </p>
                <Button variant="outline" onClick={handleCopy} className="h-10 w-full">
                  <HugeiconsIcon icon={copied ? Tick02Icon : Copy01Icon} className="size-4" />
                  {copied ? tc("copied") : t("copyLink")}
                </Button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
