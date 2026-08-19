"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { useAuth } from "@/components/auth/auth-provider"
import { LiveCreateForm } from "@/components/live/live-create-form"
import { LiveCreateLocked } from "@/components/live/live-create-locked"
import { useOwnProfile } from "@/hooks/wallet/useWalletData"
import { canCreateLiveRoom } from "@/lib/live/access"

export default function LiveNewPage() {
  const t = useTranslations("live")
  const { identity } = useAuth()
  const { data: profile } = useOwnProfile()
  const canCreate = canCreateLiveRoom(profile?.username[0])

  return (
    <div className="space-y-6 pt-2">
      <div>
        <Link href="/live" className="text-xs text-muted-foreground hover:text-foreground">
          ← {t("title")}
        </Link>
        <h1 className="mt-1 text-xl font-bold tracking-tight">{t("newRoom")}</h1>
        <p className="text-sm text-muted-foreground">{t("newRoomHint")}</p>
      </div>
      {canCreate ? <LiveCreateForm identity={identity} /> : <LiveCreateLocked />}
    </div>
  )
}
