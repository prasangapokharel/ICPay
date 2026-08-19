"use client"

import { useMemo, useRef, useState } from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDataTransferVerticalIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { SwapConfirmDrawer } from "@/components/swap/swap-confirm-drawer"
import { SwapTokenPicker } from "@/components/swap/swap-token-picker"
import { useSwapQuote, useSwapTokens } from "@/hooks/swap/useSwap"
import { defaultSwapPair } from "@/lib/swap/tokens"
import {
  icpServiceDebit,
  icpServiceFee,
  isSwapRecoverError,
  maxSwapInput,
  minAmountOut,
  requiredBalance,
  requiredIcpSwapBalance,
  swapRate,
} from "@/lib/swap/utils"
import {
  formatTokenAmount,
  parseTokenAmount,
  toPlainTokenAmount,
} from "@/lib/wallet/utils"
import { ICP_LEDGER_ID, type TokenHolding } from "@/services/tokens"
import { executeSwap, recoverFailedSwapInput } from "@/services/swap/swap"
import type { Identity } from "@icp-sdk/core/agent"
import { primeSuccessChime } from "@/lib/ui/successChime"
import { useRefreshWallet } from "@/hooks/wallet/useWalletData"

const PERCENTAGES = [25, 50, 75, 100] as const

export type SwapSuccess = {
  amountIn: bigint
  amountOut: bigint
  tokenIn: TokenHolding
  tokenOut: TokenHolding
  blockIndex: bigint
  beforeIn: bigint
  beforeOut: bigint
  icpFee: bigint
}

