"use client"

import { useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { SuccessTick } from "@/components/ui/success-tick"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { useAuth } from "@/components/auth/auth-provider"
import { useApplyInternalTransfer, useTradeTokens } from "@/hooks/trade/useTrade"
import { internalTransferMax } from "@/lib/trade/fees"
import { tokensForInternalTransfer } from "@/lib/trade/transferableTokens"
import { playSuccessChime } from "@/lib/ui/successChime"
import { formatTokenAmount, parseTokenAmount, toPlainTokenAmount } from "@/lib/wallet/utils"
import { depositForTrade, withdrawFromTrade } from "@/services/trade/trade"
import { ICP_LEDGER_ID } from "@/services/tokens"
import { TokenAvatar } from "@/components/public/market/trade/token-avatar"
import { SwapTokenPicker } from "@/components/swap/swap-token-picker"
import { DirectionCard } from "@/components/withdraw/internal-transfer-direction"

export function InternalTransferForm() {
  const t = useTranslations("withdraw")
  const tc = useTranslations("common")
  const params = useSearchParams()
  const { identity } = useAuth()
  const applyTransfer = useApplyInternalTransfer()
  const { swapHoldings, tradeBalances, isLoading } = useTradeTokens()

  const [toWallet, setToWallet] = useState(true)
  const [ledgerId, setLedgerId] = useState(() => params.get("ledger") ?? "")
  const [amountText, setAmountText] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [doneAmount, setDoneAmount] = useState<bigint | null>(null)

  const listed = useMemo(
    () => tokensForInternalTransfer(swapHoldings, tradeBalances, toWallet),
    [swapHoldings, tradeBalances, toWallet]
  )

  const token = useMemo(() => {
    const selected = listed.find((item) => item.ledgerId === ledgerId)
    if (selected) return selected
    const fromUrl = listed.find((item) => item.ledgerId === (params.get("ledger") ?? ""))
    if (fromUrl) return fromUrl
    return listed.find((item) => item.ledgerId === ICP_LEDGER_ID) ?? listed[0] ?? null
  }, [listed, ledgerId, params])

  const walletBal =
    swapHoldings.find((item) => item.ledgerId === token?.ledgerId)?.balance ?? 0n
  const tradeBal = token ? (tradeBalances.get(token.ledgerId) ?? 0n) : 0n
  const available = toWallet ? tradeBal : walletBal
  const maxAmount = token
    ? internalTransferMax(toWallet, tradeBal, walletBal, token.fee)
    : 0n
  const amount = token ? parseTokenAmount(amountText, token.decimals) : null
  const canSubmit =
    Boolean(identity && token && amount && amount > 0n && amount <= maxAmount && !busy)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!identity || !token || amount == null || amount <= 0n || amount > maxAmount) return
    setBusy(true)
    setError(null)
    const result = toWallet
      ? await withdrawFromTrade(identity, token.ledgerId, amount)
      : await depositForTrade(identity, token.ledgerId, amount)
    setBusy(false)
    if ("err" in result) {
      setError(result.err)
      return
    }
    applyTransfer({
      ledgerId: token.ledgerId,
      amount,
      toWallet,
      ledgerFee: token.fee,
      tradeBefore: tradeBal,
      walletBefore: walletBal,
    })
    setDoneAmount(amount)
    playSuccessChime()
  }

  if (isLoading && swapHoldings.length === 0) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    )
  }

  if (doneAmount !== null && token) {
    return (
      <Empty className="border-0 bg-transparent py-6 shadow-none">
        <EmptyHeader>
          <SuccessTick size="sm" className="mb-1" />
          <EmptyTitle>{t("success")}</EmptyTitle>
          <EmptyDescription>
            {formatTokenAmount(doneAmount, token.decimals)} {token.symbol}
            {" · "}
            {toWallet ? t("trading") : t("wallet")} → {toWallet ? t("wallet") : t("trading")}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            variant="outline"
            onClick={() => {
              setDoneAmount(null)
              setAmountText("")
            }}
          >
            {tc("done")}
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  const fromLabel = toWallet ? t("trading") : t("wallet")
  const toLabel = toWallet ? t("wallet") : t("trading")

  function flipDirection() {
    setToWallet((value) => !value)
    setAmountText("")
    setError(null)
  }

  const direction = (
    <DirectionCard
      fromLabel={t("from")}
      toLabel={t("to")}
      fromValue={fromLabel}
      toValue={toLabel}
      toWallet={toWallet}
      flipLabel={t("flip")}
      onFlip={flipDirection}
    />
  )

  if (!token) {
    return (
      <div className="space-y-4">
        {direction}
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {direction}

      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        className="flex w-full items-center gap-3 rounded-2xl border border-border/70 px-4 py-3 text-left"
      >
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-muted-foreground">{t("coin")}</p>
          <div className="mt-1 flex items-center gap-2">
            <TokenAvatar
              symbol={token.symbol}
              ledgerId={token.ledgerId}
              logoUrl={token.logo}
              className="size-8"
            />
            <div className="min-w-0">
              <p className="font-semibold">{token.symbol}</p>
              <p className="truncate text-xs text-muted-foreground">{token.name}</p>
            </div>
          </div>
        </div>
        <HugeiconsIcon icon={ArrowRight01Icon} className="size-4 text-muted-foreground" />
      </button>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <Label htmlFor="internal-amount">{t("amount")}</Label>
          <span>
            {t("available")} {formatTokenAmount(available, token.decimals)} {token.symbol}
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-border/70 px-3 py-2">
          <Input
            id="internal-amount"
            inputMode="decimal"
            placeholder={t("min")}
            value={amountText}
            onChange={(event) => {
              setAmountText(event.target.value)
              setError(null)
            }}
            className="border-0 bg-transparent shadow-none focus-visible:ring-0"
          />
          <span className="text-sm font-medium text-muted-foreground">{token.symbol}</span>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={maxAmount <= 0n}
            onClick={() => setAmountText(toPlainTokenAmount(maxAmount, token.decimals))}
          >
            {tc("max")}
          </Button>
        </div>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" size="lg" className="w-full rounded-2xl" disabled={!canSubmit}>
        {busy ? t("sending") : t("confirm")}
      </Button>

      <SwapTokenPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        tokens={listed}
        selectedId={token.ledgerId}
        onSelect={(next) => {
          setLedgerId(next.ledgerId)
          setAmountText("")
          setError(null)
        }}
        title={t("coin")}
      />
    </form>
  )
}
