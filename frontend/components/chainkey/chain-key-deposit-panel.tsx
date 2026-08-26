"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { useChainKeyStatus } from "@/hooks/chainkey/useChainKeyStatus"
import { CKBTC_LEDGER_ID } from "@/services/chainkey/constants"
import { formatTokenAmount } from "@/lib/wallet/utils"

export function ChainKeyDepositPanel({ ledgerId }: { ledgerId: string }) {
  const t = useTranslations("chainKey")
  const { pendingBtcSats, btcFee, ethGas, checkDeposit } = useChainKeyStatus(ledgerId)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isBtc = ledgerId === CKBTC_LEDGER_ID

  const onCheck = async () => {
    setBusy(true)
    setError(null)
    setMessage(null)
    const err = await checkDeposit()
    setBusy(false)
    if (err) setError(err)
    else setMessage(t("checkDone"))
  }

  return (
    <div className="space-y-3 rounded-xl border border-border/40 bg-background/45 p-3 backdrop-blur-sm">
      {isBtc && pendingBtcSats !== undefined && pendingBtcSats > 0n ? (
        <p className="text-xs text-muted-foreground">
          {t("pendingBtc", {
            amount: formatTokenAmount(pendingBtcSats, 8, 8),
          })}
        </p>
      ) : null}

      {isBtc && btcFee ? (
        <p className="text-xs text-muted-foreground">
          {t("btcWithdrawFee", {
            minter: formatTokenAmount(btcFee.minterFee, 8, 4),
            network: formatTokenAmount(btcFee.bitcoinFee, 8, 8),
          })}
        </p>
      ) : null}

      {!isBtc && ethGas ? (
        <p className="text-xs text-muted-foreground">
          {t("ethGasFee", {
            gas: formatTokenAmount(ethGas.max_transaction_fee, 18, 6),
          })}
        </p>
      ) : null}

      {isBtc ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="w-full"
          disabled={busy}
          onClick={onCheck}
        >
          {busy ? <Spinner className="size-4" /> : t("checkDeposit")}
        </Button>
      ) : null}

      {message ? (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  )
}
