"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { TransferForm } from "@/components/transfer/transfer-form"
import { SendSuccess } from "@/components/wallet/send-success"
import { AppPage } from "@/components/layout/dashboard/app-page"
import { useAuth } from "@/components/auth/auth-provider"
import { useRefreshWallet, useLiveBalance } from "@/hooks/wallet/useWalletData"
import { transfer, type TransferMode } from "@/services/transfer/transfer"
import { ICP_LEDGER_ID } from "@/services/tokens"

type Sent = { amount: bigint; recipient: string; blockIndex: bigint; memo?: string }

export default function TransferPage() {
  const t = useTranslations("transfer")
  const { identity } = useAuth()
  const refreshWallet = useRefreshWallet()
  const balance = useLiveBalance()
  const [sent, setSent] = useState<Sent | null>(null)

  const handleTransfer = async (
    mode: TransferMode,
    to: string,
    amount: bigint,
    memo?: string,
    subaccount?: Uint8Array
  ): Promise<string | null> => {
    const result = await transfer(identity, ICP_LEDGER_ID, mode, to, amount, memo, subaccount)
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
    <AppPage title={t("title")} description={t("subtitle")}>
      <TransferForm onTransfer={handleTransfer} balance={balance} />
    </AppPage>
  )
}
