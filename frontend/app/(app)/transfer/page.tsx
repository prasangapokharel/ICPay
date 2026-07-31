"use client"

import { useState } from "react"
import { TransferForm } from "@/components/transfer/transfer-form"
import { SendSuccess } from "@/components/wallet/send-success"
import { getWalletActor } from "@/services/wallet"
import { useAuth } from "@/components/auth/auth-provider"
import { useRefreshWallet } from "@/hooks/use-wallet-data"
import type { TransferMode } from "@/components/transfer/transfer-form"
import type { ApiResult, AccountType } from "@/services/types"
import { Principal } from "@dfinity/principal"

type Sent = { amount: bigint; recipient: string; blockIndex: bigint }

export default function TransferPage() {
  const { identity } = useAuth()
  const refreshWallet = useRefreshWallet()
  const [sent, setSent] = useState<Sent | null>(null)

  const isHexAccountId = (s: string) => /^[0-9a-fA-F]{64}$/.test(s)
  const isValidPrincipal = (s: string) => { try { Principal.fromText(s); return true } catch { return false } }

  const handleTransfer = async (mode: TransferMode, to: string, amount: bigint, memo?: string): Promise<string | null> => {
    if (!identity) return "Not authenticated"
    try {
      const actor = await getWalletActor(identity)
      const memoArg = (memo ? [memo] : []) as [] | [string]
      let result: ApiResult
      if (isHexAccountId(to)) {
        result = await actor.transferByAccountId(to, amount, memoArg)
      } else {
        switch (mode) {
          case "username":
            result = await actor.transferByUsername(to, amount, memoArg)
            break
          case "principal":
            result = await actor.transferByPrincipal(Principal.fromText(to), amount, memoArg)
            break
          case "account":
            result = await actor.transferByAccount({ owner: Principal.fromText(to), subaccount: [] }, amount, memoArg)
            break
        }
      }
      if ("ok" in result) {
        refreshWallet()
        setSent({
          amount,
          recipient: mode === "username" && !to.startsWith("@") ? `@${to}` : to,
          blockIndex: result.ok.blockIndex,
        })
        return null
      }
      return result.err
    } catch (e) {
      console.error(e)
      return "Transfer failed"
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
        <h1 className="text-xl font-bold tracking-tight">Send</h1>
        <p className="text-sm text-muted-foreground">Transfer ICP to another wallet</p>
      </div>
      <TransferForm onTransfer={handleTransfer} />
    </div>
  )
}
