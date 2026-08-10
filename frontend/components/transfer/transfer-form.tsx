"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  formatAmount,
  memoByteLength,
  MEMO_MAX_BYTES,
  parseIcp,
  isHexAccountId,
  ICP_FEE,
} from "@/lib/wallet-utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { BookmarkAdd01Icon, QrCodeScanIcon } from "@hugeicons/core-free-icons"
import { AmountInput } from "@/components/shared/amount-input"
import { RecipientCard, RecipientLookup } from "@/components/transfer/recipient-card"
import { BookmarkDrawer } from "@/components/bookmark/bookmark-drawer"
import { BookmarkButton } from "@/components/bookmark/bookmark-drawer"
import { useResolvedUsername, useRecipientProfile } from "@/hooks/use-wallet-data"
import { useDebounced } from "@/hooks/use-debounced"
import { Principal } from "@icp-sdk/core/principal"
import { QrScanner, takeScannedAddress } from "@/components/scan/scan"
import { primeSuccessChime } from "@/lib/success-chime"
import { addressText, detectTypedAddress, type ScannedAddress } from "@/lib/icp-address"
import { parsePaymentLink, amountFieldValue } from "@/services/pay/pay"
import type { TransferMode } from "@/services/transfer/transfer"
import { USERNAME_MIN_LENGTH } from "@/lib/username"

const labelKeys = {
  username: { label: "labelUsername", placeholder: "placeholderUsername" },
  principal: { label: "labelPrincipal", placeholder: "placeholderPrincipal" },
  account: { label: "labelAccount", placeholder: "placeholderAccount" },
} as const satisfies Record<TransferMode, { label: string; placeholder: string }>

