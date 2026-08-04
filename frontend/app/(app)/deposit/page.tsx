"use client"

import { DepositAddressCard } from "@/components/deposit/deposit-address-card"
import { useTranslations } from "next-intl"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert02Icon } from "@hugeicons/core-free-icons"
import { useDepositAddress } from "@/hooks/use-wallet-data"
import { icrc1Account } from "@/lib/account-id"
import { copyText } from "@/lib/wallet-utils"

export default function DepositPage() {
  const t = useTranslations("deposit")
  const { data, error, isLoading } = useDepositAddress()

  const icrcAddress = data ? icrc1Account(data.address.owner, data.address.subaccount[0]) : ""
  const accountId = data?.accountId ?? ""

  return (
    <div className="space-y-6 pt-2">
      <div>
        <h1 className="text-xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
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
            onCopy={copyText}
          />

          <p className="flex items-start gap-2 text-xs text-muted-foreground">
            <HugeiconsIcon icon={Alert02Icon} className="mt-px size-3.5 shrink-0" />
            {t("warning")}
          </p>
        </>
      )}
    </div>
  )
}
