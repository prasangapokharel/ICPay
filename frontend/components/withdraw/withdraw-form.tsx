"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { ArrowUpFromLine } from "lucide-react"
import { formatE8s, formatAmount } from "@/lib/wallet-utils"
import { Principal } from "@dfinity/principal"

// Matches Config.ICP_FEE on the canister. The ledger charges it on top of the
// amount sent, so the most a user can withdraw is balance - fee.
const ICP_FEE = 10_000n
const E8S = 100_000_000

type WithdrawFormProps = {
  balance: bigint
  onWithdraw: (amount: bigint, destination: string) => Promise<string | null>
}

function isValidDestination(v: string): boolean {
  if (/^[0-9a-fA-F]{64}$/.test(v)) return true
  try {
    Principal.fromText(v)
    return true
  } catch {
    return false
  }
}

function parseIcp(v: string): bigint | null {
  const t = v.trim()
  if (t === "" || t === "." || !/^\d*\.?\d*$/.test(t)) return null
  const n = Number(t)
  if (!Number.isFinite(n) || n <= 0) return null
  return BigInt(Math.round(n * E8S))
}

export function WithdrawForm({ balance, onWithdraw }: WithdrawFormProps) {
  const [destination, setDestination] = useState("")
  const [amount, setAmount] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const maxSendable = balance > ICP_FEE ? balance - ICP_FEE : 0n
  const parsed = parseIcp(amount)
  const total = parsed === null ? null : parsed + ICP_FEE
  const overBalance = total !== null && total > balance

  const canSubmit =
    !loading && parsed !== null && !overBalance && isValidDestination(destination.trim())

  const handleMax = () => {
    setAmount((Number(maxSendable) / E8S).toString())
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const dest = destination.trim()
    if (!isValidDestination(dest)) {
      setError("Enter a valid principal or 64-character account identifier")
      return
    }
    if (parsed === null) {
      setError("Enter an amount greater than 0")
      return
    }
    if (overBalance) {
      setError("Amount plus network fee exceeds your balance")
      return
    }

    setLoading(true)
    const err = await onWithdraw(parsed, dest)
    if (err) setError(err)
    else {
      setDestination("")
      setAmount("")
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-2xl border p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-muted-foreground">Available</span>
          <span className="text-sm font-semibold tabular-nums">{formatE8s(balance)} ICP</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
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
            className="h-14 pr-20 text-2xl font-semibold tabular-nums"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleMax}
            disabled={maxSendable === 0n}
            className="absolute right-2 top-1/2 h-8 -translate-y-1/2 text-xs font-semibold"
          >
            MAX
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="destination">Destination</Label>
        <Input
          id="destination"
          placeholder="Principal or account identifier"
          autoComplete="off"
          spellCheck={false}
          value={destination}
          onChange={(e) => {
            setDestination(e.target.value)
            setError(null)
          }}
          className="font-mono text-xs"
        />
      </div>

      <div className="space-y-1.5 rounded-2xl bg-muted/40 p-4">
        <Row label="Network fee" value={`${formatAmount(ICP_FEE)} ICP`} />
        <Row
          label="Total deducted"
          value={total === null ? "—" : `${formatAmount(total)} ICP`}
          emphasis
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="h-12 w-full text-base" disabled={!canSubmit}>
        {loading ? <Spinner className="size-4" /> : <ArrowUpFromLine className="size-4" />}
        {loading ? "Sending…" : "Withdraw ICP"}
      </Button>
    </form>
  )
}

function Row({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={emphasis ? "font-semibold tabular-nums" : "tabular-nums"}>{value}</span>
    </div>
  )
}
