"use client"

import { useEffect, useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { FuelIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AmountInput } from "@/components/shared/amount-input"
import { CanisterSuccessDialog } from "@/components/canister/canister-success-dialog"
import { useAuth } from "@/components/auth/auth-provider"
import { useLiveBalance, useRefreshWallet } from "@/hooks/wallet/useWalletData"
import { formatAmount, parseIcp } from "@/lib/wallet/utils"
import { rememberCanister } from "@/lib/canister/savedCanisters"
import {
  estimateCyclesFromE8s,
  fetchCmcXdrPermyriad,
  fetchIcpTransferFee,
  fetchPrincipalIcpBalance,
  formatCycles,
  formatTopUpError,
  maxTopUpAmount,
  MAX_TOPUP_E8S,
  MIN_TOPUP_E8S,
  topUpFromWallet,
  walletCostForTopUp,
  walletShortfall,
  type TopUpFlowStep,
} from "@/services/cycles/topUp"

export function MyCanisterTopupDialog({
  open,
  onOpenChange,
  canisterId,
  onDone,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  canisterId: string
  onDone?: () => void
}) {
  const t = useTranslations("myCanisters")
  const tt = useTranslations("cyclesTopUp")
  const { identity, isAuthenticated } = useAuth()
  const walletBalance = useLiveBalance()
  const refreshWallet = useRefreshWallet()
  const [amountText, setAmountText] = useState("")
  const [rate, setRate] = useState<bigint | null>(null)
  const [iiBalance, setIiBalance] = useState<bigint | null>(null)
  const [fee, setFee] = useState(10_000n)
  const [submitting, setSubmitting] = useState(false)
  const [flowStep, setFlowStep] = useState<TopUpFlowStep | null>(null)
  const [success, setSuccess] = useState<{ cycles: string; amount: string } | null>(null)

  const amountE8s = useMemo(() => parseIcp(amountText), [amountText])
  const iiBal = iiBalance ?? 0n
  const shortfall = amountE8s != null ? walletShortfall(amountE8s, iiBal, fee) : 0n
  const walletCost = amountE8s != null ? walletCostForTopUp(amountE8s, iiBal, fee) : 0n
  const maxSpend =
    walletBalance != null ? maxTopUpAmount(walletBalance, iiBal, fee) : 0n
  const estimated =
    amountE8s != null && rate != null ? estimateCyclesFromE8s(amountE8s, rate) : null

  const amountError = useMemo(() => {
    if (!amountText.trim()) return null
    if (amountE8s == null) return tt("invalidAmount")
    if (amountE8s < MIN_TOPUP_E8S) return tt("minAmount")
    if (amountE8s > MAX_TOPUP_E8S) return tt("maxAmount")
    if (walletBalance != null && walletCost > walletBalance) return tt("insufficient")
    return null
  }, [amountText, amountE8s, walletBalance, walletCost, tt])

  useEffect(() => {
    if (!open) return
    setAmountText("")
    setSuccess(null)
    setFlowStep(null)
    let cancelled = false
    void (async () => {
      try {
        const [r, f] = await Promise.all([
          fetchCmcXdrPermyriad(identity),
          fetchIcpTransferFee(identity),
        ])
        if (!cancelled) {
          setRate(r)
          setFee(f)
        }
      } catch {
        if (!cancelled) setRate(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open, identity])

  useEffect(() => {
    if (!open || !identity || !isAuthenticated) return
    let cancelled = false
    void (async () => {
      try {
        const bal = await fetchPrincipalIcpBalance(identity)
        if (!cancelled) setIiBalance(bal)
      } catch {
        if (!cancelled) setIiBalance(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open, identity, isAuthenticated])

  const onConfirm = async () => {
    if (!identity || amountE8s == null) return
    setSubmitting(true)
    setFlowStep(shortfall > 0n ? "send" : "mint")
    try {
      const result = await topUpFromWallet(identity, canisterId, amountE8s, setFlowStep)
      rememberCanister(identity.getPrincipal().toText(), result.canisterId)
      refreshWallet()
      setIiBalance(await fetchPrincipalIcpBalance(identity))
      setSuccess({
        cycles: formatCycles(result.cycles),
        amount: formatAmount(amountE8s),
      })
      onDone?.()
    } catch (e) {
      toast.error(formatTopUpError(e) || tt("failed"))
    } finally {
      setSubmitting(false)
      setFlowStep(null)
    }
  }

  return (
    <>
      <Dialog
        open={open && success == null}
        onOpenChange={(next) => {
          if (!submitting) onOpenChange(next)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={FuelIcon} className="size-4 text-primary" />
              {t("topUpTitle")}
            </DialogTitle>
            <DialogDescription>{t("topUpHint")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <p className="break-all font-mono text-[11px] text-muted-foreground">{canisterId}</p>
            <AmountInput
              id="mine-topup-amount"
              label={tt("amount")}
              value={amountText}
              onChange={setAmountText}
              balance={walletBalance}
              maxE8s={maxSpend}
            />
            {amountError ? (
              <p className="text-xs text-destructive">{amountError}</p>
            ) : estimated != null ? (
              <div className="rounded-xl border border-border/60 bg-muted/25 px-3 py-3">
                <p className="text-xs font-medium text-muted-foreground">
                  {t("topUpEstimateLabel")}
                </p>
                <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums text-foreground">
                  ≈ {formatCycles(estimated)}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">{t("topUpEstimateHint")}</p>
              </div>
            ) : null}
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => onOpenChange(false)}
            >
              {t("topUpCancel")}
            </Button>
            <Button
              type="button"
              disabled={
                !isAuthenticated ||
                submitting ||
                amountE8s == null ||
                amountError != null
              }
              onClick={() => void onConfirm()}
            >
              {submitting
                ? flowStep === "send"
                  ? tt("sending")
                  : tt("toppingUp")
                : t("topUpConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CanisterSuccessDialog
        open={success != null}
        onClose={() => {
          setSuccess(null)
          onOpenChange(false)
        }}
        title={tt("successTitle")}
        highlight={
          success ? (
            <p className="mt-1 mb-2 text-3xl font-bold tracking-tight tabular-nums">
              {success.cycles}{" "}
              <span className="text-lg font-semibold text-muted-foreground">
                {tt("cyclesUnit")}
              </span>
            </p>
          ) : null
        }
        monoId={canisterId}
        detail={
          success ? (
            <p className="text-sm text-muted-foreground">
              {tt("amountPaid")}: {success.amount} ICP
            </p>
          ) : null
        }
      />
    </>
  )
}
