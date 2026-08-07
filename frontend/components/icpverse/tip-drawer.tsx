"use client"

import { useState } from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
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

// Stamped onto the memo so the recipient can tell who tipped -- the ledger only
// carries the canister's own principal as the sender. English in every locale:
// it is on-chain data the recipient reads, not UI copy.
function tipPrefix(sender: string): string {
  return `Tip by @${sender}`
}

export function TipDrawer({
  open,
  onOpenChange,
  username,
  senderUsername,
  balance,
  onTip,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  username: string
  senderUsername?: string
  balance?: bigint
  onTip: (amount: bigint, message?: string) => Promise<string | null>
}) {
  const t = useTranslations("tip")
  const tc = useTranslations("common")
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
  // The prefix is charged against the same 32-byte ledger memo, so the field
  // only gets what is left after it -- otherwise a full-length message would be
  // accepted here and rejected by the canister.
  const prefix = senderUsername ? tipPrefix(senderUsername) : ""
  const prefixBytes = prefix ? memoByteLength(`${prefix}: `) : 0
  const messageBudget = MEMO_MAX_BYTES - prefixBytes
  const memoTooLong = memoByteLength(message.trim()) > messageBudget
  const canSend =
    amount !== null && amount > 0n && !insufficient && !memoTooLong && !loading

  const handleSend = async () => {
    if (amount === null) return
    primeSuccessChime()
    setLoading(true)
    setError(null)
    const note = message.trim()
    const memo = prefix ? (note ? `${prefix}: ${note}` : prefix) : note || undefined
    const err = await onTip(amount, memo)
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
            {t("subtitle")}
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
                    active && "bg-primary/10 text-primary ring-1 ring-primary hover:bg-primary/15"
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
              id="tip-amount"
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
            <div className="flex items-baseline justify-between">
              <Label htmlFor="tip-message">{t("messageLabel")}</Label>
              <span
                className={cn(
                  "text-xs tabular-nums",
                  memoTooLong ? "font-medium text-destructive" : "text-muted-foreground"
                )}
              >
                {memoByteLength(message.trim())}/{messageBudget}
              </span>
            </div>
            <Textarea
              id="tip-message"
              placeholder={t("messagePlaceholder")}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="rounded-2xl"
            />
            {memoTooLong && (
              <p className="text-xs text-destructive">
                {t("memoTooLong", { max: messageBudget })}
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
          <Button disabled={!canSend} onClick={handleSend}>
            {loading && <Spinner className="size-4" />}
            {loading ? t("sending") : insufficient ? t("insufficient") : t("send")}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
