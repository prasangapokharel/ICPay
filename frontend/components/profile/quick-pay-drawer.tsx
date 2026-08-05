"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { HugeiconsIcon } from "@hugeicons/react"
import { LinkSquare02Icon, Share08Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { AmountInput } from "@/components/shared/amount-input"
import { avatarUriFor } from "@/lib/avatar"
import { primeSuccessChime, playSuccessChime } from "@/lib/success-chime"
import {
  E8S,
  ICP_FEE,
  copyText,
  explorerTxUrl,
  formatE8s,
  parseIcp,
} from "@/lib/wallet-utils"
import { cn } from "@/lib/utils"

const PRESETS = [1n, 5n, 10n] as const

// Sent as the ledger memo, so every label is kept inside MEMO_MAX_BYTES (32) --
// a longer one would be rejected by the canister at the point of transfer.
// Fixed options rather than free text: the memo is written on-chain, publicly
// and permanently, and a typed note invites people to put things there they
// cannot take back.
//
// The memo stays English in every locale: it is on-chain data the recipient
// reads in their own language, not UI copy. Only the picker label translates.
const PURPOSES = [
  { key: "payment", memo: "Payment" },
  { key: "tip", memo: "Tip" },
  { key: "utility", memo: "Utility bill" },
  { key: "entertainment", memo: "Entertainment" },
  { key: "food", memo: "Food & drink" },
  { key: "transport", memo: "Transport" },
  { key: "shopping", memo: "Shopping" },
  { key: "gift", memo: "Gift" },
  { key: "donation", memo: "Donation" },
  { key: "other", memo: "Other" },
] as const

type PurposeKey = (typeof PURPOSES)[number]["key"]

type Sent = { amount: bigint; blockIndex: bigint }

export function QuickPayDrawer({
  open,
  onOpenChange,
  username,
  balance,
  request,
  onPay,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  username: string
  balance?: bigint
  // Set when the visitor arrived on a payment link. The recipient already said
  // what they are owed and what for, so there is nothing left to pick -- the
  // drawer becomes a confirmation.
  request?: { amount: bigint; memo?: string }
  onPay: (amount: bigint, message?: string) => Promise<{ blockIndex: bigint } | string>
}) {
  const t = useTranslations("quickPay")
  const tc = useTranslations("common")
  const [selected, setSelected] = useState<bigint | null>(E8S)
  const [custom, setCustom] = useState("")
  const [purpose, setPurpose] = useState<PurposeKey>(PURPOSES[0].key)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState<Sent | null>(null)

  // selected === null means the custom field is driving the amount.
  const amount = request ? request.amount : (selected ?? parseIcp(custom))
  const memo = request ? request.memo : PURPOSES.find((p) => p.key === purpose)?.memo
  const total = amount === null ? null : amount + ICP_FEE
  // The fee is charged on top, so the most that can be sent is balance - fee.
  const sendable = balance === undefined ? undefined : balance > ICP_FEE ? balance - ICP_FEE : 0n
  const insufficient = total !== null && balance !== undefined && total > balance
  const canSend = amount !== null && amount > 0n && !insufficient && !loading

  const handleSend = async () => {
    if (amount === null) return
    // Primed inside the tap: the transfer takes seconds, by which time the
    // gesture that grants audio playback has expired.
    primeSuccessChime()
    setLoading(true)
    setError(null)
    const result = await onPay(amount, memo)
    setLoading(false)
    if (typeof result === "string") {
      setError(result)
      return
    }
    setSent({ amount, blockIndex: result.blockIndex })
  }

  // The success view replaces the form in place rather than routing away, so
  // the fields are cleared when the drawer closes instead of on send.
  const handleOpenChange = (next: boolean) => {
    onOpenChange(next)
    if (next) return
    setSent(null)
    setError(null)
    setPurpose(PURPOSES[0].key)
    setCustom("")
    setSelected(E8S)
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange} showSwipeHandle>
      <DrawerContent>
        {sent ? (
          <PaySuccess
            username={username}
            amount={sent.amount}
            blockIndex={sent.blockIndex}
            onDone={() => handleOpenChange(false)}
          />
        ) : (
          <>
            <DrawerHeader>
              <div className="mb-1 flex justify-center">
                <Avatar className="size-14">
                  <AvatarImage src={avatarUriFor(username)} alt="" />
                  <AvatarFallback className="bg-muted text-sm font-medium uppercase">
                    {username.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <DrawerTitle className="text-center">{t("title", { name: username })}</DrawerTitle>
              <DrawerDescription className="text-center">
                {request ? t("requestSubtitle", { name: username }) : t("subtitle")}
              </DrawerDescription>
            </DrawerHeader>

            <div className="space-y-4 px-4">
              {request ? (
                // Nothing to choose: the amount and the reason came in on the
                // link, so the drawer only has to show what is about to happen.
                <div className="space-y-3 rounded-2xl bg-muted/40 p-5 text-center">
                  <p className="text-4xl font-bold tracking-tight tabular-nums">
                    {formatE8s(request.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">ICP</p>
                  {request.memo && (
                    <p className="border-t pt-3 text-sm">{request.memo}</p>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2.5">
                    {PRESETS.map((icp) => {
                      const value = icp * E8S
                      const active = selected === value
                      // Greyed out rather than hidden, so the row does not reflow
                      // as the balance loads.
                      const tooBig = sendable !== undefined && value > sendable
                      return (
                        <Button
                          key={icp.toString()}
                          variant={active ? "default" : "outline"}
                          disabled={tooBig}
                          onClick={() => {
                            setSelected(value)
                            setError(null)
                          }}
                          className={cn(
                            "h-14 rounded-2xl text-base font-semibold",
                            active &&
                              "bg-primary/10 text-primary ring-1 ring-primary hover:bg-primary/15"
                          )}
                        >
                          <Image
                            src="/images/logo/logo.png"
                            alt=""
                            width={40}
                            height={40}
                            className="size-5 object-contain"
                          />
                          {icp.toString()}
                        </Button>
                      )
                    })}
                    <Button
                      variant={selected === null ? "default" : "outline"}
                      onClick={() => {
                        setSelected(null)
                        setError(null)
                      }}
                      className={cn(
                        "h-14 flex-col gap-0 rounded-2xl text-xs font-semibold",
                        selected === null &&
                          "bg-primary/10 text-primary ring-1 ring-primary hover:bg-primary/15"
                      )}
                    >
                      <span className="text-base leading-none">···</span>
                      {t("custom")}
                    </Button>
                  </div>

                  {selected === null && (
                    <AmountInput
                      id="quick-pay-amount"
                      label={tc("amount")}
                      value={custom}
                      onChange={(v) => {
                        setCustom(v)
                        setError(null)
                      }}
                      balance={balance}
                      maxE8s={sendable}
                    />
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="quick-pay-purpose">{t("purposeLabel")}</Label>
                    <Select
                      value={purpose}
                      onValueChange={(value) => setPurpose((value as PurposeKey) ?? PURPOSES[0].key)}
                    >
                      <SelectTrigger id="quick-pay-purpose" className="h-12 w-full rounded-2xl">
                        <SelectValue placeholder={t("purposePlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        {PURPOSES.map((option) => (
                          <SelectItem key={option.key} value={option.key}>
                            {t(`purposes.${option.key}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>

            <DrawerFooter className="pt-4">
              {/* Insufficient balance is said on the button rather than in an
                  alert above it: the button is already locked, so a second
                  element saying so only pushes the form around. */}
              <Button disabled={!canSend} onClick={handleSend}>
                {loading && <Spinner className="size-4" />}
                {loading
                  ? t("sending")
                  : insufficient
                    ? t("insufficient")
                    : request
                      ? t("confirmAmount", { amount: formatE8s(request.amount) })
                      : t("confirm")}
              </Button>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  )
}

function PaySuccess({
  username,
  amount,
  blockIndex,
  onDone,
}: {
  username: string
  amount: bigint
  blockIndex: bigint
  onDone: () => void
}) {
  const t = useTranslations("quickPay")
  const tc = useTranslations("common")
  // Ref-guarded so the chime belongs to the payment, not to the render: a
  // parent state change would otherwise replay it on-screen.
  const chimed = useRef(false)
  useEffect(() => {
    if (chimed.current) return
    chimed.current = true
    playSuccessChime()
  }, [])

  const [shared, setShared] = useState(false)
  const link = explorerTxUrl(blockIndex)

  // Share sheet where the browser has one, copy everywhere else. Dismissing the
  // sheet rejects with AbortError, which is a choice rather than a failure and
  // must not fall through to a surprise copy.
  const handleShare = async () => {
    const payload = {
      title: t("shareSheetTitle"),
      text: t("shareSheetText", { amount: formatE8s(amount), name: username }),
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
    await copyText(link)
    setShared(true)
    setTimeout(() => setShared(false), 1500)
  }

  return (
    <div className="flex flex-col items-center px-4 pb-8 pt-10 text-center">
      <div className="animate-in fade-in zoom-in-75 flex size-18 items-center justify-center rounded-full bg-success/10 duration-300 ease-out">
        <span className="flex size-13 items-center justify-center rounded-full bg-success text-background shadow-sm">
          <HugeiconsIcon icon={Tick02Icon} className="size-8" strokeWidth={3} />
        </span>
      </div>

      <p className="mt-6 text-3xl font-bold tracking-tight tabular-nums">
        {formatE8s(amount)} ICP
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{t("sentTo", { name: username })}</p>

      <a
        href={explorerTxUrl(blockIndex)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-1 text-xs text-muted-foreground underline underline-offset-2"
      >
        {t("viewOnDashboard")}
        <HugeiconsIcon icon={LinkSquare02Icon} className="size-3" />
      </a>

      <div className="mt-8 flex w-full items-center gap-2">
        <Button className="flex-1" onClick={onDone}>
          {tc("done")}
        </Button>
        {/* Square, so Done keeps the full width it had and the row does not read
            as two competing actions. */}
        <Button
          variant="outline"
          size="icon-lg"
          onClick={handleShare}
          aria-label={t("shareReceipt")}
          className="size-12 rounded-2xl"
        >
          <HugeiconsIcon icon={shared ? Tick02Icon : Share08Icon} className="size-4.5" />
        </Button>
      </div>
    </div>
  )
}