// An ICRC-1 address names an account under a principal, so it fills the
// principal tab and carries its subaccount alongside.
const modeFor: Record<ScannedAddress["kind"], TransferMode> = {
  account: "account",
  icrc1: "principal",
  principal: "principal",
  username: "username",
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

function isValidFor(mode: TransferMode, v: string): boolean {
  const t = v.trim()
  if (!t) return false
  if (mode === "account") return isHexAccountId(t)
  if (mode === "principal") {
    try {
      Principal.fromText(t)
      return true
    } catch {
      return false
    }
  }
  return t.length >= USERNAME_MIN_LENGTH
}

export function TransferForm({
  onTransfer,
  balance,
}: {
  onTransfer: (
    mode: TransferMode,
    to: string,
    amount: bigint,
    memo?: string,
    subaccount?: Uint8Array
  ) => Promise<string | null>
  balance?: bigint
}) {
  const t = useTranslations("transfer")
  const tc = useTranslations("common")
  const [mode, setMode] = useState<TransferMode>("username")
  const [to, setTo] = useState("")
  const [amount, setAmount] = useState("")
  const [memo, setMemo] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [scanOpen, setScanOpen] = useState(false)
  const [bookmarkOpen, setBookmarkOpen] = useState(false)
  // Only ever set by a scan. Held apart from `to` because the recipient field
  // shows the owner, while the money is owed to one account underneath it.
  const [subaccount, setSubaccount] = useState<Uint8Array | null>(null)

  const applyScan = (hit: ScannedAddress, raw: string) => {
    setMode(modeFor[hit.kind])
    setTo(addressText(hit))
    setSubaccount(hit.kind === "icrc1" ? hit.subaccount : null)
    setError(null)

    // A payment link asks for a specific amount, for a specific thing. Filling
    // both is the whole point of scanning one -- but they stay editable, since
    // someone tipping above the asking price should be able to.
    const req = parsePaymentLink(raw)
    if (!req) return
    if (req.amount !== undefined) setAmount(amountFieldValue(req.amount))
    if (req.memo !== undefined) setMemo(req.memo)
  }

  // Pasting a principal into the username tab used to sit there failing lookup
  // until the user noticed the tabs. The typed detector only fires on forms that
  // are unambiguous and self-delimiting, so it cannot steal a half-typed handle.
  const handleRecipientChange = (raw: string) => {
    const hit = detectTypedAddress(raw)
    if (hit) {
      applyScan(hit, raw)
      return
    }
    setTo(raw)
    // A subaccount left over from a scan would silently redirect a
    // hand-typed principal's payment to a different account.
    setSubaccount(null)
    setError(null)
  }

  // A scan started elsewhere in the app lands here through session storage.
  // Reading it during render is not an option: the page is prerendered at build
  // time, where sessionStorage does not exist, so a filled field would mismatch
  // the baked HTML on hydration.
  useEffect(() => {
    const scanned = takeScannedAddress()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (scanned) applyScan(scanned.hit, scanned.raw)
  }, [])

  const parsed = parseIcp(amount)
  const total = parsed === null ? null : parsed + ICP_FEE
  // Only username mode is resolvable; a principal or account id has no profile
  // to look up. Debounced so a lookup runs per typing pause, not per keystroke.
  const debouncedTo = useDebounced(mode === "username" ? to : "")
  const { principal: resolved, isLoading: resolving } = useResolvedUsername(debouncedTo)
  const recipientProfile = useRecipientProfile(to.trim(), resolved ?? null)
  // True only once the lookup has settled on a miss, so the Review button is not
  // disabled while a valid name is still in flight.
  const unknownRecipient =
    mode === "username" &&
    to.trim().length >= USERNAME_MIN_LENGTH &&
    debouncedTo.trim() === to.trim() &&
    !resolving &&
    resolved === null
  // The fee is taken on top of the amount, so the largest sendable amount is
  // balance - fee. Anything above that is rejected by the ledger, not here.
  const sendable = balance === undefined ? undefined : balance > ICP_FEE ? balance - ICP_FEE : 0n
  const insufficient =
    total !== null && balance !== undefined && total > balance
  const memoTooLong = memoByteLength(memo.trim()) > MEMO_MAX_BYTES
  const canReview =
    parsed !== null &&
    isValidFor(mode, to) &&
    !insufficient &&
    !unknownRecipient &&
    !memoTooLong

  const handleConfirm = async () => {
    if (parsed === null) return
    primeSuccessChime()
    setLoading(true)
    setError(null)
    const err = await onTransfer(mode, to.trim(), parsed, memo.trim() || undefined, subaccount ?? undefined)
    setLoading(false)
    if (err) {
      setError(err)
      setConfirmOpen(false)
      return
    }
    setConfirmOpen(false)
    setTo("")
    setSubaccount(null)
    setAmount("")
    setMemo("")
  }

  return (
    <div className="space-y-5">
      <Tabs
        value={mode}
        onValueChange={(v) => {
          setMode(v as TransferMode)
          setTo("")
          setSubaccount(null)
          setError(null)
        }}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="username">{t("tabUsername")}</TabsTrigger>
          <TabsTrigger value="principal">{t("tabPrincipal")}</TabsTrigger>
          <TabsTrigger value="account">{t("tabAccount")}</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="to">{t(labelKeys[mode].label)}</Label>
          {mode === "username" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setBookmarkOpen(true)}
              className="h-6 gap-1 text-xs text-muted-foreground"
            >
              <HugeiconsIcon icon={BookmarkAdd01Icon} className="size-3.5" />
              {t("bookmarks")}
            </Button>
          )}
        </div>
        <div className="relative">
          <Input
            id="to"
            size="lg"
            placeholder={t(labelKeys[mode].placeholder)}
            autoComplete="off"
            spellCheck={false}
            value={to}
            onChange={(e) => handleRecipientChange(e.target.value)}
            className={mode === "username" ? "pr-14" : "pr-14 font-mono text-xs"}
          />
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setScanOpen(true)}
            aria-label={t("scanQr")}
            className="absolute right-2 top-1/2 size-8 -translate-y-1/2 rounded-lg text-muted-foreground"
          >
            <HugeiconsIcon icon={QrCodeScanIcon} className="size-4" />
          </Button>
        </div>
        {mode === "username" && (
          <RecipientLookup
            username={to}
            principal={resolved}
            isLoading={resolving || debouncedTo.trim() !== to.trim()}
          />
        )}
      </div>

      <AmountInput
        id="amount"
        label={tc("amount")}
        value={amount}
        onChange={(v) => {
          setAmount(v)
          setError(null)
        }}
        balance={balance}
        maxE8s={sendable}
        size="default"
      />
      {sendable !== undefined && (
        <p className="text-xs text-muted-foreground">
          {t("maxSendable", { amount: formatAmount(sendable), fee: formatAmount(ICP_FEE) })}
        </p>
      )}

      <QrScanner open={scanOpen} onOpenChange={setScanOpen} onScan={applyScan} />
      <BookmarkDrawer
        open={bookmarkOpen}
        onOpenChange={setBookmarkOpen}
        onSelect={(username) => {
          setMode("username")
          setTo(username)
          setSubaccount(null)
          setError(null)
        }}
      />

      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <Label htmlFor="memo">{t("memoLabel")}</Label>
          <span
            className={
              memoTooLong
                ? "text-xs font-medium tabular-nums text-destructive"
                : "text-xs tabular-nums text-muted-foreground"
            }
          >
            {memoByteLength(memo.trim())}/{MEMO_MAX_BYTES}
          </span>
        </div>
        <Textarea
          id="memo"
          placeholder={t("memoPlaceholder")}
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
        {memoTooLong && (
          <p className="text-xs text-destructive">
            {t("memoTooLong", { max: MEMO_MAX_BYTES })}
          </p>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Insufficient balance is said on the button rather than in an alert
          above it: the button is already locked, so a second element saying so
          only pushes the form around. */}
      <Button
        className="w-full"
        disabled={!canReview}
        onClick={() => setConfirmOpen(true)}
      >
        {insufficient ? t("insufficientShort") : t("review")}
      </Button>

      <Drawer open={confirmOpen} onOpenChange={setConfirmOpen} showSwipeHandle>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{t("confirmTitle")}</DrawerTitle>
            <DrawerDescription>{t("confirmBody")}</DrawerDescription>
          </DrawerHeader>

          <div className="space-y-4 px-4">
            <div className="rounded-2xl bg-muted/40 p-4 text-center">
              <p className="text-3xl font-bold tabular-nums">
                {parsed === null ? "—" : formatAmount(parsed)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">ICP</p>
            </div>

            {mode === "username" && resolved && (
              <RecipientCard username={to.trim()} principal={resolved} />
            )}

            <div className="space-y-2 rounded-2xl border p-4">
              {!(mode === "username" && resolved) && (
                <Row label={t("rowTo")} value={to.trim()} mono />
              )}
              {subaccount && <Row label={t("rowSubaccount")} value={toHex(subaccount)} mono />}
              <Row label={t("rowNetworkFee")} value={`${formatAmount(ICP_FEE)} ICP`} />
              <Row
                label={t("rowTotalDeducted")}
                value={total === null ? "—" : `${formatAmount(total)} ICP`}
                emphasis
              />
              {memo.trim() && <Row label={t("rowMemo")} value={memo.trim()} />}
            </div>
          </div>

          <DrawerFooter>
            <Button onClick={handleConfirm} disabled={loading}>
              {loading && <Spinner className="size-4" />}
              {loading ? t("sending") : t("confirmSend")}
            </Button>
            <DrawerClose
              render={
                <Button variant="outline" disabled={loading}>
                  {tc("cancel")}
                </Button>
              }
            />
            {mode === "username" && recipientProfile && !loading && (
              <BookmarkButton
                targetUserId={recipientProfile.id}
                username={to.trim()}
              />
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

function Row({
  label,
  value,
  mono,
  emphasis,
}: {
  label: string
  value: string
  mono?: boolean
  emphasis?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <span
        className={[
          "min-w-0 break-all text-right text-sm",
          mono ? "font-mono text-xs" : "",
          emphasis ? "font-semibold tabular-nums" : "",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  )
}