export function SwapForm({
  identity,
  initialTokenIn,
  initialTokenOut,
  onSuccess,
}: {
  identity: Identity | undefined
  initialTokenIn?: string | null
  initialTokenOut?: string | null
  onSuccess: (result: SwapSuccess) => void
}) {
  const t = useTranslations("swap")
  const { tokens, isLoading: tokensLoading } = useSwapTokens()

  const defaultPair = useMemo(() => {
    if (tokens.length < 2) return null
    const from = initialTokenIn ? tokens.find((x) => x.ledgerId === initialTokenIn) : undefined
    const to = initialTokenOut ? tokens.find((x) => x.ledgerId === initialTokenOut) : undefined
    if (from && to && from.ledgerId !== to.ledgerId) return { tokenIn: from, tokenOut: to }
    const pair = defaultSwapPair(tokens)
    if (!pair) return null
    return {
      tokenIn: from ?? pair.tokenIn,
      tokenOut: to ?? pair.tokenOut,
    }
  }, [tokens, initialTokenIn, initialTokenOut])

  const [pickedIn, setPickedIn] = useState<TokenHolding | null>(null)
  const [pickedOut, setPickedOut] = useState<TokenHolding | null>(null)
  const tokenIn = pickedIn ?? defaultPair?.tokenIn ?? null
  const tokenOut = pickedOut ?? defaultPair?.tokenOut ?? null
  const [amountText, setAmountText] = useState("")
  const [picker, setPicker] = useState<"in" | "out" | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recoverOk, setRecoverOk] = useState<string | null>(null)
  const [swapping, setSwapping] = useState(false)
  const [recovering, setRecovering] = useState(false)
  const swapLock = useRef(false)
  const refreshWallet = useRefreshWallet()

  const pickIn = (token: TokenHolding) => {
    setPickedIn(token)
    const out = pickedOut ?? defaultPair?.tokenOut ?? null
    if (out?.ledgerId === token.ledgerId) {
      const alt = tokens.find((x) => x.ledgerId !== token.ledgerId)
      if (alt) setPickedOut(alt)
    }
  }

  const pickOut = (token: TokenHolding) => {
    setPickedOut(token)
  }

  const icpToken = tokens.find((t) => t.ledgerId === ICP_LEDGER_ID)
  const serviceFee = icpServiceFee()
  const serviceDebit = icpToken ? icpServiceDebit(icpToken.fee) : null

  const amountIn = tokenIn ? parseTokenAmount(amountText, tokenIn.decimals) : null
  const maxIn =
    tokenIn === null
      ? 0n
      : maxSwapInput(
          tokenIn.balance,
          tokenIn.fee,
          tokenIn.ledgerId === ICP_LEDGER_ID && serviceDebit ? serviceDebit : undefined
        )
  const totalDebit =
    amountIn !== null && tokenIn
      ? tokenIn.ledgerId === ICP_LEDGER_ID && serviceDebit
        ? requiredIcpSwapBalance(amountIn, tokenIn.fee, serviceDebit)
        : requiredBalance(amountIn, tokenIn.fee)
      : null

  const insufficientToken =
    amountIn !== null && tokenIn !== null && totalDebit !== null && totalDebit > tokenIn.balance

  const insufficientIcp =
    serviceDebit !== null &&
    icpToken !== undefined &&
    tokenIn !== null &&
    amountIn !== null &&
    tokenIn.ledgerId !== ICP_LEDGER_ID &&
    icpToken.balance < serviceDebit

  const insufficient = insufficientToken || insufficientIcp

  const { quote, error: quoteError, isLoading: quoteLoading } = useSwapQuote(
    tokenIn?.ledgerId ?? null,
    tokenOut?.ledgerId ?? null,
    amountIn ?? 0n
  )

  const rate =
    amountIn !== null && quote && quote.amountOut > 0n
      ? swapRate(amountIn, quote.amountOut)
      : null

  const quoteMessage = useMemo(() => {
    if (!quoteError) return null
    const msg = quoteError instanceof Error ? quoteError.message : String(quoteError)
    if (msg === "sameToken") return t("sameToken")
    if (msg === "unsupported") return t("unsupported")
    if (msg.includes("liquidity")) return t("noLiquidity")
    return msg
  }, [quoteError, t])

  const canReview =
    tokenIn &&
    tokenOut &&
    tokenIn.ledgerId !== tokenOut.ledgerId &&
    amountIn !== null &&
    amountIn > 0n &&
    !insufficient &&
    quote &&
    quote.amountOut > 0n &&
    !quoteLoading

  const flip = () => {
    if (!tokenIn || !tokenOut) return
    setPickedIn(tokenOut)
    setPickedOut(tokenIn)
    setAmountText("")
    setError(null)
    setRecoverOk(null)
  }

  const applyPercent = (pct: number) => {
    if (!tokenIn || maxIn === 0n) return
    const slice = (maxIn * BigInt(pct)) / 100n
    setAmountText(toPlainTokenAmount(slice > 0n ? slice : 0n, tokenIn.decimals))
  }

  const handleConfirm = async () => {
    if (!tokenIn || !tokenOut || !amountIn || !quote) return
    if (swapLock.current) return
    swapLock.current = true
    setSwapping(true)
    setError(null)
    setRecoverOk(null)
    primeSuccessChime()
    const amountOutMin = minAmountOut(quote.amountOutRaw)
    try {
      const result = await executeSwap(
        identity,
        tokenIn.ledgerId,
        tokenOut.ledgerId,
        amountIn,
        amountOutMin
      )
      if ("err" in result) {
        setError(result.err)
        return
      }
      setConfirmOpen(false)
      onSuccess({
        amountIn,
        amountOut: result.ok.amountOut,
        tokenIn,
        tokenOut,
        blockIndex: result.ok.blockIndex,
        beforeIn: tokenIn.balance,
        beforeOut: tokenOut.balance,
        icpFee: icpToken?.fee ?? 10_000n,
      })
    } finally {
      swapLock.current = false
      setSwapping(false)
    }
  }

  const showRecover =
    error !== null &&
    amountIn !== null &&
    tokenIn !== null &&
    tokenOut !== null &&
    isSwapRecoverError(error)

  const handleRecover = async () => {
    if (!tokenIn || !tokenOut || !amountIn || recovering) return
    setRecovering(true)
    setRecoverOk(null)
    try {
      await recoverFailedSwapInput(identity, tokenIn.ledgerId, tokenOut.ledgerId, amountIn)
      setError(null)
      setRecoverOk(t("recoverSuccess"))
      setConfirmOpen(false)
      refreshWallet()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setRecovering(false)
    }
  }

  if (tokensLoading && tokens.length === 0) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    )
  }

  if (tokens.length < 2) {
    return (
      <Alert>
        <AlertDescription>{t("needTwoTokens")}</AlertDescription>
      </Alert>
    )
  }

  return (
    <>
      <div className="space-y-3">
        <SwapAmountCard
          label={t("youPay")}
          token={tokenIn}
          amountText={amountText}
          onAmountChange={setAmountText}
          onPickToken={() => setPicker("in")}
          balance={tokenIn?.balance}
          maxHint={maxIn}
          onMax={() => applyPercent(100)}
          percentages={PERCENTAGES}
          onPercent={applyPercent}
        />

        <div className="flex justify-center">
          <Button type="button" variant="outline" size="icon" className="rounded-full" onClick={flip}>
            <HugeiconsIcon icon={ArrowDataTransferVerticalIcon} className="size-4" />
            <span className="sr-only">{t("flip")}</span>
          </Button>
        </div>

        <SwapAmountCard
          label={t("youReceive")}
          token={tokenOut}
          readOnly
          amountText={
            quote && tokenOut
              ? formatTokenAmount(quote.amountOut, tokenOut.decimals)
              : quoteLoading
                ? "…"
                : "0"
          }
          onPickToken={() => setPicker("out")}
        />

        {amountIn !== null && tokenIn && icpToken && (
          <div className="rounded-2xl border border-border/60 bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
            <FeeRow label={t("icpServiceFee")} value={serviceFee} token={icpToken} />
            {quote && tokenIn && (
              <FeeRow label={t("poolFee")} value={quote.swapFee} token={tokenIn} />
            )}
            <FeeRow label={t("ledgerFees")} value={3n * tokenIn.fee} token={tokenIn} />
            {totalDebit !== null && (
              <div className="mt-2 flex justify-between border-t border-border/50 pt-2 font-medium text-foreground">
                <span>{t("totalDebit")}</span>
                <span className="tabular-nums">
                  {formatTokenAmount(totalDebit, tokenIn.decimals)} {tokenIn.symbol}
                </span>
              </div>
            )}
            {rate && tokenOut && (
              <p className="mt-2 text-[11px]">
                {t("rate")}: 1 {tokenIn.symbol} ≈ {rate} {tokenOut.symbol}
              </p>
            )}
          </div>
        )}

        {insufficient && (
          <Alert variant="destructive">
            <AlertDescription>
              {insufficientIcp && !insufficientToken
                ? t("insufficientIcp", {
                    fee: `${formatTokenAmount(serviceFee, icpToken?.decimals ?? 8)} ICP`,
                  })
                : t("insufficientBalance")}
            </AlertDescription>
          </Alert>
        )}
        {quoteMessage && amountIn !== null && amountIn > 0n && (
          <Alert variant="destructive">
            <AlertDescription>{quoteMessage}</AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertDescription className="space-y-3">
              <p>{error}</p>
              {showRecover && (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="w-full"
                  disabled={recovering || swapping}
                  onClick={handleRecover}
                >
                  {recovering ? t("recovering") : t("recoverFunds")}
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}
        {recoverOk && (
          <Alert>
            <AlertDescription>{recoverOk}</AlertDescription>
          </Alert>
        )}

        <Button
          className="w-full"
          disabled={!canReview}
          onClick={() => setConfirmOpen(true)}
        >
          {quoteLoading ? t("fetchingQuote") : t("review")}
        </Button>
      </div>

      <SwapTokenPicker
        open={picker === "in"}
        onOpenChange={(o) => setPicker(o ? "in" : null)}
        tokens={tokens}
        selectedId={tokenIn?.ledgerId ?? null}
        onSelect={pickIn}
        title={t("selectPay")}
      />
      <SwapTokenPicker
        open={picker === "out"}
        onOpenChange={(o) => setPicker(o ? "out" : null)}
        tokens={tokens.filter((x) => x.ledgerId !== tokenIn?.ledgerId)}
        selectedId={tokenOut?.ledgerId ?? null}
        onSelect={pickOut}
        title={t("selectReceive")}
      />

      <SwapConfirmDrawer
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        identity={identity}
        tokenIn={tokenIn}
        tokenOut={tokenOut}
        amountIn={amountIn}
        amountOut={quote?.amountOut ?? null}
        swapping={swapping}
        onConfirm={handleConfirm}
      />
    </>
  )
}

function SwapAmountCard({
  label,
  token,
  amountText,
  onAmountChange,
  onPickToken,
  readOnly,
  balance,
  maxHint,
  onMax,
  percentages,
  onPercent,
}: {
  label: string
  token: TokenHolding | null
  amountText: string
  onPickToken: () => void
  onAmountChange?: (v: string) => void
  readOnly?: boolean
  balance?: bigint
  maxHint?: bigint
  onMax?: () => void
  percentages?: readonly number[]
  onPercent?: (n: number) => void
}) {
  const t = useTranslations("swap")
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={onPickToken}
          className="flex shrink-0 items-center gap-2 rounded-full bg-muted/60 py-1.5 pl-1.5 pr-3 text-sm font-semibold"
        >
          {token ? <MiniLogo token={token} /> : null}
          {token?.symbol ?? t("selectToken")}
        </button>
        {readOnly ? (
          <p className="min-w-0 flex-1 truncate text-right text-2xl font-semibold tabular-nums">
            {amountText}
          </p>
        ) : (
          <Input
            inputMode="decimal"
            value={amountText}
            onChange={(e) => onAmountChange?.(e.target.value)}
            placeholder="0"
            className="h-auto border-0 bg-transparent px-0 text-right text-2xl font-semibold shadow-none focus-visible:ring-0"
          />
        )}
      </div>
      {!readOnly && token && balance !== undefined && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>
            {t("balance")}: {formatTokenAmount(balance, token.decimals)}
          </span>
          {onMax && maxHint !== undefined && maxHint > 0n && (
            <button type="button" className="font-medium text-primary" onClick={onMax}>
              {t("max")}
            </button>
          )}
        </div>
      )}
      {!readOnly && percentages && onPercent && (
        <div className="mt-2 flex gap-2">
          {percentages.map((p) => (
            <Button key={p} type="button" variant="outline" size="sm" className="h-7 flex-1 text-xs" onClick={() => onPercent(p)}>
              {p}%
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}

function MiniLogo({ token }: { token: TokenHolding }) {
  const src = token.ledgerId === ICP_LEDGER_ID ? "/images/logo/logo.png" : token.logo
  if (!src) {
    return (
      <span className="flex size-7 items-center justify-center rounded-full bg-muted text-[10px] font-bold uppercase">
        {token.symbol.slice(0, 2)}
      </span>
    )
  }
  return (
    <Image src={src} alt="" width={28} height={28} unoptimized className="size-7 rounded-full object-contain" />
  )
}

function FeeRow({
  label,
  value,
  token,
}: {
  label: string
  value: bigint | null
  token: TokenHolding
}) {
  if (value === null) return null
  return (
    <div className="flex justify-between py-0.5">
      <span>{label}</span>
      <span className="tabular-nums">
        {formatTokenAmount(value, token.decimals)} {token.symbol}
      </span>
    </div>
  )
}
