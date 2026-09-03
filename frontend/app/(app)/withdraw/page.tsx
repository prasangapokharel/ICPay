"use client"

import { Suspense } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { Clock01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AppPage } from "@/components/layout/dashboard/app-page"
import { InternalTransferForm } from "@/components/withdraw/internal-transfer-form"

export default function WithdrawPage() {
  const t = useTranslations("withdraw")

  return (
    <AppPage
      title={t("title")}
      description={t("subtitle")}
      className="mx-auto w-full max-w-lg"
      actions={
        <Button
          variant="ghost"
          size="icon"
          nativeButton={false}
          render={<Link href="/transactions" />}
          aria-label={t("history")}
        >
          <HugeiconsIcon icon={Clock01Icon} className="size-5" strokeWidth={1.75} />
        </Button>
      }
    >
      <Suspense
        fallback={
          <div className="space-y-3">
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        }
      >
        <InternalTransferForm />
      </Suspense>
    </AppPage>
  )
}
