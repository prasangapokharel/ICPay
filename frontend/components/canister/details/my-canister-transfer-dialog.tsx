"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { SentIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CanisterIdField } from "@/components/canister/canister-id-field"
import { CanisterSuccessDialog } from "@/components/canister/canister-success-dialog"
import { useAuth } from "@/components/auth/auth-provider"
import { cyclesToTInput, parseCyclesT } from "@/lib/canister/format"
import { rememberCanister } from "@/lib/canister/savedCanisters"
import {
  fetchCyclesLedgerBalance,
  formatCycles,
  formatMintError,
  withdrawCyclesToCanister,
} from "@/services/canister/cyclesWallet"
import { parseCanisterId } from "@/services/cycles/topUp"

export function MyCanisterTransferDialog({
  open,
  onOpenChange,
  fromCanisterId,
  onDone,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  fromCanisterId: string
  onDone?: () => void
}) {
  const t = useTranslations("myCanisters")
  const tw = useTranslations("canisterCycles")
  const { identity, isAuthenticated } = useAuth()
  const [toId, setToId] = useState("")
  const [amountText, setAmountText] = useState("")
  const [ledgerBal, setLedgerBal] = useState<bigint | null>(null)
  const [loadingBal, setLoadingBal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<{ cycles: string; to: string } | null>(null)

  const amount = useMemo(() => parseCyclesT(amountText), [amountText])
  const availableT = ledgerBal != null ? cyclesToTInput(ledgerBal) : null

  const amountError = useMemo(() => {
    if (!amountText.trim()) return null
    if (amount == null) return tw("invalidCycles")
    if (amount <= 0n) return tw("invalidCycles")
    if (ledgerBal != null && amount > ledgerBal) return tw("insufficientCycles")
    return null
  }, [amountText, amount, ledgerBal, tw])

  const toError = useMemo(() => {
    if (!toId.trim()) return null
    try {
      parseCanisterId(toId)
      return null
    } catch {
      return t("invalidId")
    }
  }, [toId, t])

  useEffect(() => {
    if (!open) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToId("")
    setAmountText("")
    setSuccess(null)
    if (!identity || !isAuthenticated) {
      setLedgerBal(null)
      return
    }
    let cancelled = false
    setLoadingBal(true)
    void (async () => {
      try {
        const bal = await fetchCyclesLedgerBalance(identity)
        if (!cancelled) setLedgerBal(bal)
      } catch {
        if (!cancelled) setLedgerBal(null)
      } finally {
        if (!cancelled) setLoadingBal(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open, identity, isAuthenticated])

  const onConfirm = async () => {
    if (!identity || amount == null || toError) return
    setSubmitting(true)
    try {
      const result = await withdrawCyclesToCanister(identity, toId, amount)
      rememberCanister(identity.getPrincipal().toText(), result.canisterId)
      setLedgerBal(await fetchCyclesLedgerBalance(identity))
      setSuccess({
        cycles: formatCycles(result.amount),
        to: result.canisterId,
      })
      onDone?.()
    } catch (e) {
      toast.error(formatMintError(e))
    } finally {
      setSubmitting(false)
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
          <DialogHeader className="gap-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <HugeiconsIcon icon={SentIcon} className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">{t("transferTitle")}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                {t("transferHint")}
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <p className="text-xs text-muted-foreground">
              {t("transferFromContext")}:{" "}
              <span className="break-all font-mono text-foreground/80">{fromCanisterId}</span>
            </p>

            <CanisterIdField
              id="transfer-to-canister"
              value={toId}
              onChange={setToId}
              principal={isAuthenticated ? identity?.getPrincipal().toText() : null}
              disabled={submitting}
              error={toError}
            />

            <div className="space-y-2">
              <div className="flex items-end justify-between gap-2">
                <Label htmlFor="transfer-cycles">{t("transferAmount")}</Label>
                {ledgerBal != null && (
                  <p className="text-xs tabular-nums text-muted-foreground">
                    {tw("availableCycles", {
                      pretty: formatCycles(ledgerBal),
                      tAmount: availableT ?? "0",
                    })}
                  </p>
                )}
              </div>
              <div className="relative">
                <Input
                  id="transfer-cycles"
                  inputMode="decimal"
                  size="lg"
                  value={amountText}
                  onChange={(e) => setAmountText(e.target.value)}
                  placeholder={availableT && availableT !== "0" ? availableT : "0.00"}
                  disabled={submitting}
                  className="pr-16"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  className="absolute top-1/2 right-1.5 -translate-y-1/2 text-primary"
                  disabled={ledgerBal == null || ledgerBal <= 0n || submitting}
                  onClick={() => {
                    if (ledgerBal != null) setAmountText(cyclesToTInput(ledgerBal))
                  }}
                >
                  {tw("max")}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">{tw("cyclesHint")}</p>
              {amountError ? (
                <p className="text-xs font-medium text-destructive">{amountError}</p>
              ) : null}
              {!loadingBal && ledgerBal === 0n ? (
                <p className="text-xs text-muted-foreground">
                  {t("transferLedgerEmpty")}{" "}
                  <Link
                    href="/canister/cycles"
                    className="font-medium text-foreground underline underline-offset-2"
                  >
                    {t("transferMintLink")}
                  </Link>
                </p>
              ) : null}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose
              render={
                <Button variant="outline" disabled={submitting}>
                  {t("transferCancel")}
                </Button>
              }
            />
            <Button
              type="button"
              disabled={
                !isAuthenticated ||
                submitting ||
                amount == null ||
                amountError != null ||
                !toId.trim() ||
                toError != null ||
                ledgerBal === 0n
              }
              onClick={() => void onConfirm()}
            >
              {submitting ? t("transferring") : t("transferConfirm")}
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
        title={t("transferSuccessTitle")}
        highlight={
          success ? (
            <p className="mt-1 mb-2 text-3xl font-bold tracking-tight tabular-nums">
              {success.cycles}{" "}
              <span className="text-lg font-semibold text-muted-foreground">
                {tw("cyclesUnit")}
              </span>
            </p>
          ) : null
        }
        monoId={success?.to}
        detail={
          success ? (
            <p className="text-sm text-muted-foreground">{t("transferSuccessBody")}</p>
          ) : null
        }
      />
    </>
  )
}
