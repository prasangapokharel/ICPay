"use client"

import { useState } from "react"
import { WithdrawForm } from "@/components/withdraw/withdraw-form"
import { SendSuccess } from "@/components/wallet/send-success"
import { getWalletActor } from "@/services/wallet"
import { useAuth } from "@/components/auth/auth-provider"
import { useDashboard, useRefreshWallet } from "@/hooks/use-wallet-data"
import { Skeleton } from "@/components/ui/skeleton"
import type { ApiResult } from "@/services/types"
import { Principal } from "@dfinity/principal"

const isHexAccountId = (s: string) => /^[0-9a-fA-F]{64}$/.test(s)

type Sent = { amount: bigint; recipient: string; blockIndex: bigint }

export default function WithdrawPage() {
  const { identity } = useAuth()
  const { data, isLoading } = useDashboard()
  const refreshWallet = useRefreshWallet()
  const [sent, setSent] = useState<Sent | null>(null)
  const balance = data?.icpBalance ?? 0n

  const handleWithdraw = async (amount: bigint, destination: string): Promise<string | null> => {
    if (!identity) return "Not authenticated"
    try {
      const actor = await getWalletActor(identity)
      const memo = [] as [] | [string]
      const result: ApiResult = isHexAccountId(destination)
        ? await actor.transferByAccountId(destination, amount, memo)
        : await actor.withdraw(amount, { owner: Principal.fromText(destination), subaccount: [] })

      if ("ok" in result) {
        // Refetch rather than subtracting locally, so the displayed balance
        // reflects the fee the ledger actually charged.
        refreshWallet()
        setSent({ amount, recipient: destination, blockIndex: result.ok.blockIndex })
        return null
      }
      return result.err
    } catch (e) {
      console.error(e)
      return "Withdrawal failed"
    }
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

      {isLoading && !data ? (
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
