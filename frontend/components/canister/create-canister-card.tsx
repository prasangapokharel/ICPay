"use client"

import { useEffect, useMemo, useState, useSyncExternalStore } from "react"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { InformationCircleIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { CreateCanisterStepper } from "@/components/canister/create-canister-stepper"
import {
  CreateCanisterAlerts,
  type CreateCanisterSuccess,
} from "@/components/canister/create-canister-alerts"
import { SubnetPicker, SUBNET_DEFAULT } from "@/components/canister/subnet-picker"
import { CyclesFlowPreview } from "@/components/cycles/cycles-flow-preview"
import { useAuth } from "@/components/auth/auth-provider"
import { useLiveBalance, useRefreshWallet } from "@/hooks/wallet/useWalletData"
import { AmountInput } from "@/components/shared/amount-input"
import { formatAmount, parseIcp } from "@/lib/wallet/utils"
import { rememberCanister } from "@/lib/canister/savedCanisters"
import {
  createCanisterFromWallet,
  estimateCyclesFromE8s,
  fetchCmcXdrPermyriad,
  fetchIcpTransferFee,
  fetchPrincipalIcpBalance,
  formatCycles,
  formatCreateCanisterError,
  MAX_CREATE_E8S,
  MIN_CREATE_E8S,
  walletCostForTopUp,
  walletShortfall,
  type CreateCanisterFlowStep,
} from "@/services/canister/createCanister"

function FieldHint({ label, tip }: { label: string; tip: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Label>{label}</Label>
      <Tooltip>
        <TooltipTrigger
          type="button"
          className="inline-flex text-muted-foreground hover:text-foreground"
          aria-label={tip}
        >
          <HugeiconsIcon icon={InformationCircleIcon} className="size-3.5" strokeWidth={1.75} />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-xs">{tip}</TooltipContent>
      </Tooltip>
    </div>
  )
}

export function CreateCanisterCard() {
  const t = useTranslations("canisterCreate")
  const { identity, isAuthenticated, isLoading, login } = useAuth()
  const walletBalance = useLiveBalance()
  const refreshWallet = useRefreshWallet()

  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const [connecting, setConnecting] = useState(false)
  const [amountText, setAmountText] = useState("")
  const [extraControllers, setExtraControllers] = useState("")
  const [subnetId, setSubnetId] = useState(SUBNET_DEFAULT)
  const [rate, setRate] = useState<bigint | null>(null)
  const [iiBalance, setIiBalance] = useState<bigint | null>(null)
  const [fee, setFee] = useState<bigint>(10_000n)
  const [loadingMeta, setLoadingMeta] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [flowStep, setFlowStep] = useState<CreateCanisterFlowStep | null>(null)
  const [flowFailed, setFlowFailed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastOk, setLastOk] = useState<CreateCanisterSuccess | null>(null)

  const fieldsLocked = !hydrated || isLoading || !isAuthenticated || submitting

  const amountE8s = useMemo(() => parseIcp(amountText), [amountText])
  const iiBal = iiBalance ?? 0n
  const shortfall = amountE8s != null ? walletShortfall(amountE8s, iiBal, fee) : 0n
  const walletCost = amountE8s != null ? walletCostForTopUp(amountE8s, iiBal, fee) : 0n
  const maxSpend =
    walletBalance != null
      ? (() => {
          const max =
            walletBalance + iiBal >= fee * 2n ? walletBalance + iiBal - fee * 2n : 0n
          const iiOnly = iiBal > fee ? iiBal - fee : 0n
          const pick = iiOnly > max ? iiOnly : max
          return pick > MAX_CREATE_E8S ? MAX_CREATE_E8S : pick
        })()
      : 0n

  const estimatedCycles =
    amountE8s != null && rate != null ? estimateCyclesFromE8s(amountE8s, rate) : null

  const amountError =
    !amountText.trim()
      ? null
      : amountE8s == null
        ? t("invalidAmount")
        : amountE8s < MIN_CREATE_E8S
          ? t("minAmount")
          : amountE8s > MAX_CREATE_E8S
            ? t("maxAmount")
            : walletBalance != null && walletCost > walletBalance
              ? t("insufficient")
              : null

  useEffect(() => {
    if (!isAuthenticated || !identity) {
      setIiBalance(null)
      return
    }
    let cancelled = false
    setLoadingMeta(true)
    void Promise.all([
      fetchCmcXdrPermyriad(identity),
      fetchPrincipalIcpBalance(identity),
      fetchIcpTransferFee(identity),
    ])
      .then(([xdr, bal, transferFee]) => {
        if (cancelled) return
        setRate(xdr)
        setIiBalance(bal)
        setFee(transferFee)
      })
      .catch(() => {
        if (!cancelled) setError(t("metaFailed"))
      })
      .finally(() => {
        if (!cancelled) setLoadingMeta(false)
      })
    return () => {
      cancelled = true
    }
  }, [identity, isAuthenticated, t])

  const onCreate = async () => {
    if (!identity || amountE8s == null || amountError) return
    setSubmitting(true)
    setError(null)
    setFlowFailed(false)
    setFlowStep(shortfall > 0n ? "send" : "create")
    try {
      const extras = extraControllers
        .split(/[\s,]+/)
        .map((s) => s.trim())
        .filter(Boolean)
      const result = await createCanisterFromWallet(
        identity,
        {
          amountE8s,
          extraControllers: extras,
          subnetId: subnetId === SUBNET_DEFAULT ? null : subnetId,
        },
        setFlowStep
      )
      setLastOk({
        canister: result.canisterId,
        block: result.blockIndex.toString(),
        amount: formatAmount(result.amountE8s),
        withdrew: result.withdrewFromWallet,
      })
      rememberCanister(identity.getPrincipal().toText(), result.canisterId)
      void refreshWallet()
      const bal = await fetchPrincipalIcpBalance(identity)
      setIiBalance(bal)
    } catch (e) {
      setFlowFailed(true)
      setError(formatCreateCanisterError(e))
    } finally {
      setSubmitting(false)
    }
  }

  const controllerText = identity?.getPrincipal().toText() ?? "—"

  return (
    <TooltipProvider delay={200}>
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
              <CreateCanisterStepper flowStep={flowStep} failed={flowFailed} />

              <div className="space-y-2">
                <FieldHint label={t("controller")} tip={t("controllerTip")} />
                <Input
                  value={controllerText}
                  readOnly
                  className="font-mono text-sm"
                  disabled={fieldsLocked}
                />
              </div>

              <div className="space-y-2">
                <FieldHint label={t("extraControllers")} tip={t("extraControllersTip")} />
                <Input
                  value={extraControllers}
                  onChange={(e) => setExtraControllers(e.target.value)}
                  placeholder={t("extraControllersPlaceholder")}
                  spellCheck={false}
                  disabled={fieldsLocked}
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <FieldHint label={t("subnet")} tip={t("subnetTip")} />
                <SubnetPicker
                  value={subnetId}
                  onChange={setSubnetId}
                  identity={identity}
                  disabled={fieldsLocked}
                />
              </div>

              {hydrated && isAuthenticated && !isLoading ? (
                <div className="space-y-2">
                  <AmountInput
                    id="create-icp-amount"
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
                        : t("flowHintCreateOnly")}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="create-icp-amount">{t("amount")}</Label>
                  <Input
                    id="create-icp-amount"
                    inputMode="decimal"
                    value={amountText}
                    onChange={(e) => setAmountText(e.target.value)}
                    placeholder="0.00"
                    disabled={!hydrated || isLoading || submitting}
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
                      {t("rateBadge", { xdr: (Number(rate) / 10_000).toFixed(2) })}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">{t("estimateSource")}</p>
              </div>

              <CreateCanisterAlerts
                error={error}
                lastOk={lastOk}
                onDismissSuccess={() => {
                  setLastOk(null)
                  setFlowStep(null)
                  setFlowFailed(false)
                }}
              />

              <div className="space-y-3">
                {!hydrated || !isAuthenticated || isLoading ? (
                  <Button
                    type="button"
                    className="w-full"
                    disabled={!hydrated || isLoading || connecting}
                    onClick={() => {
                      setConnecting(true)
                      void login().finally(() => setConnecting(false))
                    }}
                  >
                    {!hydrated || connecting || isLoading ? t("connecting") : t("signIn")}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    className="w-full"
                    disabled={submitting || Boolean(amountError) || amountE8s == null}
                    onClick={() => void onCreate()}
                  >
                    {submitting
                      ? flowStep === "send"
                        ? t("sending")
                        : t("creating")
                      : t("create")}
                  </Button>
                )}
                <p className="text-xs leading-relaxed text-muted-foreground">{t("disclaimer")}</p>
              </div>
            </CardContent>
          </Card>

          <CyclesFlowPreview
            className="hidden lg:flex"
            title={t("previewTitle")}
            loading={loadingMeta && rate == null}
            highlight={{
              label: t("estimate"),
              value: estimatedCycles != null ? `≈ ${formatCycles(estimatedCycles)}` : "—",
            }}
            rows={[
              { label: t("controller"), value: controllerText, mono: true },
              {
                label: t("subnet"),
                value:
                  subnetId === SUBNET_DEFAULT
                    ? t("subnetDefault")
                    : subnetId,
                mono: subnetId !== SUBNET_DEFAULT,
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
        </div>
      </div>
    </TooltipProvider>
  )
}
