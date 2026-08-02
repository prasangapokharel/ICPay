"use client"

import { useState } from "react"
import { TransferForm } from "@/components/transfer/transfer-form"
import { SendSuccess } from "@/components/wallet/send-success"
import { useAuth } from "@/components/auth/auth-provider"
import { useRefreshWallet, useDashboard } from "@/hooks/use-wallet-data"
import { transfer, type TransferMode } from "@/services/transfer/transfer"

type Sent = { amount: bigint; recipient: string; blockIndex: bigint; memo?: string }

export default function TransferPage() {
  const { identity } = useAuth()
  const refreshWallet = useRefreshWallet()
  const { data: dashboard } = useDashboard()
  const [sent, setSent] = useState<Sent | null>(null)

  const handleTransfer = async (mode: TransferMode, to: string, amount: bigint, memo?: string): Promise<string | null> => {
    const result = await transfer(identity, mode, to, amount, memo)
    if ("err" in result) return result.err

    refreshWallet()
    setSent({
      amount,
      recipient: mode === "username" && !to.startsWith("@") ? `@${to}` : to,
      blockIndex: result.ok.blockIndex,
      memo,
    })
    return null
  }

  if (sent) {
    return (
      <SendSuccess
        amount={sent.amount}
        recipient={sent.recipient}
        blockIndex={sent.blockIndex}
        memo={sent.memo}
        onDone={() => setSent(null)}
      />
    )
  }

  return (
    <div className="space-y-6 pt-2">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Send</h1>
        <p className="text-sm text-muted-foreground">Transfer ICP to another wallet</p>
      </div>
      <TransferForm onTransfer={handleTransfer} balance={dashboard?.icpBalance} />
    </div>
  )
}
