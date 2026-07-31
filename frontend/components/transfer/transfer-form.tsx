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
import { ArrowUpRight } from "lucide-react"
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

export function TransferForm({
  onTransfer,
}: {
  onTransfer: (mode: TransferMode, to: string, amount: bigint, memo?: string) => Promise<string | null>
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
  const canReview = parsed !== null && isValidFor(mode, to)

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
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value)
            setError(null)
          }}
          className="h-14 text-2xl font-semibold tabular-nums"
        />
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
        <ArrowUpRight className="size-4" />
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
              {loading ? <Spinner className="size-4" /> : <ArrowUpRight className="size-4" />}
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
