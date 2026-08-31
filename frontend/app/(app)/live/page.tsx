"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { useSWRConfig } from "swr"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GradientBadge } from "@/components/ui/gradient-badge"
import { Spinner } from "@/components/ui/spinner"
import { LiveGuideInfo } from "@/components/live/live-guide-info"
import { AppPage } from "@/components/layout/dashboard/app-page"
import { useOwnProfile } from "@/hooks/wallet/useWalletData"
import { liveRoomKey } from "@/hooks/live/useLiveRoom"
import { canCreateLiveRoom } from "@/lib/live/access"
import { listPublicLiveRooms, liveStateLabel, type LiveRoomPublic } from "@/services/live/live"

function liveBadgeVariant(state: ReturnType<typeof liveStateLabel>) {
  if (state === "live") return "default" as const
  if (state === "paused") return "secondary" as const
  return "outline" as const
}

export default function LivePage() {
  const t = useTranslations("live")
  const { identity } = useAuth()
  const { mutate } = useSWRConfig()
  const { data: profile } = useOwnProfile()
  const canCreate = canCreateLiveRoom(profile?.username[0])
  const [rooms, setRooms] = useState<LiveRoomPublic[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!identity) return
    listPublicLiveRooms(identity)
      .then((list) => {
        setRooms(list)
        for (const room of list) {
          void mutate(liveRoomKey(room.id), room, { revalidate: false })
        }
      })
      .finally(() => setLoading(false))
  }, [identity, mutate])

  return (
    <AppPage
      title={t("title")}
      description={t("subtitle")}
      accessory={<LiveGuideInfo />}
      actions={
        canCreate ? (
          <Button nativeButton={false} render={<Link href="/live/new" />} className="shrink-0">
            {t("newRoom")}
          </Button>
        ) : (
          <Button disabled className="shrink-0">
            {t("newRoom")}
          </Button>
        )
      }
    >
      {!canCreate && (
        <p className="text-sm text-muted-foreground">
          {t("createLockedHint")}{" "}
          <Link href="/username" className="font-medium text-primary underline-offset-4 hover:underline">
            {t("createLockedAction")}
          </Link>
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner className="size-6 text-muted-foreground" />
        </div>
      ) : rooms.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <ul className="space-y-2">
          {rooms.map((room) => {
            const state = liveStateLabel(room.state)
            return (
              <li
                key={room.id}
                className="flex items-center gap-3 rounded-2xl border bg-card px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{room.title}</span>
                    {state === "live" ? (
                      <GradientBadge>{t(`state.${state}`)}</GradientBadge>
                    ) : (
                      <Badge
                        variant={liveBadgeVariant(state)}
                        className="h-5 shrink-0 px-2 text-[10px] font-semibold uppercase tracking-wide"
                      >
                        {t(`state.${state}`)}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {room.hostUsername[0] ? `@${room.hostUsername[0]}` : t("host")} ·{" "}
                    {Number(room.peerCount)} {t("participants")}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="h-8 shrink-0 px-3 text-xs font-semibold"
                  nativeButton={false}
                  render={<Link href={`/live/${room.id}`} prefetch />}
                >
                  {t("join")}
                </Button>
              </li>
            )
          })}
        </ul>
      )}
    </AppPage>
  )
}
