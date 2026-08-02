"use client"

import { useState } from "react"
import { WithdrawForm } from "@/components/withdraw/withdraw-form"
import { SendSuccess } from "@/components/wallet/send-success"
import { useAuth } from "@/components/auth/auth-provider"
import { useLiveBalance, useRefreshWallet } from "@/hooks/use-wallet-data"
import { Skeleton } from "@/components/ui/skeleton"
import { withdraw } from "@/services/withdraw/withdraw"

type Sent = { amount: bigint; recipient: string; blockIndex: bigint }

export default function WithdrawPage() {
  const { identity } = useAuth()
  const balance = useLiveBalance()
  const refreshWallet = useRefreshWallet()
  const [sent, setSent] = useState<Sent | null>(null)

  const handleWithdraw = async (amount: bigint, destination: string): Promise<string | null> => {
    const result = await withdraw(identity, amount, destination)
    if ("err" in result) return result.err

    // Refetch rather than subtracting locally, so the displayed balance
    // reflects the fee the ledger actually charged.
    refreshWallet()
    setSent({ amount, recipient: destination, blockIndex: result.ok.blockIndex })
    return null
  }

  if (sent) {
    return (
      <SendSuccess
        amount={sent.amount}
        recipient={sent.recipient}
        blockIndex={sent.blockIndex}
        onDone={() => setSent(null)}
      />
    )
  }

  return (
    <div className="space-y-6 pt-2">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Withdraw</h1>
        <p className="text-sm text-muted-foreground">Send ICP to an external wallet</p>
      </div>

      {balance === undefined ? (
        <div className="space-y-4">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      ) : (
        <WithdrawForm balance={balance} onWithdraw={handleWithdraw} />
      )}
    </div>
  )
}
