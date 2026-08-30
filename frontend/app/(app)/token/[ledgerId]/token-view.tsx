"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TokenLogo } from "@/components/token/token-logo"
import { formatTokenAmount } from "@/lib/wallet/utils"
import { TokenFiatHint } from "@/components/token/token-fiat-hint"
import { useTokenHolding, useSelfCustodyBalance, useRefreshWallet } from "@/hooks/wallet/useWalletData"
import { useTokenLedgerId } from "@/lib/routing/rewrittenRoute"
import { SelfCustodyCard } from "@/components/wallet/self-custody-card"
import { SendTokenDrawer } from "@/components/wallet/send-token-drawer"
import { SendSuccess } from "@/components/wallet/send-success"
import { useAuth } from "@/components/auth/auth-provider"
import { transfer, type TransferMode } from "@/services/transfer/transfer"
import { isSwapToken } from "@/lib/swap/tokens"
import { type TokenHolding } from "@/services/tokens"
import { TokenHistoryList } from "@/components/token/token-history-list"
import { TokenStandardsBadge } from "@/components/token/token-standards-badge"
import { BtcWithdrawalList } from "@/components/chainkey/btc-withdrawal-list"
import { CKBTC_LEDGER_ID } from "@/services/chainkey/constants"

const ACTION_ICONS = {
  send: "/images/dashboard/icons8-circled-up-right-48.png",
  deposit: "/images/dashboard/icons8-circled-down-left-48.png",
  swap: "/images/dashboard/icons8-dividends-48.png",
} as const

type Sent = { amount: bigint; recipient: string; blockIndex: bigint; memo?: string }

export function TokenView() {
  const t = useTranslations("token")
  const router = useRouter()
  const { identity } = useAuth()
  const refreshWallet = useRefreshWallet()
  const [sendOpen, setSendOpen] = useState(false)
  const [sent, setSent] = useState<Sent | null>(null)

  const ledgerId = useTokenLedgerId()

  const { token, isLoading } = useTokenHolding(ledgerId || null)
  const selfCustody = useSelfCustodyBalance(ledgerId || null)

  if (isLoading || !ledgerId) return <TokenLoading />

  if (!token) {
    return (
      <div className="space-y-4 pt-4">
        <BackButton onClick={() => router.push("/wallet")} label={t("back")} />
        <Alert variant="destructive">
          <AlertDescription>{t("notFound")}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const handleSend = async (
    mode: TransferMode,
    to: string,
    amount: bigint,
    memo?: string,
    subaccount?: Uint8Array
  ) => {
    const result = await transfer(identity, token.ledgerId, mode, to, amount, memo, subaccount)
    if ("err" in result) return result.err
    refreshWallet()
    setSent({
      amount,
      recipient: mode === "username" ? `@${to}` : to,
      blockIndex: result.ok.blockIndex,
      memo,
    })
    return null
  }

  if (sent) {
    return (
      <SendSuccess
        amount={sent.amount}
        recipient={sent.recipient}
        blockIndex={sent.blockIndex}
        memo={sent.memo}
        symbol={token.symbol}
        decimals={token.decimals}
        onDone={() => setSent(null)}
      />
    )
  }

  return (
    <div className="space-y-6 pt-2">
      <BackButton onClick={() => router.push("/wallet")} label={t("back")} />

      <div>
        <div className="flex flex-col items-center gap-3 text-center">
          <TokenLogo token={token} className="size-14" />
          <p className="text-3xl font-bold tracking-tight tabular-nums">
            {formatTokenAmount(token.balance, token.decimals, token.decimals)}
          </p>
          <p className="text-sm font-medium text-muted-foreground">{token.symbol}</p>
          {token.name !== token.symbol && (
            <p className="text-xs text-muted-foreground">{token.name}</p>
          )}
          <TokenValue token={token} />
          <TokenStandardsBadge ledgerId={token.ledgerId} />
        </div>

        <div className="mt-5 flex justify-center gap-10">
          <button
            type="button"
            aria-label={t("send")}
            onClick={() => setSendOpen(true)}
            className="transition-transform active:scale-95"
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-gray-800">
              <Image
                src={ACTION_ICONS.send}
                alt=""
                width={20}
                height={20}
                className="size-5 object-contain"
              />
            </span>
          </button>
          <Link
            href={`/token/${token.ledgerId}/deposit`}
            prefetch
            aria-label={t("deposit")}
            className="transition-transform active:scale-95"
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-gray-800">
              <Image
                src={ACTION_ICONS.deposit}
                alt=""
                width={20}
                height={20}
                className="size-5 object-contain"
              />
            </span>
          </Link>
          {isSwapToken(token.ledgerId) && (
            <Link
              href={`/trade?from=${token.ledgerId}`}
              prefetch
              aria-label={t("swap")}
              className="transition-transform active:scale-95"
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-gray-800">
                <Image
                  src={ACTION_ICONS.swap}
                  alt=""
                  width={20}
                  height={20}
                  className="size-5 object-contain"
                />
              </span>
            </Link>
          )}
        </div>
      </div>

      <SendTokenDrawer
        open={sendOpen}
        onOpenChange={setSendOpen}
        token={token}
        onSend={handleSend}
      />

      {selfCustody !== undefined && selfCustody > 0n && (
        <SelfCustodyCard token={token} balance={selfCustody} />
      )}

      {token.ledgerId === CKBTC_LEDGER_ID ? (
        <BtcWithdrawalList ledgerId={token.ledgerId} />
      ) : null}

      <div className="space-y-2">
        <h2 className="text-sm font-semibold">{t("historyTitle")}</h2>
        <TokenHistoryList key={token.ledgerId} token={token} />
      </div>
    </div>
  )
}

function BackButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <Button variant="ghost" size="sm" className="-ml-2" onClick={onClick}>
      {label}
    </Button>
  )
}

function TokenValue({ token }: { token: TokenHolding }) {
  return (
    <TokenFiatHint
      ledgerId={token.ledgerId}
      amount={token.balance}
      decimals={token.decimals}
      className="text-sm font-medium text-muted-foreground tabular-nums"
    />
  )
}

function TokenLoading() {
  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <Spinner className="size-6 text-muted-foreground" />
    </div>
  )
}
