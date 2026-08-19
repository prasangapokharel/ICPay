"use client"

import { useEffect, useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { createAgent } from "@/services/icp"
import { requiredBalance, requiredIcpSwapBalance, icpServiceDebit } from "@/lib/swap/utils"
import { ICP_LEDGER_ID } from "@/services/tokens"
import { formatTokenAmount } from "@/lib/wallet/utils"
import type { TokenHolding } from "@/services/tokens"
import type { Identity } from "@icp-sdk/core/agent"
import { cn } from "@/lib/ui/utils"

const STEP_MS = [0, 5_000, 14_000] as const

type SwapConfirmDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  identity: Identity | undefined
  tokenIn: TokenHolding | null
  tokenOut: TokenHolding | null
  amountIn: bigint | null
  amountOut: bigint | null
  swapping: boolean
  onConfirm: () => void
}

export function SwapConfirmDrawer({
  open,
  onOpenChange,
  identity,
  tokenIn,
  tokenOut,
  amountIn,
  amountOut,
  swapping,
  onConfirm,
}: SwapConfirmDrawerProps) {
  const t = useTranslations("swap")

  const balancePreview = useMemo(() => {
    if (!tokenIn || !tokenOut || amountIn === null || amountOut === null) return null
    const serviceDebit = icpServiceDebit(
      tokenIn.ledgerId === ICP_LEDGER_ID ? tokenIn.fee : 10_000n
    )
    const tokenDebit =
      tokenIn.ledgerId === ICP_LEDGER_ID
        ? requiredIcpSwapBalance(amountIn, tokenIn.fee, serviceDebit)
        : requiredBalance(amountIn, tokenIn.fee)
    const afterIn = tokenIn.balance > tokenDebit ? tokenIn.balance - tokenDebit : 0n
    const afterOut = tokenOut.balance + amountOut
    return { afterIn, afterOut }
  }, [tokenIn, tokenOut, amountIn, amountOut])

  useEffect(() => {
    if (open && identity) void createAgent(identity)
  }, [open, identity])

  const handleOpenChange = (next: boolean) => {
    if (swapping && !next) return
    onOpenChange(next)
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t("confirmTitle")}</DrawerTitle>
          <DrawerDescription>{t("confirmBody")}</DrawerDescription>
        </DrawerHeader>

        {tokenIn && tokenOut && amountIn !== null && amountOut !== null && balancePreview && (
          <>
            <div className="mx-4 border-t border-border/70" />
            <div className="flex flex-col gap-3 px-4 py-4">
              <ConfirmRow
                label={t("youPay")}
                value={`${formatTokenAmount(amountIn, tokenIn.decimals)} ${tokenIn.symbol}`}
              />
              <ConfirmRow
                label={t("youReceive")}
                value={`${formatTokenAmount(amountOut, tokenOut.decimals)} ${tokenOut.symbol}`}
              />
              <ConfirmRow label={t("slippage")} value="1%" />
            </div>

            <div className="mx-4 border-t border-border/70" />
            <div className="flex flex-col gap-3 px-4 py-4">
              <p className="text-xs font-medium text-muted-foreground">{t("balanceAfter")}</p>
              <BalanceChangeRow
                symbol={tokenIn.symbol}
                decimals={tokenIn.decimals}
                before={tokenIn.balance}
                after={balancePreview.afterIn}
              />
              <BalanceChangeRow
                symbol={tokenOut.symbol}
                decimals={tokenOut.decimals}
                before={tokenOut.balance}
                after={balancePreview.afterOut}
              />
            </div>
          </>
        )}

        {swapping && <SwapProcessSteps />}

        <DrawerFooter>
          <Button onClick={onConfirm} disabled={swapping}>
            {swapping ? t("swapping") : t("confirmSwap")}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function ConfirmRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  )
}

function BalanceChangeRow({
  symbol,
  decimals,
  before,
  after,
}: {
  symbol: string
  decimals: number
  before: bigint
  after: bigint
}) {
  const t = useTranslations("swap")
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="font-medium">{symbol}</span>
      <div className="flex items-center gap-2 tabular-nums">
        <span className="text-muted-foreground">
          {formatTokenAmount(before, decimals)}
        </span>
        <span className="text-muted-foreground/60">→</span>
        <span className="font-medium">{formatTokenAmount(after, decimals)}</span>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {t("afterLabel")}
        </span>
      </div>
    </div>
  )
}

function SwapProcessSteps() {
  const t = useTranslations("swap")
  const [activeStep, setActiveStep] = useState(0)

  const steps = [t("stepPrepare"), t("stepExecute"), t("stepDeliver")]

  useEffect(() => {
    const start = Date.now()
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - start
      let step = 0
      for (let i = STEP_MS.length - 1; i >= 0; i--) {
        if (elapsed >= STEP_MS[i]) {
          step = i
          break
        }
      }
      setActiveStep(step)
    }, 400)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className="mx-4 mb-2 rounded-2xl border border-border/60 bg-muted/30 px-4 py-4">
      <p className="text-center text-xs text-muted-foreground">{t("processHint")}</p>
      <div className="mt-3 flex flex-col gap-2.5">
        {steps.map((label, index) => {
          const done = index < activeStep
          const active = index === activeStep
          return (
            <div key={label} className="flex items-center gap-3">
              <span
                className={cn(
                  "size-2 shrink-0 rounded-full transition-colors",
                  done && "bg-success",
                  active && "bg-primary",
                  !done && !active && "bg-muted-foreground/25"
                )}
              />
              <span
                className={cn(
                  "text-sm transition-colors",
                  active ? "font-medium text-foreground" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
