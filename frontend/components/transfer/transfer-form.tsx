"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons"
import { formatAmount } from "@/lib/wallet-utils"
import { Principal } from "@dfinity/principal"

export type TransferMode = "username" | "principal" | "account"

// Matches Config.ICP_FEE; the ledger charges it on top of the amount sent.
const ICP_FEE = 10_000n
const E8S = 100_000_000

const labels: Record<TransferMode, { label: string; placeholder: string }> = {
  username: { label: "Recipient username", placeholder: "username" },
  principal: { label: "Recipient principal", placeholder: "aaaaa-aa..." },
  account: { label: "Account identifier", placeholder: "64-character hex" },
}

function parseIcp(v: string): bigint | null {
  const t = v.trim()
  if (t === "" || t === "." || !/^\d*\.?\d*$/.test(t)) return null
  const n = Number(t)
  if (!Number.isFinite(n) || n <= 0) return null
  return BigInt(Math.round(n * E8S))
}

function isValidFor(mode: TransferMode, v: string): boolean {
  const t = v.trim()
  if (!t) return false
  if (mode === "account") return /^[0-9a-fA-F]{64}$/.test(t)
  if (mode === "principal") {
    try {
      Principal.fromText(t)
      return true
    } catch {
      return false
    }
  }
  return t.length >= 3
}

function toPlainIcp(e8s: bigint): string {
  // Not formatE8s: it groups thousands with commas, which parseIcp rejects.
  // Full precision is kept so Max cannot round part of the balance away.
  const whole = e8s / 100_000_000n
  const fraction = (e8s % 100_000_000n).toString().padStart(8, "0").replace(/0+$/, "")
  return fraction ? `${whole}.${fraction}` : `${whole}`
}

export function TransferForm({
  onTransfer,
  balance,
}: {
  onTransfer: (mode: TransferMode, to: string, amount: bigint, memo?: string) => Promise<string | null>
  balance?: bigint
}) {
  const [mode, setMode] = useState<TransferMode>("username")
  const [to, setTo] = useState("")
  const [amount, setAmount] = useState("")
  const [memo, setMemo] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const parsed = parseIcp(amount)
  const total = parsed === null ? null : parsed + ICP_FEE
  // The fee is taken on top of the amount, so the largest sendable amount is
  // balance - fee. Anything above that is rejected by the ledger, not here.
  const sendable = balance === undefined ? undefined : balance > ICP_FEE ? balance - ICP_FEE : 0n
  const insufficient =
    total !== null && balance !== undefined && total > balance
  const canReview = parsed !== null && isValidFor(mode, to) && !insufficient

  const handleConfirm = async () => {
    if (parsed === null) return
    setLoading(true)
    setError(null)
    const err = await onTransfer(mode, to.trim(), parsed, memo.trim() || undefined)
    setLoading(false)
    if (err) {
      setError(err)
      setConfirmOpen(false)
      return
    }
    setConfirmOpen(false)
    setTo("")
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
          setError(null)
        }}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="username">Username</TabsTrigger>
          <TabsTrigger value="principal">Principal</TabsTrigger>
          <TabsTrigger value="account">Account ID</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <Label htmlFor="amount">Amount</Label>
          {balance !== undefined && (
            <span className="text-xs text-muted-foreground">
              Balance{" "}
              <span className="font-medium tabular-nums text-foreground">
                {formatAmount(balance)} ICP
              </span>
            </span>
          )}
        </div>
        <div className="relative">
          <Input
            id="amount"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value)
              setError(null)
            }}
            className="h-14 pr-16 text-2xl font-semibold tabular-nums"
          />
          {sendable !== undefined && sendable > 0n && (
            <button
              type="button"
              onClick={() => {
                setAmount(toPlainIcp(sendable))
                setError(null)
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-muted px-2.5 py-1 text-xs font-semibold text-primary transition-colors hover:bg-muted/70"
            >
              Max
            </button>
          )}
        </div>
        {sendable !== undefined && (
          <p className="text-xs text-muted-foreground">
            Max sendable {formatAmount(sendable)} ICP after the {formatAmount(ICP_FEE)} ICP fee
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="to">{labels[mode].label}</Label>
        <Input
          id="to"
          placeholder={labels[mode].placeholder}
          autoComplete="off"
          spellCheck={false}
          value={to}
          onChange={(e) => {
            setTo(e.target.value)
            setError(null)
          }}
          className={mode === "username" ? undefined : "font-mono text-xs"}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="memo">Memo (optional)</Label>
        <Input
          id="memo"
          placeholder="Payment reference"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
      </div>

      {insufficient && !error && (
        <Alert variant="destructive">
          <AlertDescription>
            Not enough balance. Sending {formatAmount(parsed!)} ICP costs{" "}
            {formatAmount(total!)} ICP with the fee.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        className="h-12 w-full text-base"
        disabled={!canReview}
        onClick={() => setConfirmOpen(true)}
      >
        <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-4" />
        Review transfer
      </Button>

      <Drawer open={confirmOpen} onOpenChange={setConfirmOpen} showSwipeHandle>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Confirm transfer</DrawerTitle>
            <DrawerDescription>Check the details before sending.</DrawerDescription>
          </DrawerHeader>

          <div className="space-y-4 px-4">
            <div className="rounded-2xl bg-muted/40 p-4 text-center">
              <p className="text-3xl font-bold tabular-nums">
                {parsed === null ? "—" : formatAmount(parsed)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">ICP</p>
            </div>

            <div className="space-y-2 rounded-2xl border p-4">
              <Row label="To" value={to.trim()} mono />
              <Row label="Network fee" value={`${formatAmount(ICP_FEE)} ICP`} />
              <Row
                label="Total deducted"
                value={total === null ? "—" : `${formatAmount(total)} ICP`}
                emphasis
              />
              {memo.trim() && <Row label="Memo" value={memo.trim()} />}
            </div>
          </div>

          <DrawerFooter>
            <Button className="h-12 text-base" onClick={handleConfirm} disabled={loading}>
              {loading ? <Spinner className="size-4" /> : <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-4" />}
              {loading ? "Sending…" : "Confirm & send"}
            </Button>
            <DrawerClose
              render={
                <Button variant="outline" disabled={loading}>
                  Cancel
                </Button>
              }
            />
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
