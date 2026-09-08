"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { useAuth } from "@/components/auth/auth-provider"
import { LiveCreateForm } from "@/components/live/live-create-form"
import { LiveCreateLocked } from "@/components/live/live-create-locked"
import { AppPage } from "@/components/layout/dashboard/app-page"
import { useOwnProfile } from "@/hooks/wallet/useWalletData"
import { canCreateLiveRoom } from "@/lib/live/access"

export default function LiveNewPage() {
  const t = useTranslations("live")
  const { identity } = useAuth()
  const { data: profile } = useOwnProfile()
  const canCreate = canCreateLiveRoom(profile?.username[0])

  return (
    <AppPage
      title={t("newRoom")}
      description={t("newRoomHint")}
      back={
        <Link href="/live" className="text-xs text-muted-foreground hover:text-foreground">
          ← {t("title")}
        </Link>
      }
    >
      {canCreate ? <LiveCreateForm identity={identity} /> : <LiveCreateLocked />}
    </AppPage>
  )
}
