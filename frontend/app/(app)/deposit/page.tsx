"use client"

import { useState } from "react"
import useSWR from "swr"
import { DepositAddressCard } from "@/components/deposit/deposit-address-card"
import { PaymentLinkDialog } from "@/components/deposit/payment-link-card"
import { useTranslations } from "next-intl"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert02Icon } from "@hugeicons/core-free-icons"
import { useDepositAddress } from "@/hooks/use-wallet-data"
import { useAuth } from "@/components/auth/auth-provider"
import { getProfile } from "@/services/profile/profile"
import { icrc1Account } from "@/lib/account-id"
import { copyText } from "@/lib/wallet-utils"

export default function DepositPage() {
  const t = useTranslations("deposit")
  const tp = useTranslations("paymentLink")
  const { data, error, isLoading } = useDepositAddress()
  const { identity } = useAuth()
  const [requesting, setRequesting] = useState(false)

  const icrcAddress = data ? icrc1Account(data.address.owner, data.address.subaccount[0]) : ""
  const accountId = data?.accountId ?? ""

  // getProfile is a query; the same record inside getDashboard rides a ~6.6s
  // update call. Keyed as the profile page keys it, so arriving from there reuses
  // the cache, and only fetched once the toggle is on -- the address tabs below
  // have no use for a username.
  const principal = identity?.getPrincipal().toText() ?? ""
  const { data: user } = useSWR(
    requesting && identity ? (["profile", principal] as const) : null,
    () => getProfile(identity),
    { revalidateOnFocus: false, revalidateIfStale: false, keepPreviousData: true }
  )

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
