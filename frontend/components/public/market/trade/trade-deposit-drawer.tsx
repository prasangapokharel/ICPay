"use client"

import { useTranslations } from "next-intl"
import { useDepositAddress, useRefreshWallet } from "@/hooks/wallet/useWalletData"
import { useAuth } from "@/components/auth/auth-provider"
import { DepositAddressCard } from "@/components/deposit/deposit-address-card"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ICP_LEDGER_ID } from "@/services/tokens"
import { resolveTokenIcon } from "@/lib/token/icon"
import { useTokenRegistry } from "@/lib/token/registry"
import { icrc1Account } from "@/lib/wallet/accountId"
import { copyText } from "@/lib/wallet/utils"
import { useRefreshTradeBalances } from "@/hooks/trade/useTrade"

export function TradeDepositDrawer({
  open,
  onOpenChange,
  onOpenTransfer,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenTransfer?: () => void
}) {
  const tDeposit = useTranslations("deposit")
  const tTrade = useTranslations("marketTrade")
  const { isAuthenticated, identity, login } = useAuth()
  const { data, error, isLoading } = useDepositAddress()
  const registry = useTokenRegistry()
  const refreshWallet = useRefreshWallet()
  const refreshTradeBalances = useRefreshTradeBalances()
  const icpIcon = resolveTokenIcon(ICP_LEDGER_ID, undefined, registry)

  const icrcAddress = data ? icrc1Account(data.address.owner, data.address.subaccount[0]) : ""
  const accountId = data?.accountId ?? ""
  const principal = identity?.getPrincipal().toText()

  async function handleDone() {
    onOpenChange(false)
    await Promise.all([
      refreshWallet(),
      refreshTradeBalances(ICP_LEDGER_ID),
    ])
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto max-w-lg">
        <DrawerHeader className="text-center sm:text-left">
          <DrawerTitle className="text-lg font-semibold">{tDeposit("title")}</DrawerTitle>
          <DrawerDescription className="text-xs text-muted-foreground">
            {tDeposit("subtitle")}
          </DrawerDescription>
        </DrawerHeader>

        <div className="max-h-[75vh] overflow-y-auto px-4 pb-2">
          {!isAuthenticated ? (
            <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">{tDeposit("warning")}</p>
              <Button onClick={() => login()} size="sm">
                {tTrade("signInToTrade")}
              </Button>
            </div>
          ) : isLoading ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-9 w-full rounded-xl" />
              <Skeleton className="mx-auto size-48 rounded-2xl" />
              <Skeleton className="h-14 w-full rounded-2xl" />
            </div>
          ) : error ? (
            <Alert variant="destructive" className="my-4">
              <AlertDescription>
                {error instanceof Error ? error.message : tDeposit("loadFailed")}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="py-2">
              <DepositAddressCard
                accountId={accountId}
                icrcAddress={icrcAddress}
                principal={principal}
                logo={icpIcon}
                onCopy={copyText}
              />
            </div>
          )}
        </div>

        <DrawerFooter className="flex flex-row items-center justify-between gap-2 border-t border-border/40 pt-3">
          {onOpenTransfer ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => {
                onOpenChange(false)
                onOpenTransfer()
              }}
            >
              {tTrade("transfer")}
            </Button>
          ) : <div />}

          <DrawerClose
            render={
              <Button type="button" size="sm" onClick={handleDone}>
                {tTrade("cancel")}
              </Button>
            }
          />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
