"use client"

import { useState } from "react"
import Link from "next/link"
import { Principal } from "@icp-sdk/core/principal"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { SendSuccess } from "@/components/wallet/send-success"
import { useAuth } from "@/components/auth/auth-provider"
import { useLiveBalance, useRefreshWallet } from "@/hooks/wallet/useWalletData"
import { useIcpaySale } from "@/hooks/icpay/useIcpaySale"
import { buyIcpay, icpayReceiveAmount, type IcpayPurchase } from "@/services/icpay/sale"
import {
  formatAmount,
  formatTokenAmount,
  parseTokenAmount,
  shortPrincipal,
} from "@/lib/wallet/utils"
import { primeSuccessChime } from "@/lib/ui/successChime"

const ICP_DECIMALS = 8
const QUICK_AMOUNTS = ["0.1", "1", "5"] as const

function destinationLabel(
  external: boolean,
  recipient: string,
  selfLabel: string
): string {
  if (!external) return selfLabel
  const trimmed = recipient.trim()
  if (!trimmed) return selfLabel
  try {
    return shortPrincipal(Principal.fromText(trimmed).toText())
  } catch {
    return trimmed.length > 16 ? `${trimmed.slice(0, 8)}…${trimmed.slice(-4)}` : trimmed
  }
}

export function BuyIcpayDrawer({
  open,
  onOpenChange,
  symbol,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  symbol: string
}) {
  const t = useTranslations("buyIcpay")
  const { identity } = useAuth()
  const { sale, rate, refresh } = useIcpaySale()
  const balance = useLiveBalance()
  const refreshWallet = useRefreshWallet()

  const [value, setValue] = useState("")
  const [external, setExternal] = useState(false)
  const [recipient, setRecipient] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<IcpayPurchase | null>(null)

  const icpAmount = parseTokenAmount(value, ICP_DECIMALS)
  const receive =
    icpAmount !== null && rate !== undefined ? icpayReceiveAmount(icpAmount, rate) : null
  const minBuy = sale?.minBuyIcp ?? 10_000_000n
  const maxBuy = sale?.maxBuyIcp ?? 5_000_000_000n
  const belowMin = icpAmount !== null && icpAmount < minBuy
  const aboveMax = icpAmount !== null && icpAmount > maxBuy
  const insufficient = icpAmount !== null && balance !== undefined && icpAmount > balance
  const inactive = sale !== undefined && !sale.active

  let recipientPrincipal: Principal | undefined
  if (external && recipient.trim()) {
    try {
      recipientPrincipal = Principal.fromText(recipient.trim())
    } catch {
      recipientPrincipal = undefined
    }
  }

  const canBuy =
    identity &&
    icpAmount !== null &&
    receive !== null &&
    !belowMin &&
    !aboveMax &&
    !insufficient &&
    !loading &&
    !inactive &&
    (!external || recipientPrincipal !== undefined)

  const reset = () => {
    setValue("")
    setExternal(false)
    setRecipient("")
    setError(null)
    setSuccess(null)
  }

  const handleClose = (next: boolean) => {
    if (!next) reset()
    onOpenChange(next)
  }

  const handleBuy = async () => {
    if (icpAmount === null || !identity || !canBuy) return
    primeSuccessChime()
    setLoading(true)
    setError(null)
    const result = await buyIcpay(identity, icpAmount, recipientPrincipal)
    setLoading(false)
    if ("err" in result) {
      setError(result.err)
      return
    }
    setSuccess(result.ok)
    await Promise.all([refresh(), refreshWallet()])
  }

  const destLabel = destinationLabel(external, recipient, t("yourWallet"))

  if (success) {
    return (
      <Drawer open={open} onOpenChange={handleClose} showSwipeHandle>
        <DrawerContent className="max-h-[92vh]">
          <div className="overflow-y-auto px-4 pb-8">
            <SendSuccess
              amount={success.icpayAmount}
              recipient={destLabel}
              blockIndex={success.icpayBlock}
              kind="icpayBuy"
              symbol={symbol}
              decimals={ICP_DECIMALS}
              onDone={() => handleClose(false)}
            />
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Drawer open={open} onOpenChange={handleClose} showSwipeHandle>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t("title")}</DrawerTitle>
        </DrawerHeader>

        <div className="space-y-4 px-4">
          {!identity ? (
            <Alert>
              <AlertDescription>{t("loginRequired")}</AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="buy-icp">{t("pay")}</Label>
                <Input
                  id="buy-icp"
                  size="xl"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value)
                    setError(null)
                  }}
                  className="rounded-2xl tabular-nums"
                />
                <div className="flex gap-2">
                  {QUICK_AMOUNTS.map((amount) => (
                    <Button
                      key={amount}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-xl tabular-nums"
                      onClick={() => {
                        setValue(amount)
                        setError(null)
                      }}
                    >
                      {amount} ICP
                    </Button>
                  ))}
                </div>
                {receive !== null && (
                  <p className="text-sm font-medium tabular-nums text-foreground">
                    {t("receive", {
                      amount: formatTokenAmount(receive, ICP_DECIMALS),
                      symbol,
                    })}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setExternal((v) => !v)}
                  className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                >
                  {external ? t("sendToSelf") : t("sendExternal")}
                </button>
                {external && (
                  <>
                    <Input
                      size="lg"
                      placeholder={t("principalPlaceholder")}
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      className="rounded-2xl font-mono text-xs"
                    />
                    <p className="text-xs text-destructive">{t("externalWarning")}</p>
                  </>
                )}
              </div>

              {icpAmount !== null && receive !== null && !belowMin && !aboveMax && (
                <div className="rounded-2xl bg-muted/50 p-4 text-sm">
                  <p className="text-xs font-medium text-muted-foreground">{t("confirmTitle")}</p>
                  <dl className="mt-2 space-y-1.5 tabular-nums">
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">{t("pay")}</dt>
                      <dd className="font-medium">{formatAmount(icpAmount)} ICP</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">{t("receiveLabel")}</dt>
                      <dd className="font-medium">
                        {formatTokenAmount(receive, ICP_DECIMALS)} {symbol}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">{t("sendTo")}</dt>
                      <dd className="max-w-[55%] truncate font-medium">{destLabel}</dd>
                    </div>
                  </dl>
                </div>
              )}

              {balance !== undefined && (
                <p className="text-xs text-muted-foreground">
                  {t("balance", { amount: formatAmount(balance) })}
                </p>
              )}
            </>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DrawerFooter>
          {!identity ? (
            <Button className="w-full" nativeButton={false} render={<Link href="/login" />}>
              {t("loginToBuy")}
            </Button>
          ) : (
            <Button className="w-full" disabled={!canBuy} onClick={handleBuy}>
              {loading ? (
                <>
                  <Spinner className="size-4" />
                  {t("buying")}
                </>
              ) : inactive ? (
                t("soldOut")
              ) : insufficient ? (
                t("insufficient")
              ) : belowMin ? (
                t("belowMin")
              ) : aboveMax ? (
                t("aboveMax")
              ) : (
                t("confirm")
              )}
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
