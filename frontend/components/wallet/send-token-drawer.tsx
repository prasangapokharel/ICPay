"use client"

import { useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import useSWR from "swr"
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
import {
  formatTokenAmount,
  parseTokenAmount,
  toPlainTokenAmount,
  memoByteLength,
  MEMO_MAX_BYTES,
} from "@/lib/wallet/utils"
import { primeSuccessChime } from "@/lib/ui/successChime"
import { validateUsername } from "@/lib/profile/username"
import { RecipientLookup } from "@/components/transfer/recipient-card"
import { QrScanner } from "@/components/scan/scan"
import { addressText, detectTypedAddress, type ScannedAddress } from "@/lib/wallet/icpAddress"
import { parseIcrcPaymentUri } from "@/lib/wallet/paymentUri"
import { useResolvedUsername } from "@/hooks/wallet/useWalletData"
import { useAuth } from "@/components/auth/auth-provider"
import { fetchTransferConsentMessage } from "@/services/ledger/consent"
import { useDebounced } from "@/hooks/ui/useDebounced"
import { cn } from "@/lib/ui/utils"
import type { TokenHolding } from "@/services/tokens"
import { ICP_LEDGER_ID } from "@/services/tokens"
import type { TransferMode } from "@/services/transfer/transfer"

const PERCENTAGES = [25, 50, 75, 100]

const modeFor: Record<ScannedAddress["kind"], TransferMode> = {
  account: "account",
  icrc1: "principal",
  principal: "principal",
  username: "username",
}

export function SendTokenDrawer({
  open,
  onOpenChange,
  token,
  onSend,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  token: TokenHolding
  onSend: (
    mode: TransferMode,
    to: string,
    amount: bigint,
    memo?: string,
    subaccount?: Uint8Array
  ) => Promise<string | null>
}) {
  const t = useTranslations("sendToken")
  const tc = useTranslations("common")
  const locale = useLocale()
  const { identity } = useAuth()
  // The scan button's label already exists under transfer, in all ten catalogs.
  const tt = useTranslations("transfer")
  const [username, setUsername] = useState("")
  const [value, setValue] = useState("")
  const [memo, setMemo] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [scanOpen, setScanOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  // Anything but "username" means the field holds a principal or account id, so
  // the handle lookup is skipped and the raw text is sent as typed.
  const [mode, setMode] = useState<TransferMode>("username")
  // Only ever set by an ICRC-1 address, which names one account under a
  // principal. Held apart from the field, which shows the owner.
  const [subaccount, setSubaccount] = useState<Uint8Array | null>(null)

  // Parsed at the token's own decimals, never through Number(): an 18-decimal
  // amount does not survive float math and would send more than was typed.
  const amount = parseTokenAmount(value, token.decimals)
  const total = amount === null ? null : amount + token.fee
  // The fee is charged on top, so the whole balance can never be sent.
  const sendable = token.balance > token.fee ? token.balance - token.fee : 0n
  const insufficient = total !== null && total > token.balance
  const memoTooLong = memoByteLength(memo.trim()) > MEMO_MAX_BYTES
  const handle = username.trim().replace(/^@/, "").toLowerCase()
  const recipient = mode === "username" ? handle : username.trim()
  const isIcp = token.ledgerId === ICP_LEDGER_ID

  const applyAddress = (hit: ScannedAddress, raw?: string) => {
    // Account identifiers are an ICP-ledger concept: transferByAccountId takes no
    // ledgerId, and services/transfer routes on hex shape before it looks at the
    // mode. Accepting one here while sending ckBTC would send ICP instead and
    // report success, so it is refused rather than silently repointed.
    if (hit.kind === "account" && !isIcp) {
      setError(t("accountIdIcpOnly", { symbol: token.symbol }))
      return
    }
    setMode(modeFor[hit.kind])
    setUsername(addressText(hit))
    setSubaccount(hit.kind === "icrc1" ? hit.subaccount : null)
    setError(null)

    if (raw) {
      const icrcPay = parseIcrcPaymentUri(raw)
      if (icrcPay?.amount) setValue(icrcPay.amount)
    }
  }

  // The same detector the transfer page uses, so a pasted principal or account
  // id is recognised here rather than failing as an unknown handle. It only
  // fires on self-delimiting forms, so a half-typed username is left alone.
  const handleRecipientChange = (raw: string) => {
    const hit = detectTypedAddress(raw)
    if (hit) {
      applyAddress(hit)
      return
    }
    setUsername(raw)
    setMode("username")
    setSubaccount(null)
    setError(null)
  }

  const full = (v: bigint) => formatTokenAmount(v, token.decimals, token.decimals)
  // Written back into the field, so it must be a value parseTokenAmount accepts.
  const setAmount = (v: bigint) => {
    setValue(toPlainTokenAmount(v, token.decimals))
    setError(null)
  }
  // Only a resolvable handle can be paid here, and the lookup is debounced so it
  // runs per typing pause rather than per keystroke.
  const debouncedHandle = useDebounced(mode === "username" ? handle : "")
  const { principal: resolved, isLoading: resolving } = useResolvedUsername(debouncedHandle)
  // Validated by shape, not by a length floor: handles run from 1 to 8 chars,
  // so a minimum of 3 would refuse to send to the ultra-premium tier. A
  // principal or account id arrived through the parser, so it is already valid.
  const canSend =
    (mode === "username" ? validateUsername(handle) === null : recipient.length > 0) &&
    amount !== null &&
    !insufficient &&
    !memoTooLong &&
    !loading

  const { data: consentText } = useSWR(
    confirming && canSend && identity
      ? (["transfer-consent", token.ledgerId, locale] as const)
      : null,
    () => fetchTransferConsentMessage(identity, token.ledgerId, locale),
    { revalidateOnFocus: false }
  )

  const handleSend = async () => {
    if (amount === null) return
    primeSuccessChime()
    setLoading(true)
    setError(null)
    const err = await onSend(
      mode,
      recipient,
      amount,
      memo.trim() || undefined,
      subaccount ?? undefined
    )
    setLoading(false)
    if (err) {
      setError(err)
      return
    }
    setUsername("")
    setMode("username")
    setSubaccount(null)
    setValue("")
    setMemo("")
    setConfirming(false)
    onOpenChange(false)
  }

  const resetForm = () => {
    setConfirming(false)
    setUsername("")
    setMode("username")
    setSubaccount(null)
    setValue("")
    setMemo("")
    setError(null)
  }

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => {
        if (!next) resetForm()
        onOpenChange(next)
      }}
      showSwipeHandle
    >
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-center">
            {confirming ? t("confirmTitle") : t("title", { symbol: token.symbol })}
          </DrawerTitle>
          <DrawerDescription className="text-center">
            {confirming
              ? t("confirmSubtitle", { symbol: token.symbol })
              : t("subtitle", { symbol: token.symbol })}
          </DrawerDescription>
        </DrawerHeader>

        {confirming ? (
          <div className="space-y-4 px-4">
            <div className="space-y-2 rounded-2xl bg-muted/40 p-4 text-sm">
              <Row label={t("recipient")} value={recipient || "—"} />
              <Row
                label={tc("amount")}
                value={amount === null ? "—" : `${full(amount)} ${token.symbol}`}
                emphasis
              />
              <Row label={tc("fee")} value={`${full(token.fee)} ${token.symbol}`} />
              <Row
                label={t("total")}
                value={total === null ? "—" : `${full(total)} ${token.symbol}`}
                emphasis
              />
            </div>
            {consentText ? (
              <p className="rounded-xl border border-border/40 p-3 text-xs leading-relaxed text-muted-foreground">
                {consentText}
              </p>
            ) : null}
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
          </div>
        ) : (
        <div className="space-y-4 px-4">
          {/* Recipient leads, the same order the transfer page uses: who is
              being paid is the first decision, and a wrong handle wastes the fee
              whatever the amount is. */}
          <div className="space-y-2">
            <Label htmlFor="send-username">{t("recipient")}</Label>
            <div className="relative">
              <Input
                id="send-username"
                size="xl"
                placeholder={t("recipientPlaceholder")}
                value={username}
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="off"
                spellCheck={false}
                onChange={(e) => handleRecipientChange(e.target.value)}
                className={cn(
                  "rounded-2xl pr-14",
                  mode !== "username" && "font-mono text-xs"
                )}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setScanOpen(true)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg text-xs text-muted-foreground"
              >
                {tt("scanQr")}
              </Button>
            </div>
            {mode === "username" && (
              <RecipientLookup
                username={handle}
                principal={resolved}
                isLoading={resolving || debouncedHandle !== handle}
              />
            )}
          </div>

          <QrScanner
            open={scanOpen}
            onOpenChange={setScanOpen}
            onScan={(hit, raw) => applyAddress(hit, raw)}
          />

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
        )}

        <DrawerFooter className={confirming ? "flex-row gap-2" : undefined}>
          {confirming ? (
            <>
              <Button type="button" variant="outline" className="flex-1" onClick={() => setConfirming(false)}>
                {tc("back")}
              </Button>
              <Button className="flex-1" disabled={!canSend} onClick={() => void handleSend()}>
                {loading && <Spinner className="size-4" />}
                {loading ? t("sending") : t("confirmSend")}
              </Button>
            </>
          ) : (
          <Button
            disabled={!canSend}
            onClick={() => {
              if (!canSend) return
              setConfirming(true)
            }}
          >
            {insufficient ? t("insufficient") : t("send")}
          </Button>
          )}
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
