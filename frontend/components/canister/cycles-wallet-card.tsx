"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { LinkSquare02Icon, ZapIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CanisterSuccessDialog } from "@/components/canister/canister-success-dialog"
import { CyclesFlowPreview } from "@/components/cycles/cycles-flow-preview"
import { AmountInput } from "@/components/shared/amount-input"
import { CanisterIdField } from "@/components/canister/canister-id-field"
import { useAuth } from "@/components/auth/auth-provider"
import { useLiveBalance, useRefreshWallet } from "@/hooks/wallet/useWalletData"
import { formatAmount, parseIcp } from "@/lib/wallet/utils"
import { cyclesToTInput, parseCyclesT } from "@/lib/canister/format"
import { rememberCanister } from "@/lib/canister/savedCanisters"
import {
  estimateCyclesFromE8s,
  fetchCmcXdrPermyriad,
  fetchCyclesLedgerBalance,
  fetchIcpTransferFee,
  fetchPrincipalIcpBalance,
  formatCycles,
  formatMintError,
  MAX_MINT_E8S,
  MIN_MINT_E8S,
  mintCyclesFromWallet,
  walletCostForTopUp,
  walletShortfall,
  withdrawCyclesToCanister,
  type MintFlowStep,
} from "@/services/canister/cyclesWallet"
import { maxTopUpAmount, parseCanisterId } from "@/services/cycles/topUp"

type CyclesOk =
  | { kind: "mint"; cycles: string }
  | { kind: "withdraw"; cycles: string; canister: string }

