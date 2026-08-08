"use client"

import { useState } from "react"
import { DepositAddressCard } from "@/components/deposit/deposit-address-card"
import { PaymentLinkDialog } from "@/components/deposit/payment-link-card"
import { useTranslations } from "next-intl"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert02Icon, RefreshIcon } from "@hugeicons/core-free-icons"
import { useDepositAddress, useRefreshWallet, useOwnProfile } from "@/hooks/use-wallet-data"
import { useAuth } from "@/components/auth/auth-provider"
import { syncDeposits } from "@/services/deposit/deposit"
import { ICP_LEDGER_ID } from "@/services/tokens"
import { icrc1Account } from "@/lib/account-id"
import { copyText } from "@/lib/wallet-utils"

export default function DepositPage() {
  const t = useTranslations("deposit")
  const tp = useTranslations("paymentLink")
  const { data, error, isLoading } = useDepositAddress()
  const { identity } = useAuth()
  const refreshWallet = useRefreshWallet()
  const [requesting, setRequesting] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncNote, setSyncNote] = useState<string | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)

  // Funds land on the ledger without the canister knowing, so history stays
  // empty until someone asks it to look. An update call, so it is only ever a
  // deliberate tap -- never on mount, never on focus.
  const handleSync = async () => {
    setSyncing(true)
    setSyncNote(null)
    setSyncError(null)
    const result = await syncDeposits(identity, ICP_LEDGER_ID)
    setSyncing(false)
    if ("err" in result) {
      // Backend error text is not localized. "No new deposits found" is the
      // ordinary answer for anyone who has not just been paid, so it alone
      // stays in the neutral note; any other failure (e.g. a rate limit) gets
      // the destructive styling.
      if (result.err === "No new deposits found") {
        setSyncNote(result.err)
      } else {
        setSyncError(result.err)
      }
      return
    }
    refreshWallet()
    setSyncNote(t("syncFound"))
  }

  const icrcAddress = data ? icrc1Account(data.address.owner, data.address.subaccount[0]) : ""
  const accountId = data?.accountId ?? ""

  // Shares the profile cache with /profile, so arriving from there refetches
  // nothing. The address tabs below have no use for a username, so it only
  // matters once the request toggle is on.
  const { data: user } = useOwnProfile()

  return (
    <div className="space-y-6 pt-2">
      <div>
        <h1 className="text-xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* An address answers "where do I send it". A payment link answers "pay me
          this, for this". Same page because both are how a user gets paid, a
          toggle because only one of them is wanted at a time. */}
      <div className="flex items-center justify-between gap-3 rounded-2xl border p-4">
        <div className="min-w-0">
          <Label htmlFor="request-toggle" className="text-sm font-medium">
            {tp("toggleLabel")}
          </Label>
          <p className="mt-0.5 text-xs text-muted-foreground">{tp("toggleHint")}</p>
        </div>
        <Switch id="request-toggle" checked={requesting} onCheckedChange={setRequesting} />
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
            {error instanceof Error ? error.message : t("loadFailed")}
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <DepositAddressCard
            accountId={accountId}
            icrcAddress={icrcAddress}
            principal={identity?.getPrincipal().toText()}
            onCopy={copyText}
          />

          <p className="flex items-start gap-2 text-xs text-muted-foreground">
            <HugeiconsIcon icon={Alert02Icon} className="mt-px size-3.5 shrink-0" />
            {t("warning")}
          </p>

          {/* Balances are read live off the ledger, so an arrival shows up in
              the wallet on its own. This is what writes it into history. */}
          <div className="space-y-2 rounded-2xl border p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">{t("syncTitle")}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{t("syncHint")}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSync}
                disabled={syncing}
                className="shrink-0"
              >
                {syncing ? (
                  <Spinner className="size-3.5" />
                ) : (
                  <HugeiconsIcon icon={RefreshIcon} className="size-3.5" />
                )}
                {t("syncAction")}
              </Button>
            </div>
            {/* Neutral, not destructive: "no new deposits" is the ordinary
                answer for anyone who has not just been paid. */}
            {syncNote && <p className="text-xs text-muted-foreground">{syncNote}</p>}
            {syncError && (
              <Alert variant="destructive">
                <AlertDescription>{syncError}</AlertDescription>
              </Alert>
            )}
          </div>
        </>
      )}

      {/* The request form lives in a modal, opened by the toggle above, so the
          deposit address stays the page's default view. */}
      <PaymentLinkDialog
        open={requesting}
        onOpenChange={setRequesting}
        username={user?.username?.[0]}
      />
    </div>
  )
}
