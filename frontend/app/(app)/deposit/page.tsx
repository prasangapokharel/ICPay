"use client"

import { useState } from "react"
import { DepositAddressCard } from "@/components/deposit/deposit-address-card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { HugeiconsIcon } from "@hugeicons/react"
import { RefreshIcon, Alert02Icon } from "@hugeicons/core-free-icons"
import { getWalletActor } from "@/services/wallet"
import { useAuth } from "@/components/auth/auth-provider"
import { useDepositAddress, useRefreshWallet } from "@/hooks/use-wallet-data"
import { icrc1Account } from "@/lib/account-id"
import { formatAmount } from "@/lib/wallet-utils"
import { toast } from "@/components/ui/toast"

export default function DepositPage() {
  const { identity } = useAuth()
  const { data, error, isLoading } = useDepositAddress()
  const refreshWallet = useRefreshWallet()
  const [checking, setChecking] = useState(false)

  const icrcAddress = data ? icrc1Account(data.address.owner, data.address.subaccount[0]) : ""
  const accountId = data?.accountId ?? ""

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement("textarea")
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand("copy")
      document.body.removeChild(ta)
    }
    toast.add({ title: "Address copied" })
  }

  const handleCheck = async () => {
    if (!identity) return
    setChecking(true)
    try {
      const actor = await getWalletActor(identity)
      const result = await actor.syncDeposits()
      if ("ok" in result) {
        toast.add({
          title: "Deposit received",
          description: `${formatAmount(result.ok.amount)} ICP credited to your balance.`,
        })
        refreshWallet()
      } else {
        toast.add({ title: "No new deposits", description: result.err })
      }
    } catch (e) {
      console.error(e)
      toast.add({ title: "Could not check deposits" })
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="space-y-6 pt-2">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Deposit</h1>
        <p className="text-sm text-muted-foreground">Send ICP to your wallet address</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="mx-auto size-52 rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>
            {error instanceof Error ? error.message : "Failed to load deposit address"}
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <DepositAddressCard
            accountId={accountId}
            icrcAddress={icrcAddress}
            onCopy={handleCopy}
          />

          <p className="flex items-start gap-2 text-xs text-muted-foreground">
            <HugeiconsIcon icon={Alert02Icon} className="mt-px size-3.5 shrink-0" />
            Only send ICP to this address. Other tokens will be lost.
          </p>

          <Button
            variant="outline"
            className="h-11 w-full"
            onClick={handleCheck}
            disabled={checking}
          >
            {checking ? <Spinner className="size-4" /> : <HugeiconsIcon icon={RefreshIcon} className="size-4" />}
            {checking ? "Checking…" : "Check for deposits"}
          </Button>
        </>
      )}
    </div>
  )
}
