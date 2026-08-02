"use client"

import { useState } from "react"
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
import { GiftIcon } from "@hugeicons/core-free-icons"
import {
  memoByteLength,
  MEMO_MAX_BYTES,
  parseIcp,
  E8S,
  ICP_FEE,
} from "@/lib/wallet-utils"
import { AmountInput } from "@/components/shared/amount-input"
import { avatarUriFor } from "@/lib/avatar"
import { primeSuccessChime } from "@/lib/success-chime"
import { cn } from "@/lib/utils"

const PRESETS = [1n, 5n, 10n] as const

export function TipDrawer({
  open,
  onOpenChange,
  username,
  balance,
  onTip,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  username: string
  balance?: bigint
  onTip: (amount: bigint, message?: string) => Promise<string | null>
}) {
  const [selected, setSelected] = useState<bigint | null>(E8S)
  const [custom, setCustom] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // selected === null means the custom field is driving the amount.
  const amount = selected ?? parseIcp(custom)
  const total = amount === null ? null : amount + ICP_FEE
  // The fee is charged on top, so the most that can be tipped is balance - fee.
  const sendable = balance === undefined ? undefined : balance > ICP_FEE ? balance - ICP_FEE : 0n
  const insufficient = total !== null && balance !== undefined && total > balance
  const memoTooLong = memoByteLength(message.trim()) > MEMO_MAX_BYTES
  const canSend =
    amount !== null && amount > 0n && !insufficient && !memoTooLong && !loading

  const handleSend = async () => {
    if (amount === null) return
    primeSuccessChime()
    setLoading(true)
    setError(null)
    const err = await onTip(amount, message.trim() || undefined)
    setLoading(false)
    if (err) {
      setError(err)
      return
    }
    setMessage("")
    setCustom("")
    setSelected(E8S)
    onOpenChange(false)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle>
      <DrawerContent>
        <DrawerHeader>
          <div className="mb-1 flex justify-center">
            <Avatar className="size-14">
              <AvatarImage src={avatarUriFor(username)} alt="" />
              <AvatarFallback className="bg-muted text-sm font-medium uppercase">
                {username.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          </div>
          <DrawerTitle className="text-center">@{username}</DrawerTitle>
          <DrawerDescription className="text-center">
            Pick an amount to send.
          </DrawerDescription>
        </DrawerHeader>

        <div className="space-y-4 px-4">
          <div className="grid grid-cols-2 gap-2.5">
            {PRESETS.map((icp) => {
              const value = icp * E8S
              const active = selected === value
              // Greyed out rather than hidden, so the row does not reflow as the
              // balance changes and the user can see what a bigger tip needs.
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
              id="tip-amount"
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
              <Label htmlFor="tip-message">Message (optional)</Label>
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
              id="tip-message"
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

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DrawerFooter>
          {/* Insufficient balance is said on the button rather than in an alert
              above it: the button is already locked, so a second element saying
              so only pushes the form around. */}
          <Button className="h-12 text-base" disabled={!canSend} onClick={handleSend}>
            {loading ? (
              <Spinner className="size-4" />
            ) : (
              <HugeiconsIcon icon={GiftIcon} className="size-4" />
            )}
            {loading ? "Sending…" : insufficient ? "Insufficient balance" : "Send tip"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