export function CyclesWalletCard() {
  const t = useTranslations("canisterCycles")
  const { identity, isAuthenticated, isLoading, login } = useAuth()
  const walletBalance = useLiveBalance()
  const refreshWallet = useRefreshWallet()
  const [connecting, setConnecting] = useState(false)
  const [tab, setTab] = useState("mint")
  const [amountText, setAmountText] = useState("")
  const [withdrawText, setWithdrawText] = useState("")
  const [canisterId, setCanisterId] = useState("")
  const [rate, setRate] = useState<bigint | null>(null)
  const [iiBalance, setIiBalance] = useState<bigint | null>(null)
  const [cyclesBal, setCyclesBal] = useState<bigint | null>(null)
  const [fee, setFee] = useState(10_000n)
  const [loadingMeta, setLoadingMeta] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [flowStep, setFlowStep] = useState<MintFlowStep | null>(null)
  const [lastOk, setLastOk] = useState<CyclesOk | null>(null)

  const amountE8s = useMemo(() => parseIcp(amountText), [amountText])
  const withdrawCycles = useMemo(() => parseCyclesT(withdrawText), [withdrawText])
  const iiBal = iiBalance ?? 0n
  const shortfall = amountE8s != null ? walletShortfall(amountE8s, iiBal, fee) : 0n
  const walletCost = amountE8s != null ? walletCostForTopUp(amountE8s, iiBal, fee) : 0n
  const maxSpend =
    walletBalance != null ? maxTopUpAmount(walletBalance, iiBal, fee) : 0n
  const estimated =
    amountE8s != null && rate != null ? estimateCyclesFromE8s(amountE8s, rate) : null
  const availableT = cyclesBal != null ? cyclesToTInput(cyclesBal) : null

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
        const [icp, cycles] = await Promise.all([
          fetchPrincipalIcpBalance(identity),
          fetchCyclesLedgerBalance(identity),
        ])
        if (!cancelled) {
          setIiBalance(icp)
          setCyclesBal(cycles)
        }
      } catch {
        if (!cancelled) {
          setIiBalance(null)
          setCyclesBal(null)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [identity, isAuthenticated])

  const mintError = useMemo(() => {
    if (!amountText.trim()) return null
    if (amountE8s == null) return t("invalidAmount")
    if (amountE8s < MIN_MINT_E8S) return t("minAmount")
    if (amountE8s > MAX_MINT_E8S) return t("maxAmount")
    if (walletBalance != null && walletCost > walletBalance) return t("insufficient")
    return null
  }, [amountText, amountE8s, walletBalance, walletCost, t])

  const withdrawError = useMemo(() => {
    if (!withdrawText.trim() && !canisterId.trim()) return null
    try {
      if (canisterId.trim()) parseCanisterId(canisterId)
    } catch {
      return t("invalidCanister")
    }
    if (withdrawText.trim() && withdrawCycles == null) return t("invalidCycles")
    if (withdrawCycles != null && cyclesBal != null && withdrawCycles > cyclesBal) {
      return t("insufficientCycles")
    }
    return null
  }, [withdrawText, canisterId, withdrawCycles, cyclesBal, t])

  const onMint = async () => {
    if (!identity || amountE8s == null) return
    setSubmitting(true)
    setFlowStep(shortfall > 0n ? "send" : "mint")
    try {
      const result = await mintCyclesFromWallet(identity, amountE8s, setFlowStep)
      refreshWallet()
      setCyclesBal(result.balance)
      setIiBalance(await fetchPrincipalIcpBalance(identity))
      setAmountText("")
      setLastOk({ kind: "mint", cycles: formatCycles(result.minted) })
    } catch (e) {
      toast.error(formatMintError(e))
    } finally {
      setSubmitting(false)
      setFlowStep(null)
    }
  }

  const onWithdraw = async () => {
    if (!identity || withdrawCycles == null) return
    setSubmitting(true)
    try {
      const result = await withdrawCyclesToCanister(identity, canisterId, withdrawCycles)
      rememberCanister(identity.getPrincipal().toText(), result.canisterId)
      setCyclesBal(await fetchCyclesLedgerBalance(identity))
      setWithdrawText("")
      setLastOk({
        kind: "withdraw",
        cycles: formatCycles(result.amount),
        canister: result.canisterId,
      })
    } catch (e) {
      toast.error(formatMintError(e))
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
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="w-full">
                <TabsTrigger value="mint" className="flex-1">
                  {t("tabMint")}
                </TabsTrigger>
                <TabsTrigger value="withdraw" className="flex-1">
                  {t("tabWithdraw")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="mint" className="mt-5 space-y-4">
                {isAuthenticated ? (
                  <AmountInput
                    id="mint-icp"
                    label={t("amount")}
                    value={amountText}
                    onChange={setAmountText}
                    balance={walletBalance}
                    maxE8s={maxSpend}
                  />
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="mint-icp">{t("amount")}</Label>
                    <Input
                      id="mint-icp"
                      inputMode="decimal"
                      value={amountText}
                      onChange={(e) => setAmountText(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                )}
                {mintError && <p className="text-xs text-destructive">{mintError}</p>}
                {!isAuthenticated ? (
                  <Button
                    size="lg"
                    className="w-full"
                    disabled={isLoading || connecting}
                    onClick={() => {
                      setConnecting(true)
                      void login().finally(() => setConnecting(false))
                    }}
                  >
                    {connecting || isLoading ? t("connecting") : t("signIn")}
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="w-full"
                    disabled={submitting || amountE8s == null || mintError != null}
                    onClick={() => void onMint()}
                  >
                    {submitting
                      ? flowStep === "send"
                        ? t("sending")
                        : t("minting")
                      : t("mint")}
                  </Button>
                )}
              </TabsContent>

              <TabsContent value="withdraw" className="mt-5 space-y-4">
                <CanisterIdField
                  id="withdraw-canister"
                  value={canisterId}
                  onChange={setCanisterId}
                  principal={isAuthenticated ? identity?.getPrincipal().toText() : null}
                  disabled={submitting}
                />
                <div className="space-y-2">
                  <div className="flex items-end justify-between gap-2">
                    <Label htmlFor="withdraw-cycles">{t("cyclesAmount")}</Label>
                    {cyclesBal != null && (
                      <p className="text-[11px] tabular-nums text-muted-foreground">
                        {t("availableCycles", {
                          pretty: formatCycles(cyclesBal),
                          tAmount: availableT ?? "0",
                        })}
                      </p>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="withdraw-cycles"
                      inputMode="decimal"
                      value={withdrawText}
                      onChange={(e) => setWithdrawText(e.target.value)}
                      placeholder={availableT && availableT !== "0" ? availableT : "0.00"}
                      className="pr-16"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      className="absolute top-1/2 right-1.5 -translate-y-1/2 text-primary"
                      disabled={cyclesBal == null || cyclesBal <= 0n}
                      onClick={() => {
                        if (cyclesBal != null) setWithdrawText(cyclesToTInput(cyclesBal))
                      }}
                    >
                      {t("max")}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">{t("cyclesHint")}</p>
                </div>
                {withdrawError && <p className="text-xs text-destructive">{withdrawError}</p>}
                <Button
                  size="lg"
                  className="w-full"
                  disabled={
                    !isAuthenticated ||
                    submitting ||
                    withdrawCycles == null ||
                    !canisterId.trim() ||
                    withdrawError != null
                  }
                  onClick={() => void onWithdraw()}
                >
                  {submitting ? t("withdrawing") : t("withdraw")}
                </Button>
              </TabsContent>
            </Tabs>
            <p className="text-xs leading-relaxed text-muted-foreground">{t("disclaimer")}</p>
          </CardContent>
        </Card>

        <CyclesFlowPreview
          className="hidden lg:flex"
          title={t("previewTitle")}
          loading={loadingMeta && rate == null}
          highlight={{
            label: t("ledgerBalance"),
            value: cyclesBal != null ? formatCycles(cyclesBal) : "—",
          }}
          rows={[
            {
              label: t("estimate"),
              value: estimated != null ? `≈ ${formatCycles(estimated)}` : "—",
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
          ]}
        />
        <div className="rounded-xl border border-border/60 bg-muted/30 px-3 py-3 lg:hidden">
          <p className="text-xs text-muted-foreground">{t("ledgerBalance")}</p>
          {cyclesBal == null && isAuthenticated ? (
            <Skeleton className="mt-1.5 h-7 w-28" />
          ) : (
            <p className="mt-1 text-xl font-semibold tabular-nums">
              {cyclesBal != null ? formatCycles(cyclesBal) : "—"}
            </p>
          )}
        </div>
      </div>

      <CanisterSuccessDialog
        open={lastOk != null}
        onClose={() => setLastOk(null)}
        title={lastOk?.kind === "withdraw" ? t("successWithdrawTitle") : t("successMintTitle")}
        highlight={
          lastOk ? (
            <p className="mt-1 mb-2 text-3xl font-bold tracking-tight tabular-nums text-foreground">
              {lastOk.cycles}{" "}
              <span className="text-lg font-semibold text-muted-foreground">
                {t("cyclesUnit")}
              </span>
            </p>
          ) : null
        }
        monoId={lastOk?.kind === "withdraw" ? lastOk.canister : null}
        detail={
          lastOk?.kind === "mint" ? (
            <p className="text-xs text-muted-foreground">{t("successMintHint")}</p>
          ) : lastOk?.kind === "withdraw" ? (
            <p className="text-xs text-muted-foreground">{t("successWithdrawHint")}</p>
          ) : null
        }
        actions={
          lastOk?.kind === "withdraw" ? (
            <>
              <Button
                type="button"
                variant="secondary"
                className="w-full flex-1 gap-1.5"
                nativeButton={false}
                render={<Link href="/canister" />}
              >
                <HugeiconsIcon icon={ZapIcon} className="size-3.5" />
                {t("viewMine")}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full flex-1 gap-1.5"
                nativeButton={false}
                render={
                  <a
                    href={`https://dashboard.internetcomputer.org/canister/${lastOk.canister}`}
                    target="_blank"
                    rel="noreferrer"
                  />
                }
              >
                <HugeiconsIcon icon={LinkSquare02Icon} className="size-3.5" />
                {t("viewOnDashboard")}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="secondary"
              className="w-full flex-1"
              onClick={() => {
                setLastOk(null)
                setTab("withdraw")
              }}
            >
              {t("withdrawNext")}
            </Button>
          )
        }
      />
    </div>
  )
}
