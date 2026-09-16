"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  Exchange01Icon,
  LinkSquare02Icon,
} from "@hugeicons/core-free-icons"
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
import { type TokenHolding } from "@/services/tokens"
import { TokenHistoryList } from "@/components/token/token-history-list"
import { TokenStandardsBadge } from "@/components/token/token-standards-badge"
import { BtcWithdrawalList } from "@/components/chainkey/btc-withdrawal-list"
import { CKBTC_LEDGER_ID } from "@/services/chainkey/constants"

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

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => setSendOpen(true)}
            className="h-9 gap-1.5 rounded-full px-4 text-xs font-medium cursor-pointer"
          >
            <HugeiconsIcon icon={ArrowUp01Icon} className="size-3.5" strokeWidth={2} />
            <span>{t("send")}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href={`/token/${token.ledgerId}/deposit`} prefetch />}
            className="h-9 gap-1.5 rounded-full px-4 text-xs font-medium cursor-pointer"
          >
            <HugeiconsIcon icon={ArrowDown01Icon} className="size-3.5" strokeWidth={2} />
            <span>{t("deposit")}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href={`/trade?from=${token.ledgerId}`} prefetch />}
            className="h-9 gap-1.5 rounded-full px-4 text-xs font-medium cursor-pointer"
          >
            <HugeiconsIcon icon={Exchange01Icon} className="size-3.5" strokeWidth={2} />
            <span>{t("swap")}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={
              <a
                href={`https://app.icpswap.com/swap?input=ryjl3-tyaaa-aaaaa-aaaba-cai&output=${token.ledgerId}`}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
            className="h-9 gap-1.5 rounded-full px-4 text-xs font-medium cursor-pointer"
          >
            <HugeiconsIcon icon={LinkSquare02Icon} className="size-3.5" strokeWidth={2} />
            <span>Market</span>
          </Button>
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
