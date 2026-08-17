"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { useAuth } from "@/components/auth/auth-provider"
import { LiveCreateForm } from "@/components/live/live-create-form"

export default function LiveNewPage() {
  const t = useTranslations("live")
  const { identity } = useAuth()

  return (
    <div className="space-y-6 pt-2">
      <div>
        <Link href="/live" className="text-xs text-muted-foreground hover:text-foreground">
          ← {t("title")}
        </Link>
        <h1 className="mt-1 text-xl font-bold tracking-tight">{t("newRoom")}</h1>
        <p className="text-sm text-muted-foreground">{t("newRoomHint")}</p>
      </div>
      <LiveCreateForm identity={identity} />
    </div>
  )
}
