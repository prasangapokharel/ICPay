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
  toPlainTokenAmount,
  memoByteLength,
  MEMO_MAX_BYTES,
} from "@/lib/wallet-utils"
import { primeSuccessChime } from "@/lib/success-chime"
import { validateUsername } from "@/lib/username"
import { RecipientLookup } from "@/components/transfer/recipient-card"
import { useResolvedUsername } from "@/hooks/use-wallet-data"
import { useDebounced } from "@/hooks/use-debounced"
import { cn } from "@/lib/utils"
import type { TokenHolding } from "@/services/tokens"

const PERCENTAGES = [25, 50, 75, 100]

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
  // Written back into the field, so it must be a value parseTokenAmount accepts.
  const setAmount = (v: bigint) => {
    setValue(toPlainTokenAmount(v, token.decimals))
    setError(null)
  }
  // Only a resolvable handle can be paid here, and the lookup is debounced so it
  // runs per typing pause rather than per keystroke.
  const debouncedHandle = useDebounced(handle)
  const { principal: resolved, isLoading: resolving } = useResolvedUsername(debouncedHandle)
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
          {/* Recipient leads, the same order the transfer page uses: who is
              being paid is the first decision, and a wrong handle wastes the fee
              whatever the amount is. */}
          <div className="space-y-2">
            <Label htmlFor="send-username">{t("recipient")}</Label>
            <Input
              id="send-username"
              size="xl"
              placeholder={t("recipientPlaceholder")}
              value={username}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              onChange={(e) => {
                setUsername(e.target.value)
                setError(null)
              }}
              className="rounded-2xl"
            />
            <RecipientLookup
              username={handle}
              principal={resolved}
              isLoading={resolving || debouncedHandle !== handle}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-3">
              <Label htmlFor="send-amount">{tc("amount")}</Label>
              <span className="text-xs text-muted-foreground">
                {tc("balance")}{" "}
                <span className="font-medium tabular-nums text-foreground">
                  {full(token.balance)}
                </span>
              </span>
            </div>
            <div className="relative">
              <Input
                id="send-amount"
                size="amount"
                inputMode="decimal"
                placeholder="0.0"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value)
                  setError(null)
                }}
                className="rounded-2xl pr-16"
              />
              {sendable > 0n && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setAmount(sendable)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-muted font-semibold text-primary hover:bg-muted/70"
                >
                  {tc("max")}
                </Button>
              )}
            </div>
            {sendable > 0n && (
              <div className="flex gap-1.5">
                {PERCENTAGES.map((pct) => (
                  <Button
                    key={pct}
                    variant="outline"
                    size="xs"
                    onClick={() => setAmount((sendable * BigInt(pct)) / 100n)}
                    className={cn(
                      "h-7 flex-1 bg-background text-muted-foreground hover:bg-accent hover:text-foreground",
                      pct === 100 && "font-semibold text-primary"
                    )}
                  >
                    {pct}%
                  </Button>
                ))}
              </div>
            )}
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
