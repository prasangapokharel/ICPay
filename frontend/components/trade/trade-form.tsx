"use client"

import { useMemo, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { AppIcon } from "@/components/ui/app-icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { TradeConfirmDrawer } from "@/components/trade/trade-confirm-drawer"
import { TradeTokenPicker } from "@/components/trade/trade-token-picker"
import { TokenLogo } from "@/components/token/token-logo"
import { TokenFiatHint } from "@/components/token/token-fiat-hint"
import { useTradeQuote, useTradeTokens } from "@/hooks/trade/useTrade"
import { defaultSwapPair } from "@/lib/swap/tokens"
import {
  maxTradeInput,
  minAmountOut,
  minTradeInput,
  requiredWalletDebit,
  tradeRate,
} from "@/lib/trade/fees"
import {
  formatTokenAmount,
  parseTokenAmount,
  toPlainTokenAmount,
} from "@/lib/wallet/utils"
import type { TokenHolding } from "@/services/tokens"
import { runTrade, warmTradeSession } from "@/services/trade/trade"
import type { Identity } from "@icp-sdk/core/agent"

const PERCENTAGES = [25, 50, 75, 100] as const

export type TradeSuccess = {
  amountIn: bigint
  amountOut: bigint
  tokenIn: TokenHolding
  tokenOut: TokenHolding
  beforeIn: bigint
  beforeOut: bigint
}

export function TradeForm({
  identity,
  initialTokenIn,
  initialTokenOut,
  onSuccess,
}: {
  identity: Identity | undefined
  initialTokenIn?: string | null
  initialTokenOut?: string | null
  onSuccess: (result: TradeSuccess) => void
}) {
  const t = useTranslations("trade")
  const { tokens, isLoading: tokensLoading } = useTradeTokens()

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
  const [trading, setTrading] = useState(false)
  const tradeLock = useRef(false)

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

  const amountIn = tokenIn ? parseTokenAmount(amountText, tokenIn.decimals) : null
  const maxIn =
    tokenIn === null ? 0n : maxTradeInput(tokenIn.balance, tokenIn.fee)
  const totalDebit =
    amountIn !== null && tokenIn ? requiredWalletDebit(amountIn, tokenIn.fee) : null

  const insufficient =
    amountIn !== null && tokenIn !== null && totalDebit !== null && totalDebit > tokenIn.balance

  const belowMin =
    amountIn !== null && tokenIn !== null && amountIn > 0n && amountIn < minTradeInput(tokenIn.fee)

  const { quote, error: quoteError, isLoading: quoteLoading } = useTradeQuote(
    tokenIn?.ledgerId ?? null,
    tokenOut?.ledgerId ?? null,
    amountIn ?? 0n,
    {
      tokenInFee: tokenIn?.fee,
      tokenOutFee: tokenOut?.fee,
    }
  )

  const rate =
    amountIn !== null && quote && quote.amountOut > 0n && !quoteError
      ? tradeRate(amountIn, quote.amountOut)
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
    !belowMin &&
    quote &&
    quote.amountOut > 0n &&
    !quoteLoading &&
    !quoteError

  const flip = () => {
    if (!tokenIn || !tokenOut) return
    setPickedIn(tokenOut)
    setPickedOut(tokenIn)
    setAmountText("")
    setError(null)
  }

  const applyPercent = (pct: number) => {
    if (!tokenIn || maxIn === 0n) return
    const slice = (maxIn * BigInt(pct)) / 100n
    setAmountText(toPlainTokenAmount(slice > 0n ? slice : 0n, tokenIn.decimals))
  }

  const openReview = () => {
    void warmTradeSession(identity)
    setConfirmOpen(true)
  }

  const handleConfirm = async () => {
    if (!tokenIn || !tokenOut || !amountIn || !quote) return
    if (tradeLock.current) return
    tradeLock.current = true
    setTrading(true)
    setError(null)
    const amountOutMin = minAmountOut(quote.amountOutRaw)
    try {
      const result = await runTrade(
        identity,
        tokenIn.ledgerId,
        tokenOut.ledgerId,
        amountIn,
        amountOutMin
      )
      if ("err" in result) {
        setConfirmOpen(false)
        setError(result.err)
        return
      }
      setConfirmOpen(false)
      onSuccess({
        amountIn,
        amountOut: result.ok.amountOut,
        tokenIn,
        tokenOut,
        beforeIn: tokenIn.balance,
        beforeOut: tokenOut.balance,
      })
    } finally {
      tradeLock.current = false
      setTrading(false)
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
        <TradeAmountCard
          label={t("youPay")}
          token={tokenIn}
          amountText={amountText}
          fiatAmount={amountIn}
          onAmountChange={setAmountText}
          onPickToken={() => setPicker("in")}
          balance={tokenIn?.balance}
          maxHint={maxIn}
          onMax={() => applyPercent(100)}
          percentages={PERCENTAGES}
          onPercent={applyPercent}
        />

        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-10 rounded-full border-border/60 bg-gray-800 hover:bg-gray-700"
            onClick={flip}
          >
            <AppIcon name="swap" size={20} />
            <span className="sr-only">{t("flip")}</span>
          </Button>
        </div>

        <TradeAmountCard
          label={t("youReceive")}
          token={tokenOut}
          readOnly
          fiatAmount={quote && !quoteError && quote.amountOut > 0n ? quote.amountOut : null}
          amountText={
            quote && !quoteError && tokenOut
              ? formatTokenAmount(quote.amountOut, tokenOut.decimals)
              : quoteLoading
                ? "…"
                : "0"
          }
          onPickToken={() => setPicker("out")}
        />

        {amountIn !== null && tokenIn && (
          <div className="rounded-2xl border border-border/60 bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
            <FeeRow label={t("serviceFee")} value={quote?.serviceFee ?? null} token={tokenIn} />
            {quote && (
              <FeeRow label={t("poolFee")} value={quote.swapFee} token={tokenIn} />
            )}
            <FeeRow label={t("depositFee")} value={tokenIn.fee} token={tokenIn} />
            {totalDebit !== null && (
              <div className="mt-2 flex justify-between border-t border-border/50 pt-2 font-medium text-foreground">
                <span>{t("totalDebit")}</span>
                <span className="tabular-nums">
                  {formatTokenAmount(totalDebit, tokenIn.decimals)} {tokenIn.symbol}
                </span>
              </div>
            )}
            <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground/80">
              {t("feeNote")}
            </p>
            {rate && tokenOut && (
              <p className="mt-2 text-[11px]">
                {t("rate")}: 1 {tokenIn.symbol} ≈ {rate} {tokenOut.symbol}
              </p>
            )}
          </div>
        )}

        {belowMin && (
          <Alert variant="destructive">
            <AlertDescription>{t("amountTooSmall")}</AlertDescription>
          </Alert>
        )}
        {insufficient && (
          <Alert variant="destructive">
            <AlertDescription>{t("insufficientBalance")}</AlertDescription>
          </Alert>
        )}
        {quoteMessage && amountIn !== null && amountIn > 0n && (
          <Alert variant="destructive">
            <AlertDescription>{quoteMessage}</AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          className="h-11 w-full rounded-xl"
          disabled={!canReview}
          onClick={openReview}
        >
          {quoteLoading ? t("fetchingQuote") : t("review")}
        </Button>
      </div>

      <TradeTokenPicker
        open={picker === "in"}
        onOpenChange={(o) => setPicker(o ? "in" : null)}
        tokens={tokens}
        selectedId={tokenIn?.ledgerId ?? null}
        onSelect={pickIn}
        title={t("selectPay")}
      />
      <TradeTokenPicker
        open={picker === "out"}
        onOpenChange={(o) => setPicker(o ? "out" : null)}
        tokens={tokens.filter((x) => x.ledgerId !== tokenIn?.ledgerId)}
        selectedId={tokenOut?.ledgerId ?? null}
        onSelect={pickOut}
        title={t("selectReceive")}
      />

      <TradeConfirmDrawer
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        identity={identity}
        tokenIn={tokenIn}
        tokenOut={tokenOut}
        amountIn={amountIn}
        amountOut={quote?.amountOut ?? null}
        trading={trading}
        onConfirm={handleConfirm}
      />
    </>
  )
}

function TradeAmountCard({
  label,
  token,
  amountText,
  fiatAmount,
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
  fiatAmount?: bigint | null
  onPickToken: () => void
  onAmountChange?: (v: string) => void
  readOnly?: boolean
  balance?: bigint
  maxHint?: bigint
  onMax?: () => void
  percentages?: readonly number[]
  onPercent?: (n: number) => void
}) {
  const t = useTranslations("trade")
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={onPickToken}
          className="flex shrink-0 items-center gap-2 rounded-full bg-muted/60 py-1.5 pl-1.5 pr-3 text-sm font-semibold"
        >
          {token ? <TokenLogo token={token} className="size-7" /> : null}
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
      {token && fiatAmount !== null && fiatAmount !== undefined && fiatAmount > 0n && (
        <div className="mt-1 flex justify-end">
          <TokenFiatHint ledgerId={token.ledgerId} amount={fiatAmount} decimals={token.decimals} />
        </div>
      )}
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
            <Button
              key={p}
              type="button"
              variant="outline"
              size="sm"
              className="h-7 flex-1 text-xs"
              onClick={() => onPercent(p)}
            >
              {p}%
            </Button>
          ))}
        </div>
      )}
    </div>
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
