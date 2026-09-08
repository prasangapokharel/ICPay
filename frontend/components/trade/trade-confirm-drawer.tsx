"use client"

import { useEffect, useMemo } from "react"
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
import { Spinner } from "@/components/ui/spinner"
import { createAgent } from "@/services/icp"
import { requiredWalletDebit } from "@/lib/trade/fees"
import { formatTokenAmount } from "@/lib/wallet/utils"
import type { TokenHolding } from "@/services/tokens"
import type { Identity } from "@icp-sdk/core/agent"

type TradeConfirmDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  identity: Identity | undefined
  tokenIn: TokenHolding | null
  tokenOut: TokenHolding | null
  amountIn: bigint | null
  amountOut: bigint | null
  trading: boolean
  onConfirm: () => void
}

export function TradeConfirmDrawer({
  open,
  onOpenChange,
  identity,
  tokenIn,
  tokenOut,
  amountIn,
  amountOut,
  trading,
  onConfirm,
}: TradeConfirmDrawerProps) {
  const t = useTranslations("trade")

  const balancePreview = useMemo(() => {
    if (!tokenIn || !tokenOut || amountIn === null || amountOut === null) return null
    const tokenDebit = requiredWalletDebit(amountIn, tokenIn.fee)
    const afterIn = tokenIn.balance > tokenDebit ? tokenIn.balance - tokenDebit : 0n
    const afterOut = tokenOut.balance + amountOut
    return { afterIn, afterOut }
  }, [tokenIn, tokenOut, amountIn, amountOut])

  useEffect(() => {
    if (open && identity) void createAgent(identity)
  }, [open, identity])

  const handleOpenChange = (next: boolean) => {
    if (trading && !next) return
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

        <DrawerFooter className="pb-6">
          {trading ? (
            <div
              className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl bg-primary text-primary-foreground"
              aria-busy="true"
              aria-live="polite"
            >
              <Spinner className="size-4 shrink-0 text-primary-foreground" />
              <span className="text-sm font-semibold">{t("trading")}</span>
            </div>
          ) : (
            <Button className="h-11 w-full rounded-xl" onClick={onConfirm}>
              {t("confirmTrade")}
            </Button>
          )}
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
  const t = useTranslations("trade")
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="font-medium">{symbol}</span>
      <div className="flex items-center gap-2 tabular-nums">
        <span className="text-muted-foreground">{formatTokenAmount(before, decimals)}</span>
        <span className="text-muted-foreground/60">→</span>
        <span className="font-medium">{formatTokenAmount(after, decimals)}</span>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {t("afterLabel")}
        </span>
      </div>
    </div>
  )
}
