"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Upload01Icon } from "@hugeicons/core-free-icons"
import { formatAmount, parseIcp, isHexAccountId, ICP_FEE } from "@/lib/wallet-utils"
import { AmountInput } from "@/components/shared/amount-input"
import { primeSuccessChime } from "@/lib/success-chime"
import { Principal } from "@dfinity/principal"

type WithdrawFormProps = {
  balance: bigint
  onWithdraw: (amount: bigint, destination: string) => Promise<string | null>
}

function isValidDestination(v: string): boolean {
  if (isHexAccountId(v)) return true
  try {
    Principal.fromText(v)
    return true
  } catch {
    return false
  }
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

    primeSuccessChime()
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
      <AmountInput
        id="amount"
        label="Amount"
        value={amount}
        onChange={(v) => {
          setAmount(v)
          setError(null)
        }}
        balance={balance}
        maxE8s={maxSendable}
      />

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
        {loading ? <Spinner className="size-4" /> : <HugeiconsIcon icon={Upload01Icon} className="size-4" />}
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
