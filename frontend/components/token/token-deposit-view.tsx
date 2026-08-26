"use client"

import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DepositAddressCard,
  DepositQrBlock,
} from "@/components/deposit/deposit-address-card"
import { ChainKeyDepositPanel } from "@/components/chainkey/chain-key-deposit-panel"
import { TokenLogo } from "@/components/token/token-logo"
import { useAuth } from "@/components/auth/auth-provider"
import { useChainKeyDeposit } from "@/hooks/wallet/useChainKeyDeposit"
import { useDepositAddress, useTokenHolding } from "@/hooks/wallet/useWalletData"
import { useTokenLedgerId } from "@/lib/routing/rewrittenRoute"
import { resolveTokenIcon } from "@/lib/token/icon"
import { useTokenRegistry } from "@/lib/token/registry"
import { icrc1Account } from "@/lib/wallet/accountId"
import { copyText } from "@/lib/wallet/utils"
import { isChainKeyLedger } from "@/services/chainkey/deposits"
import { ICP_LEDGER_ID } from "@/services/tokens"

export function TokenDepositView() {
  const t = useTranslations("token")
  const router = useRouter()
  const { identity } = useAuth()
  const registry = useTokenRegistry()
  const ledgerId = useTokenLedgerId()

  const { token, isLoading } = useTokenHolding(ledgerId || null)
  const { data: deposit, isLoading: depositLoading } = useDepositAddress()
  const { deposit: chainKeyDeposit } = useChainKeyDeposit(ledgerId || null)

  if (isLoading || !ledgerId) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    )
  }

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

  const tokenIcon = resolveTokenIcon(token.ledgerId, token.logo, registry)
  const icrcAddress = deposit
    ? icrc1Account(deposit.address.owner, deposit.address.subaccount[0])
    : ""
  const isIcp = token.ledgerId === ICP_LEDGER_ID

  return (
    <div className="space-y-6 pt-2">
      <BackButton
        onClick={() => router.push(`/token/${token.ledgerId}`)}
        label={token.symbol}
      />

      <div className="flex items-center justify-center gap-2.5">
        <TokenLogo token={token} className="size-10" />
        <h1 className="text-xl font-bold tracking-tight">{token.symbol}</h1>
      </div>

      {depositLoading || !icrcAddress ? (
        <div className="flex justify-center py-12">
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
          <TabsContent value="icpay" className="mt-6 space-y-4">
            <DepositBody
              symbol={token.symbol}
              isIcp={isIcp}
              icrcAddress={icrcAddress}
              accountId={deposit?.accountId}
              principal={identity?.getPrincipal().toText()}
              logo={tokenIcon}
            />
          </TabsContent>
          <TabsContent value="native" className="mt-6 space-y-4">
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
            {isChainKeyLedger(token.ledgerId) ? (
              <ChainKeyDepositPanel ledgerId={token.ledgerId} />
            ) : null}
            <Warning symbol={token.symbol} />
          </TabsContent>
        </Tabs>
      ) : (
        <DepositBody
          symbol={token.symbol}
          isIcp={isIcp}
          icrcAddress={icrcAddress}
          accountId={deposit?.accountId}
          principal={identity?.getPrincipal().toText()}
          logo={tokenIcon}
        />
      )}
    </div>
  )
}

function DepositBody({
  symbol,
  isIcp,
  icrcAddress,
  accountId,
  principal,
  logo,
}: {
  symbol: string
  isIcp: boolean
  icrcAddress: string
  accountId?: string
  principal?: string
  logo?: string
}) {
  return (
    <div className="space-y-4">
      {isIcp ? (
        <DepositAddressCard
          icrcAddress={icrcAddress}
          accountId={accountId}
          principal={principal}
          logo={logo}
          onCopy={copyText}
          hideHint
        />
      ) : (
        <DepositQrBlock value={icrcAddress} logo={logo} onCopy={copyText} />
      )}
      <Warning symbol={symbol} />
    </div>
  )
}

function Warning({ symbol }: { symbol: string }) {
  const t = useTranslations("token")
  return (
    <Alert>
      <AlertDescription className="text-center text-xs">
        {t("warning", { symbol })}
      </AlertDescription>
    </Alert>
  )
}

function BackButton({ onClick, label }: { onClick: () => void; label: string }) {
  const t = useTranslations("common")
  return (
    <Button variant="ghost" size="sm" className="-ml-2" onClick={onClick}>
      ← {label || t("back")}
    </Button>
  )
}
