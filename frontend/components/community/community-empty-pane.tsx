"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"

export function CommunityEmptyPane() {
  const t = useTranslations("community")

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="text-sm font-medium">{t("selectTitle")}</p>
      <p className="text-sm text-muted-foreground">{t("selectHint")}</p>
      <Button size="sm" nativeButton={false} render={<Link href="/channels/new" />}>
        {t("newChannel")}
      </Button>
    </div>
  )
}
