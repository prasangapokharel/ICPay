"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons"
import {
  formatTokenAmount,
  parseTokenAmount,
  memoByteLength,
  MEMO_MAX_BYTES,
} from "@/lib/wallet-utils"
import { primeSuccessChime } from "@/lib/success-chime"
import { validateUsername } from "@/lib/username"
import { cn } from "@/lib/utils"
import type { TokenHolding } from "@/services/tokens"

export function SendTokenDrawer({
  open,
  onOpenChange,
  token,
  onSend,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  token: TokenHolding
  onSend: (username: string, amount: bigint, memo?: string) => Promise<string | null>
}) {
  const t = useTranslations("sendToken")
  const tc = useTranslations("common")
  const [username, setUsername] = useState("")
  const [value, setValue] = useState("")
  const [memo, setMemo] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Parsed at the token's own decimals, never through Number(): an 18-decimal
  // amount does not survive float math and would send more than was typed.
  const amount = parseTokenAmount(value, token.decimals)
  const total = amount === null ? null : amount + token.fee
  // The fee is charged on top, so the whole balance can never be sent.
  const sendable = token.balance > token.fee ? token.balance - token.fee : 0n
  const insufficient = total !== null && total > token.balance
  const memoTooLong = memoByteLength(memo.trim()) > MEMO_MAX_BYTES
  const handle = username.trim().replace(/^@/, "").toLowerCase()

  const full = (v: bigint) => formatTokenAmount(v, token.decimals, token.decimals)
  // Validated by shape, not by a length floor: handles run from 1 to 8 chars,
  // so a minimum of 3 would refuse to send to the ultra-premium tier.
  const canSend =
    validateUsername(handle) === null &&
    amount !== null &&
    !insufficient &&
    !memoTooLong &&
    !loading

  const handleSend = async () => {
    if (amount === null) return
    primeSuccessChime()
    setLoading(true)
    setError(null)
    const err = await onSend(handle, amount, memo.trim() || undefined)
    setLoading(false)
    if (err) {
      setError(err)
      return
    }
    setUsername("")
    setValue("")
    setMemo("")
    onOpenChange(false)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-center">
            {t("title", { symbol: token.symbol })}
          </DrawerTitle>
          <DrawerDescription className="text-center">
            {t("subtitle", { symbol: token.symbol })}
          </DrawerDescription>
        </DrawerHeader>

        <div className="space-y-4 px-4">
          <div className="space-y-2">
            <Label htmlFor="send-username">{t("recipient")}</Label>
            <Input
              id="send-username"
              placeholder={t("recipientPlaceholder")}
              value={username}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              onChange={(e) => {
                setUsername(e.target.value)
                setError(null)
              }}
              className="h-12 rounded-2xl"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-3">
              <Label htmlFor="send-amount">{tc("amount")}</Label>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => {
                  setValue(full(sendable))
                  setError(null)
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                {tc("balance")}{" "}
                <span className="font-medium tabular-nums text-foreground">
                  {full(token.balance)}
                </span>
              </Button>
            </div>
            <Input
              id="send-amount"
              inputMode="decimal"
              placeholder="0.0"
              value={value}
              onChange={(e) => {
                setValue(e.target.value)
                setError(null)
              }}
              className="h-12 rounded-2xl text-base tabular-nums"
            />
            {value !== "" && amount === null && (
              <p className="text-xs text-destructive">
                {t("badAmount", { decimals: token.decimals })}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <Label htmlFor="send-memo">{t("memoLabel")}</Label>
              <span
                className={cn(
                  "text-xs tabular-nums",
                  memoTooLong ? "font-medium text-destructive" : "text-muted-foreground"
                )}
              >
                {memoByteLength(memo.trim())}/{MEMO_MAX_BYTES}
              </span>
            </div>
            <Textarea
              id="send-memo"
              placeholder={t("memoPlaceholder")}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="rounded-2xl"
            />
          </div>

          <div className="space-y-1.5 rounded-2xl bg-muted/40 p-4">
            <Row label={tc("fee")} value={`${full(token.fee)} ${token.symbol}`} />
            <Row
              label={t("total")}
              value={total === null ? "—" : `${full(total)} ${token.symbol}`}
              emphasis
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DrawerFooter>
          <Button className="h-12 text-base" disabled={!canSend} onClick={handleSend}>
            {loading ? (
              <Spinner className="size-4" />
            ) : (
              <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-4" />
            )}
            {loading ? t("sending") : insufficient ? t("insufficient") : t("send")}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function Row({
  label,
  value,
  emphasis,
}: {
  label: string
  value: string
  emphasis?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <span
        className={`break-all text-right ${emphasis ? "font-semibold tabular-nums" : "tabular-nums"}`}
      >
        {value}
      </span>
    </div>
  )
}
