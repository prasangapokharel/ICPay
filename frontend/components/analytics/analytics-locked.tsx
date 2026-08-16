"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ShoppingBag01Icon } from "@hugeicons/core-free-icons"

export function AnalyticsLocked() {
  const t = useTranslations("analytics")

  return (
    <div className="rounded-2xl border border-dashed px-5 py-10 text-center">
      <HugeiconsIcon icon={ShoppingBag01Icon} className="mx-auto size-8 text-muted-foreground" />
      <h2 className="pt-4 text-lg font-semibold tracking-tight">{t("lockedTitle")}</h2>
      <p className="mx-auto pt-2 max-w-sm text-sm text-muted-foreground">{t("lockedBody")}</p>
      <Button className="mt-6" nativeButton={false} render={<Link href="/username" />}>
        {t("lockedAction")}
      </Button>
    </div>
  )
}
