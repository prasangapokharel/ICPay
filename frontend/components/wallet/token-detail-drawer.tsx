"use client"

import { useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  Copy01Icon,
  Exchange01Icon,
  LinkSquare02Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { TokenLogo } from "@/components/token/token-logo"
import { formatTokenAmount, copyText } from "@/lib/wallet/utils"
import { TokenFiatHint } from "@/components/token/token-fiat-hint"
import { SelfCustodyCard } from "@/components/wallet/self-custody-card"
import { SendTokenDrawer } from "@/components/wallet/send-token-drawer"
import { SendSuccess } from "@/components/wallet/send-success"
import { useAuth } from "@/components/auth/auth-provider"
import { transfer, type TransferMode } from "@/services/transfer/transfer"
import type { TokenHolding } from "@/services/tokens"
import { TokenHistoryList } from "@/components/token/token-history-list"
import { TokenStandardsBadge } from "@/components/token/token-standards-badge"
import { BtcWithdrawalList } from "@/components/chainkey/btc-withdrawal-list"
import { CKBTC_LEDGER_ID } from "@/services/chainkey/constants"
import { useDepositAddress, useRefreshWallet, useSelfCustodyBalance } from "@/hooks/wallet/useWalletData"
import { DepositQrBlock } from "@/components/deposit/deposit-address-card"
import { icrc1Account } from "@/lib/wallet/accountId"
import { resolveTokenIcon } from "@/lib/token/icon"
import { useTokenRegistry } from "@/lib/token/registry"
import { cn } from "@/lib/ui/utils"

type Sent = { amount: bigint; recipient: string; blockIndex: bigint; memo?: string }

export function TokenDetailDrawer({
  open,
  onOpenChange,
  token,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  token: TokenHolding | null
}) {
  const t = useTranslations("token")
  const tw = useTranslations("wallet")
  const isMobile = useIsMobile()
  const { identity } = useAuth()
  const refreshWallet = useRefreshWallet()
  const registry = useTokenRegistry()

  const [sendOpen, setSendOpen] = useState(false)
  const [sent, setSent] = useState<Sent | null>(null)
  const [showDeposit, setShowDeposit] = useState(false)
  const [copiedId, setCopiedId] = useState(false)

  const selfCustody = useSelfCustodyBalance(token?.ledgerId ?? null)
  const { data: deposit } = useDepositAddress()

  if (!token) return null

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

  const handleCopyLedger = () => {
    copyText(token.ledgerId)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  return (
    <>
      <Drawer
        open={open}
        onOpenChange={onOpenChange}
        showSwipeHandle={isMobile}
        swipeDirection={isMobile ? "down" : "right"}
      >
        <DrawerContent className="data-[swipe-axis=x]:sm:w-[440px] data-[swipe-axis=x]:sm:max-w-[440px] flex flex-col h-full max-h-[92dvh] sm:max-h-dvh">
          <DrawerHeader className="border-b border-border/60 pb-3">
            <div className="flex items-center gap-3">
              <TokenLogo token={token} className="size-10 shrink-0" />
              <div className="min-w-0 flex-1 text-left">
                <DrawerTitle className="truncate text-base font-semibold">
                  {token.name}
                </DrawerTitle>
                <DrawerDescription className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{token.symbol}</span>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={handleCopyLedger}
                    className="inline-flex items-center gap-1 rounded hover:text-foreground cursor-pointer transition-colors"
                    title={token.ledgerId}
                  >
                    <span>{token.ledgerId.slice(0, 5)}...{token.ledgerId.slice(-3)}</span>
                    <HugeiconsIcon
                      icon={copiedId ? Tick02Icon : Copy01Icon}
                      className={cn("size-3", copiedId && "text-emerald-500")}
                    />
                  </button>
                </DrawerDescription>
              </div>
              <TokenStandardsBadge ledgerId={token.ledgerId} />
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Balance & Valuation Hero */}
            <div className="rounded-2xl border border-border/60 bg-muted/30 p-5 text-center">
              <p className="text-xs font-medium text-muted-foreground">{tw("tokens")}</p>
              <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums">
                {formatTokenAmount(token.balance, token.decimals, token.decimals)}
              </p>
              <div className="mt-1">
                <TokenFiatHint
                  ledgerId={token.ledgerId}
                  amount={token.balance}
                  decimals={token.decimals}
                  className="text-xs font-medium text-muted-foreground tabular-nums"
                />
              </div>

              {/* Action Buttons */}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <Button
                  variant="default"
                  size="sm"
                  type="button"
                  onClick={() => setSendOpen(true)}
                  className="h-8 gap-1.5 rounded-full px-3.5 text-xs font-medium cursor-pointer"
                >
                  <HugeiconsIcon icon={ArrowUp01Icon} className="size-3.5" strokeWidth={2} />
                  <span>{t("send")}</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setShowDeposit(!showDeposit)}
                  className="h-8 gap-1.5 rounded-full px-3.5 text-xs font-medium cursor-pointer"
                >
                  <HugeiconsIcon icon={ArrowDown01Icon} className="size-3.5" strokeWidth={2} />
                  <span>{t("deposit")}</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  nativeButton={false}
                  render={<Link href={`/trade?from=${token.ledgerId}`} />}
                  className="h-8 gap-1.5 rounded-full px-3.5 text-xs font-medium cursor-pointer"
                >
                  <HugeiconsIcon icon={Exchange01Icon} className="size-3.5" strokeWidth={2} />
                  <span>{t("swap")}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  nativeButton={false}
                  render={
                    <a
                      href={`https://app.icpswap.com/swap?input=ryjl3-tyaaa-aaaaa-aaaba-cai&output=${token.ledgerId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                  className="h-8 gap-1 rounded-full px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <HugeiconsIcon icon={LinkSquare02Icon} className="size-3.5" strokeWidth={2} />
                  <span>Market</span>
                </Button>
              </div>
            </div>

            {/* In-drawer Deposit Section */}
            {showDeposit && icrcAddress ? (
              <div className="rounded-2xl border border-border/60 bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    {t("deposit")} {token.symbol}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[11px]"
                    onClick={() => setShowDeposit(false)}
                  >
                    Close
                  </Button>
                </div>
                <DepositQrBlock
                  value={icrcAddress}
                  hint="Send to your personal ICPay subaccount"
                  onCopy={copyText}
                  logo={tokenIcon}
                />
              </div>
            ) : null}

            {/* Self-Custody Alert (if funds held at principal directly) */}
            {selfCustody !== undefined && selfCustody > 0n && (
              <SelfCustodyCard token={token} balance={selfCustody} />
            )}

            {/* ChainKey BTC pending withdrawals */}
            {token.ledgerId === CKBTC_LEDGER_ID ? (
              <BtcWithdrawalList ledgerId={token.ledgerId} />
            ) : null}

            {/* Token History */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("historyTitle")}
              </h3>
              <TokenHistoryList key={token.ledgerId} token={token} />
            </div>
          </div>

          <DrawerFooter className="border-t border-border/60 pt-2 pb-3">
            <DrawerClose render={<Button variant="outline" className="w-full text-xs h-8">Close</Button>} />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Nested Send Token Drawer */}
      <SendTokenDrawer
        open={sendOpen}
        onOpenChange={setSendOpen}
        token={token}
        onSend={handleSend}
      />

      {/* Success Dialog */}
      {sent ? (
        <SendSuccess
          amount={sent.amount}
          recipient={sent.recipient}
          blockIndex={sent.blockIndex}
          memo={sent.memo}
          symbol={token.symbol}
          decimals={token.decimals}
          onDone={() => setSent(null)}
        />
      ) : null}
    </>
  )
}
