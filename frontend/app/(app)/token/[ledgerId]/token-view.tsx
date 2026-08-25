"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DepositQrBlock } from "@/components/deposit/deposit-address-card"
import { TokenLogo } from "@/components/token/token-logo"
import { copyText, formatTokenAmount } from "@/lib/wallet/utils"
import { icrc1Account } from "@/lib/wallet/accountId"
import { resolveTokenIcon } from "@/lib/token/icon"
import { TokenFiatHint } from "@/components/token/token-fiat-hint"
import { useTokenRegistry } from "@/lib/token/registry"
import { useTokenHolding, useDepositAddress, useSelfCustodyBalance, useRefreshWallet } from "@/hooks/wallet/useWalletData"
import { useChainKeyDeposit } from "@/hooks/wallet/useChainKeyDeposit"
import { useRewrittenLastSegment } from "@/lib/routing/rewrittenRoute"
import { SelfCustodyCard } from "@/components/wallet/self-custody-card"
import { SendTokenDrawer } from "@/components/wallet/send-token-drawer"
import { SendSuccess } from "@/components/wallet/send-success"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { useAuth } from "@/components/auth/auth-provider"
import { transfer, type TransferMode } from "@/services/transfer/transfer"
import { isSwapToken } from "@/lib/swap/tokens"
import { type TokenHolding } from "@/services/tokens"

import { cn } from "@/lib/ui/utils"

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
  const registry = useTokenRegistry()
  const refreshWallet = useRefreshWallet()
  const [sendOpen, setSendOpen] = useState(false)
  const [sent, setSent] = useState<Sent | null>(null)
  const [showDeposit, setShowDeposit] = useState(false)

  const ledgerId = useRewrittenLastSegment()

  const { token, isLoading } = useTokenHolding(ledgerId || null)
  const { data: deposit } = useDepositAddress()
  const selfCustody = useSelfCustodyBalance(ledgerId || null)
  const { deposit: chainKeyDeposit } = useChainKeyDeposit(ledgerId || null)

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

  const icrcAddress = deposit
    ? icrc1Account(deposit.address.owner, deposit.address.subaccount[0])
    : ""
  const tokenIcon = resolveTokenIcon(token.ledgerId, token.logo, registry)

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
          <button
            type="button"
            aria-label={t("deposit")}
            onClick={() => setShowDeposit((v) => !v)}
            className="transition-transform active:scale-95"
          >
            <span
              className={cn(
                "flex size-11 items-center justify-center rounded-full",
                showDeposit ? "bg-primary" : "bg-gray-800"
              )}
            >
              <Image
                src={ACTION_ICONS.deposit}
                alt=""
                width={20}
                height={20}
                className="size-5 object-contain"
              />
            </span>
          </button>
          {isSwapToken(token.ledgerId) && (
            <Link
              href={`/swap?from=${token.ledgerId}`}
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

      <Collapsible open={showDeposit} onOpenChange={setShowDeposit} className="w-full">
        <CollapsibleContent
          keepMounted
          className="overflow-hidden data-open:animate-accordion-down data-closed:animate-accordion-up"
        >
          {!icrcAddress ? (
            <div className="flex justify-center py-10">
              <Spinner className="size-5 text-muted-foreground" />
            </div>
          ) : chainKeyDeposit ? (
            <Tabs defaultValue="icpay" className="w-full gap-0">
              <TabsList variant="line" className="w-full justify-center border-b border-border">
                <TabsTrigger value="icpay" className="flex-1 text-xs sm:text-sm">
                  {t("depositIcpayTab")}
                </TabsTrigger>
                <TabsTrigger value="native" className="flex-1 text-xs sm:text-sm">
                  {chainKeyDeposit.asset}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="icpay" className="mt-5 space-y-4">
                <p className="text-center text-xs leading-relaxed text-muted-foreground">
                  {t("depositIcpayNote", { symbol: token.symbol })}
                </p>
                <DepositQrBlock value={icrcAddress} logo={tokenIcon} onCopy={copyText} />
              </TabsContent>
              <TabsContent value="native" className="mt-5 space-y-4">
                <p className="text-center text-xs leading-relaxed text-muted-foreground">
                  {t("depositNativeNote", {
                    asset: chainKeyDeposit.asset,
                    network: chainKeyDeposit.asset === "BTC" ? "Bitcoin" : "Ethereum",
                    symbol: token.symbol,
                  })}
                </p>
                <DepositQrBlock
                  value={chainKeyDeposit.address}
                  logo={tokenIcon}
                  onCopy={copyText}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-4">
              <p className="text-center text-xs leading-relaxed text-muted-foreground">
                {t("depositIcpayNote", { symbol: token.symbol })}
              </p>
              <DepositQrBlock value={icrcAddress} logo={tokenIcon} onCopy={copyText} />
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
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
