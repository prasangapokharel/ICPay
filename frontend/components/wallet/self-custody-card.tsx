"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatTokenAmount } from "@/lib/wallet/utils"
import { sweepToCustody } from "@/services/sweep/sweep"
import { useAuth } from "@/components/auth/auth-provider"
import { useDepositAddress, useRefreshWallet } from "@/hooks/wallet/useWalletData"
import type { TokenHolding } from "@/services/tokens"

export function SelfCustodyCard({
  token,
  balance,
}: {
  token: TokenHolding
  balance: bigint
}) {
  const t = useTranslations("token")
  const tc = useTranslations("common")
  const { identity } = useAuth()
  const { data: deposit } = useDepositAddress()
  const refreshWallet = useRefreshWallet()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [moved, setMoved] = useState(false)

  // The fee is charged on top of the amount, so the whole balance can never be
  // sent -- and a balance at or below the fee cannot move at all.
  const net = balance > token.fee ? balance - token.fee : 0n
  const full = (v: bigint) => formatTokenAmount(v, token.decimals, token.decimals)

  const handleSweep = async () => {
    // Without the custodian the destination is unknown, and guessing it would
    // send real funds to an account nobody controls.
    if (!deposit) return
    setLoading(true)
    setError(null)

    const result = await sweepToCustody(identity, token.ledgerId, deposit.address.owner, net)

    if ("err" in result) {
      setError(result.err)
      setLoading(false)
      return
    }

    setMoved(true)
    setLoading(false)
    refreshWallet()
  }

  if (moved) {
    return (
      <Alert>
        <AlertDescription>{t("selfCustodyMoved")}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div
      className={`space-y-3 rounded-2xl border p-4 ${
        net > 0n ? "border-amber-500/40 bg-amber-500/5" : "bg-muted/30"
      }`}
    >
      <div className="space-y-1">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-sm font-semibold">{t("selfCustodyTitle")}</h3>
          <span className="shrink-0 text-sm tabular-nums">
            {full(balance)} {token.symbol}
          </span>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {balance === 0n
            ? t("selfCustodyEmpty")
            : t("selfCustodyBody", { amount: full(balance), symbol: token.symbol })}
        </p>
      </div>

      {net > 0n ? (
        <>
          <div className="space-y-1.5 rounded-xl bg-background/60 p-3">
            <Row label={tc("fee")} value={`${full(token.fee)} ${token.symbol}`} />
            <Row
              label={t("selfCustodyNet")}
              value={`${full(net)} ${token.symbol}`}
              emphasis
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button className="w-full" onClick={handleSweep} disabled={loading || !deposit}>
            {loading && <Spinner className="size-4" />}
            {loading ? t("selfCustodyMoving") : t("selfCustodyMove")}
          </Button>
        </>
      ) : (
        balance > 0n && (
          <p className="text-xs text-muted-foreground">
            {t("selfCustodyDust", { symbol: token.symbol })}
          </p>
        )
      )}
    </div>
  )
}

function Row({
  label,
  value,
  emphasis,
}: {
  label: string
  value: string
  emphasis?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className={`break-all text-right ${emphasis ? "font-semibold tabular-nums" : "tabular-nums"}`}>
        {value}
      </span>
    </div>
  )
}
