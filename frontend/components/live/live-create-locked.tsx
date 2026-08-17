"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ShoppingBag01Icon } from "@hugeicons/core-free-icons"

export function LiveCreateLocked() {
  const t = useTranslations("live")

  return (
    <div className="rounded-2xl border border-dashed px-5 py-10 text-center">
      <HugeiconsIcon icon={ShoppingBag01Icon} className="mx-auto size-8 text-muted-foreground" />
      <h2 className="pt-4 text-lg font-semibold tracking-tight">{t("createLockedTitle")}</h2>
      <p className="mx-auto max-w-sm pt-2 text-sm text-muted-foreground">{t("createLockedBody")}</p>
      <Button className="mt-6" nativeButton={false} render={<Link href="/username" />}>
        {t("createLockedAction")}
      </Button>
    </div>
  )
}
