"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import useSWR from "swr"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDataTransferHorizontalIcon } from "@hugeicons/core-free-icons"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { SuccessTick } from "@/components/ui/success-tick"
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/auth/auth-provider"
import { useApplyInternalTransfer, tradeBalanceKey } from "@/hooks/trade/useTrade"
import { useTokenHolding } from "@/hooks/wallet/useWalletData"
import { maxTradeInput } from "@/lib/trade/fees"
import { tradePairPath } from "@/lib/market/pairSlug"
import { playSuccessChime } from "@/lib/ui/successChime"
import { cn } from "@/lib/ui/utils"
import { formatTokenAmount, parseTokenAmount, toPlainTokenAmount } from "@/lib/wallet/utils"
import { depositForTrade, getTradingBalance, withdrawFromTrade } from "@/services/trade/trade"
import type { TradePairSnapshot } from "@/services/market/tradePairSnapshot"

export function TradeWalletDialog({
  open,
  onOpenChange,
  snapshot,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  snapshot: TradePairSnapshot | null
}) {
  const t = useTranslations("marketTrade")
  const tc = useTranslations("common")
  const { identity, isAuthenticated } = useAuth()
  const applyTransfer = useApplyInternalTransfer()

  const tokens = useMemo(() => {
    if (!snapshot) return []
    const list = [snapshot.base, snapshot.quote]
    return list.filter((tok, i) => list.findIndex((x) => x.ledgerId === tok.ledgerId) === i)
  }, [snapshot])

  const [pickedLedger, setPickedLedger] = useState<string | null>(null)
  const [toWallet, setToWallet] = useState(true)
  const [amountText, setAmountText] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [doneAmount, setDoneAmount] = useState(0n)

  function handleOpenChange(next: boolean) {
    if (!next) {
      setPickedLedger(null)
      setToWallet(true)
      setAmountText("")
      setBusy(false)
      setError(null)
      setDone(false)
      setDoneAmount(0n)
    }
    onOpenChange(next)
  }

  const ledgerId =
    pickedLedger && tokens.some((tok) => tok.ledgerId === pickedLedger)
      ? pickedLedger
      : snapshot?.baseLedgerId ?? ""

  const token = tokens.find((tok) => tok.ledgerId === ledgerId) ?? tokens[0]
  const { token: holding } = useTokenHolding(token?.ledgerId ?? null)
  const { data: tradeBal } = useSWR(
    identity && token ? tradeBalanceKey(identity, token.ledgerId) : null,
    () => getTradingBalance(identity, token!.ledgerId),
    { revalidateOnFocus: false, dedupingInterval: 8_000 }
  )

  const available = toWallet ? (tradeBal ?? 0n) : (holding?.balance ?? 0n)
  const maxAmount = toWallet ? available : maxTradeInput(available, token?.fee ?? 0n)
  const amount = token ? parseTokenAmount(amountText, token.decimals) : null
  const loginHref = snapshot
    ? `/login?next=${encodeURIComponent(tradePairPath(snapshot.base.symbol))}`
    : "/login"

  async function submit() {
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
      tradeBefore: tradeBal ?? 0n,
      walletBefore: holding?.balance ?? 0n,
    })
    setDoneAmount(amount)
    setDone(true)
    playSuccessChime()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm" showCloseButton={!done}>
        {done && token ? (
          <div className="flex flex-col items-center gap-4 py-2 text-center">
            <SuccessTick size="sm" />
            <div className="space-y-1.5">
              <p className="text-lg font-semibold tracking-tight">{t("transferSuccess")}</p>
              <p className="text-sm text-muted-foreground">
                {formatTokenAmount(doneAmount, token.decimals)} {token.symbol}
                {" · "}
                {toWallet ? t("tradingAccount") : t("mainWallet")} →{" "}
                {toWallet ? t("mainWallet") : t("tradingAccount")}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => handleOpenChange(false)}>
              {tc("done")}
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t("transfer")}</DialogTitle>
              <DialogDescription>{t("transferHint")}</DialogDescription>
            </DialogHeader>
            <FieldGroup className="gap-4">
              <div className="flex items-stretch gap-2">
                <AccountBox label={t("from")} value={toWallet ? t("tradingAccount") : t("mainWallet")} />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="mt-4 shrink-0"
                  onClick={() => {
                    setToWallet((v) => !v)
                    setAmountText("")
                    setError(null)
                  }}
                >
                  <HugeiconsIcon
                    icon={ArrowDataTransferHorizontalIcon}
                    className="size-4 rotate-90"
                    strokeWidth={2}
                  />
                </Button>
                <AccountBox label={t("to")} value={toWallet ? t("mainWallet") : t("tradingAccount")} />
              </div>
              <div className="flex gap-1.5">
                {tokens.map((tok) => (
                  <button
                    key={tok.ledgerId}
                    type="button"
                    className={cn(
                      "h-8 rounded-full px-3 text-xs font-medium",
                      tok.ledgerId === token?.ledgerId
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                    onClick={() => {
                      setPickedLedger(tok.ledgerId)
                      setAmountText("")
                      setError(null)
                    }}
                  >
                    {tok.symbol}
                  </button>
                ))}
              </div>
              <Field>
                <div className="flex items-center justify-between">
                  <Label htmlFor="transfer-amount">{t("amountLabel")}</Label>
                  <button
                    type="button"
                    className="text-xs font-medium text-primary"
                    disabled={maxAmount <= 0n || !token}
                    onClick={() => token && setAmountText(toPlainTokenAmount(maxAmount, token.decimals))}
                  >
                    {tc("max")}
                  </button>
                </div>
                <Input
                  id="transfer-amount"
                  inputMode="decimal"
                  placeholder="0"
                  value={amountText}
                  onChange={(e) => {
                    setAmountText(e.target.value)
                    setError(null)
                  }}
                />
                <FieldDescription>
                  {t("balance")}{" "}
                  {token ? `${formatTokenAmount(available, token.decimals)} ${token.symbol}` : "—"}
                </FieldDescription>
              </Field>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
            </FieldGroup>
            <DialogFooter>
              <DialogClose render={<Button variant="outline">{tc("cancel")}</Button>} />
              {isAuthenticated ? (
                <Button
                  disabled={busy || !token || amount == null || amount <= 0n || amount > maxAmount}
                  onClick={() => void submit()}
                >
                  {busy ? "…" : t("transfer")}
                </Button>
              ) : (
                <Link href={loginHref} className={cn(buttonVariants(), "w-full sm:w-auto")}>
                  {t("signIn")}
                </Link>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function AccountBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 flex-1 rounded-2xl border border-border/60 bg-muted/30 px-3 py-2">
      <p className="text-[10px] tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="truncate text-sm font-medium">{value}</p>
    </div>
  )
}
