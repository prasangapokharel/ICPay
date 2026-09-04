"use client"

import { useEffect, useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { CyclesTopUpStepper } from "@/components/cycles/cycles-topup-stepper"
import {
  CyclesTopUpAlerts,
  type CyclesTopUpSuccess,
} from "@/components/cycles/cycles-topup-alerts"
import { CyclesFlowPreview } from "@/components/cycles/cycles-flow-preview"
import { CanisterIdField } from "@/components/canister/canister-id-field"
import { CanisterStatusPanel } from "@/components/canister/canister-status-panel"
import { useAuth } from "@/components/auth/auth-provider"
import { useCanisterStatus } from "@/hooks/canister/useCanisterStatus"
import { useLiveBalance, useRefreshWallet } from "@/hooks/wallet/useWalletData"
import { AmountInput } from "@/components/shared/amount-input"
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
  parseCanisterId,
  topUpFromWallet,
  verifyCanisterExists,
  walletCostForTopUp,
  walletShortfall,
  type TopUpFlowStep,
} from "@/services/cycles/topUp"

export function CyclesTopUpCard() {
  const t = useTranslations("cyclesTopUp")
  const { identity, isAuthenticated, isLoading, login } = useAuth()
  const walletBalance = useLiveBalance()
  const refreshWallet = useRefreshWallet()
  const [connecting, setConnecting] = useState(false)
  const [canisterId, setCanisterId] = useState("")
  const [amountText, setAmountText] = useState("")
  const [rate, setRate] = useState<bigint | null>(null)
  const [iiBalance, setIiBalance] = useState<bigint | null>(null)
  const [fee, setFee] = useState<bigint>(10_000n)
  const [loadingMeta, setLoadingMeta] = useState(false)
  const [canisterLookup, setCanisterLookup] = useState<{
    id: string
    status: "ok" | "missing"
  } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [flowStep, setFlowStep] = useState<TopUpFlowStep | null>(null)
  const [flowFailed, setFlowFailed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastOk, setLastOk] = useState<CyclesTopUpSuccess | null>(null)

  const amountE8s = useMemo(() => parseIcp(amountText), [amountText])
  const iiBal = iiBalance ?? 0n
  const shortfall = amountE8s != null ? walletShortfall(amountE8s, iiBal, fee) : 0n
  const walletCost = amountE8s != null ? walletCostForTopUp(amountE8s, iiBal, fee) : 0n
  const maxSpend =
    walletBalance != null ? maxTopUpAmount(walletBalance, iiBal, fee) : 0n
  const canisterTrimmed = canisterId.trim()

  const canisterParsedOk = useMemo(() => {
    if (!canisterTrimmed) return false
    try {
      parseCanisterId(canisterTrimmed)
      return true
    } catch {
      return false
    }
  }, [canisterTrimmed])

  const lookupStatus =
    canisterLookup?.id === canisterTrimmed ? canisterLookup.status : null

  const liveStatus = useCanisterStatus(
    identity,
    canisterTrimmed,
    Boolean(isAuthenticated && canisterParsedOk && lookupStatus !== "missing")
  )

  const canisterError = useMemo(() => {
    if (!canisterTrimmed) return null
    if (!canisterParsedOk) return t("invalidCanister")
    if (lookupStatus === "missing") return t("canisterNotFound")
    return null
  }, [canisterTrimmed, canisterParsedOk, lookupStatus, t])

  const estimatedCycles =
    amountE8s != null && rate != null ? estimateCyclesFromE8s(amountE8s, rate) : null

  const amountError = useMemo(() => {
    if (!amountText.trim()) return null
    if (amountE8s == null) return t("invalidAmount")
    if (amountE8s < MIN_TOPUP_E8S) return t("minAmount")
    if (amountE8s > MAX_TOPUP_E8S) return t("maxAmount")
    if (walletBalance != null && walletCost > walletBalance) return t("insufficient")
    return null
  }, [amountText, amountE8s, walletBalance, walletCost, t])

  const canSubmit =
    isAuthenticated &&
    !canisterError &&
    canisterId.trim().length > 0 &&
    amountError == null &&
    amountE8s != null &&
    !submitting

  useEffect(() => {
    let cancelled = false
    void (async () => {
      setLoadingMeta(true)
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
      } finally {
        if (!cancelled) setLoadingMeta(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [identity])

  useEffect(() => {
    if (!identity || !isAuthenticated) return
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
  }, [identity, isAuthenticated])

  useEffect(() => {
    if (!canisterParsedOk) return
    const id = canisterTrimmed
    let cancelled = false
    const timer = window.setTimeout(() => {
      void (async () => {
        const status = await verifyCanisterExists(id)
        if (cancelled || status === "unknown") return
        setCanisterLookup({ id, status })
      })()
    }, 400)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [canisterTrimmed, canisterParsedOk])

  const onConnect = async () => {
    setConnecting(true)
    try {
      await login()
    } finally {
      setConnecting(false)
    }
  }

  const onTopUp = async () => {
    if (!identity || amountE8s == null) return
    setSubmitting(true)
    setError(null)
    setLastOk(null)
    setFlowFailed(false)
    setFlowStep(shortfall > 0n ? "send" : "mint")
    try {
      const result = await topUpFromWallet(identity, canisterId, amountE8s, setFlowStep)
      rememberCanister(identity.getPrincipal().toText(), result.canisterId)
      const ok: CyclesTopUpSuccess = {
        cycles: formatCycles(result.cycles),
        block: result.blockIndex.toString(),
        canister: result.canisterId,
        withdrew: result.withdrewFromWallet,
        amount: formatAmount(amountE8s),
      }
      setLastOk(ok)
      refreshWallet()
      const bal = await fetchPrincipalIcpBalance(identity)
      setIiBalance(bal)
    } catch (e) {
      const msg = formatTopUpError(e) || t("failed")
      setError(msg)
      setFlowFailed(true)
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex w-full flex-col gap-8 lg:gap-10">
      <header className="flex flex-col gap-3 text-center lg:text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
          {t("eyebrow")}
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {t("title")}
        </h1>
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base lg:mx-0">
          {t("subtitle")}
        </p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)]">
        <Card className="gap-0">
          <CardHeader className="border-b pb-4">
            <CardTitle>{t("formTitle")}</CardTitle>
            <CardDescription>{t("formHint")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-5">
            <CyclesTopUpStepper flowStep={flowStep} failed={flowFailed} />

            <CanisterIdField
              id="canister-id"
              value={canisterId}
              onChange={(v) => {
                setCanisterId(v)
                setError(null)
              }}
              principal={isAuthenticated ? identity?.getPrincipal().toText() : null}
              disabled={submitting}
              error={canisterError}
              hint={!canisterError && lookupStatus === "ok" ? t("canisterOk") : null}
            />

            {isAuthenticated ? (
              <div className="space-y-2">
                <AmountInput
                  id="icp-amount"
                  label={t("amount")}
                  value={amountText}
                  onChange={(v) => {
                    setAmountText(v)
                    setError(null)
                  }}
                  balance={walletBalance}
                  maxE8s={maxSpend}
                />
                {amountText && amountError && (
                  <p className="text-xs text-destructive">{amountError}</p>
                )}
                {amountE8s != null && !amountError && (
                  <p className="text-xs text-muted-foreground">
                    {shortfall > 0n
                      ? t("flowHintSend", { amount: formatAmount(shortfall) })
                      : t("flowHintMintOnly")}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="icp-amount">{t("amount")}</Label>
                <Input
                  id="icp-amount"
                  inputMode="decimal"
                  value={amountText}
                  onChange={(e) => setAmountText(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            )}

            <div className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 lg:hidden">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">{t("estimate")}</p>
                  {loadingMeta && rate == null ? (
                    <Skeleton className="mt-1.5 h-7 w-36" />
                  ) : (
                    <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
                      {estimatedCycles != null ? `≈ ${formatCycles(estimatedCycles)}` : "—"}
                    </p>
                  )}
                </div>
                {rate != null && (
                  <span className="shrink-0 rounded-full border border-border/60 bg-background/60 px-2.5 py-1 text-[10px] font-medium tabular-nums text-muted-foreground">
                    {t("rateBadge", {
                      xdr: (Number(rate) / 10_000).toFixed(2),
                    })}
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">{t("estimateSource")}</p>
            </div>

            <CyclesTopUpAlerts
              error={error}
              lastOk={lastOk}
              onDismissSuccess={() => {
                setLastOk(null)
                setFlowStep(null)
                setFlowFailed(false)
              }}
            />

            <div className="space-y-3">
              {!isAuthenticated ? (
                <Button
                  type="button"
                  size="lg"
                  className="w-full"
                  disabled={isLoading || connecting}
                  onClick={() => void onConnect()}
                >
                  {connecting || isLoading ? t("connecting") : t("signIn")}
                </Button>
              ) : (
                <Button
                  type="button"
                  size="lg"
                  className="w-full"
                  disabled={!canSubmit}
                  onClick={() => void onTopUp()}
                >
                  {submitting
                    ? flowStep === "send"
                      ? t("sending")
                      : flowStep === "mint"
                        ? t("minting")
                        : t("toppingUp")
                    : t("topUp")}
                </Button>
              )}
              <p className="text-xs leading-relaxed text-muted-foreground">{t("disclaimer")}</p>
            </div>
          </CardContent>
        </Card>

        <div className="hidden space-y-4 lg:block">
          <CyclesFlowPreview
            title={t("previewTitle")}
            loading={loadingMeta && rate == null}
            highlight={{
              label:
                liveStatus.kind === "ok" ? t("previewLiveCycles") : t("estimate"),
              value:
                liveStatus.kind === "ok"
                  ? liveStatus.data.cyclesLabel
                  : estimatedCycles != null
                    ? `≈ ${formatCycles(estimatedCycles)}`
                    : "—",
            }}
            rows={[
              {
                label: t("canisterId"),
                value: canisterTrimmed || "—",
                mono: true,
              },
              {
                label: t("amount"),
                value: amountE8s != null ? `${formatAmount(amountE8s)} ICP` : "—",
              },
              {
                label: t("previewRate"),
                value:
                  rate != null
                    ? t("rateBadge", { xdr: (Number(rate) / 10_000).toFixed(2) })
                    : "—",
              },
              {
                label: t("previewStatus"),
                value:
                  flowStep === "send"
                    ? t("sending")
                    : flowStep === "mint"
                      ? t("minting")
                      : flowStep === "done"
                        ? t("stepDone")
                        : liveStatus.kind === "ok"
                          ? t(`runStatus.${liveStatus.data.runStatus}`)
                          : liveStatus.kind === "denied"
                            ? t("previewNoController")
                            : liveStatus.kind === "loading"
                              ? t("previewLoadingStatus")
                              : t("previewReady"),
              },
              {
                label: t("estimate"),
                value:
                  estimatedCycles != null ? `≈ ${formatCycles(estimatedCycles)}` : "—",
              },
            ]}
          />
          {(liveStatus.kind === "ok" ||
            liveStatus.kind === "denied" ||
            liveStatus.kind === "loading") && (
            <Card className="gap-0">
              <CardHeader className="border-b pb-3">
                <CardTitle className="text-base">{t("liveStatusTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <CanisterStatusPanel state={liveStatus} compact />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
