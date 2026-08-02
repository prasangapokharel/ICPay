"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { HugeiconsIcon } from "@hugeicons/react"
import { FlashIcon, LinkSquare02Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { AmountInput } from "@/components/shared/amount-input"
import { avatarUriFor } from "@/lib/avatar"
import { primeSuccessChime, playSuccessChime } from "@/lib/success-chime"
import {
  E8S,
  ICP_FEE,
  MEMO_MAX_BYTES,
  explorerTxUrl,
  formatAmount,
  formatE8s,
  memoByteLength,
  parseIcp,
} from "@/lib/wallet-utils"
import { cn } from "@/lib/utils"

const PRESETS = [1n, 5n, 10n] as const

type Sent = { amount: bigint; blockIndex: bigint }

export function QuickPayDrawer({
  open,
  onOpenChange,
  username,
  balance,
  onPay,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  username: string
  balance?: bigint
  onPay: (amount: bigint, message?: string) => Promise<{ blockIndex: bigint } | string>
}) {
  const [selected, setSelected] = useState<bigint | null>(E8S)
  const [custom, setCustom] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState<Sent | null>(null)

  // selected === null means the custom field is driving the amount.
  const amount = selected ?? parseIcp(custom)
  const total = amount === null ? null : amount + ICP_FEE
  // The fee is charged on top, so the most that can be sent is balance - fee.
  const sendable = balance === undefined ? undefined : balance > ICP_FEE ? balance - ICP_FEE : 0n
  const insufficient = total !== null && balance !== undefined && total > balance
  const memoTooLong = memoByteLength(message.trim()) > MEMO_MAX_BYTES
  const canSend = amount !== null && amount > 0n && !insufficient && !memoTooLong && !loading

  const handleSend = async () => {
    if (amount === null) return
    // Primed inside the tap: the transfer takes seconds, by which time the
    // gesture that grants audio playback has expired.
    primeSuccessChime()
    setLoading(true)
    setError(null)
    const result = await onPay(amount, message.trim() || undefined)
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
    setMessage("")
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
              <DrawerTitle className="text-center">Pay @{username}</DrawerTitle>
              <DrawerDescription className="text-center">
                Pick an amount to send.
              </DrawerDescription>
            </DrawerHeader>

            <div className="space-y-4 px-4">
              <div className="grid grid-cols-2 gap-2.5">
                {PRESETS.map((icp) => {
                  const value = icp * E8S
                  const active = selected === value
                  // Greyed out rather than hidden, so the row does not reflow as
                  // the balance loads.
                  const tooBig = sendable !== undefined && value > sendable
                  return (
                    <button
                      key={icp.toString()}
                      type="button"
                      disabled={tooBig}
                      onClick={() => {
                        setSelected(value)
                        setError(null)
                      }}
                      className={cn(
                        "flex h-14 items-center justify-center gap-2 rounded-2xl text-base font-semibold ring-1 transition-colors",
                        active
                          ? "bg-primary/10 text-primary ring-primary"
                          : "bg-muted/40 ring-border hover:bg-accent",
                        tooBig && "pointer-events-none opacity-40"
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
                    </button>
                  )
                })}
                <button
                  type="button"
                  onClick={() => {
                    setSelected(null)
                    setError(null)
                  }}
                  className={cn(
                    "flex h-14 flex-col items-center justify-center rounded-2xl text-xs font-semibold ring-1 transition-colors",
                    selected === null
                      ? "bg-primary/10 text-primary ring-primary"
                      : "bg-muted/40 ring-border hover:bg-accent"
                  )}
                >
                  <span className="text-base leading-none">···</span>
                  Custom
                </button>
              </div>

              {selected === null && (
                <AmountInput
                  id="quick-pay-amount"
                  label="Amount"
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
                <div className="flex items-baseline justify-between">
                  <Label htmlFor="quick-pay-message">Message (optional)</Label>
                  <span
                    className={cn(
                      "text-xs tabular-nums",
                      memoTooLong ? "font-medium text-destructive" : "text-muted-foreground"
                    )}
                  >
                    {memoByteLength(message.trim())}/{MEMO_MAX_BYTES}
                  </span>
                </div>
                <Input
                  id="quick-pay-message"
                  placeholder="Add a message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="h-12 rounded-2xl"
                />
                {memoTooLong && (
                  <p className="text-xs text-destructive">
                    The ledger only stores {MEMO_MAX_BYTES} bytes. Shorten the message.
                  </p>
                )}
              </div>

              {insufficient && !error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Not enough balance. Sending {formatAmount(amount!)} ICP costs{" "}
                    {formatAmount(total!)} ICP with the fee.
                  </AlertDescription>
                </Alert>
              )}

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
                  <HugeiconsIcon icon={FlashIcon} className="size-4" />
                )}
                {loading ? "Sending…" : "Confirm"}
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
  // Ref-guarded so the chime belongs to the payment, not to the render: a
  // parent state change would otherwise replay it on-screen.
  const chimed = useRef(false)
  useEffect(() => {
    if (chimed.current) return
    chimed.current = true
    playSuccessChime()
  }, [])

  return (
    <div className="flex flex-col items-center px-4 pb-8 pt-10 text-center">
      <div className="animate-in fade-in zoom-in-75 flex size-18 items-center justify-center rounded-full bg-green-100 duration-300 ease-out dark:bg-green-950">
        <span className="flex size-13 items-center justify-center rounded-full bg-green-600 text-white shadow-sm">
          <HugeiconsIcon icon={Tick02Icon} className="size-8" strokeWidth={3} />
        </span>
      </div>

      <p className="mt-6 text-3xl font-bold tracking-tight tabular-nums">
        {formatE8s(amount)} ICP
      </p>
      <p className="mt-2 text-sm text-muted-foreground">Sent to @{username}</p>

      <a
        href={explorerTxUrl(blockIndex)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-1 text-xs text-muted-foreground underline underline-offset-2"
      >
        View on ICP Dashboard
        <HugeiconsIcon icon={LinkSquare02Icon} className="size-3" />
      </a>

      <Button className="mt-8 h-12 w-full text-base" onClick={onDone}>
        Done
      </Button>
    </div>
  )
}
