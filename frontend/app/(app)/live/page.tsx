"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { LiveGuideInfo } from "@/components/live/live-guide-info"
import { listPublicLiveRooms, liveStateLabel, type LiveRoomPublic } from "@/services/live/live"

export default function LivePage() {
  const t = useTranslations("live")
  const { identity } = useAuth()
  const [rooms, setRooms] = useState<LiveRoomPublic[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!identity) return
    listPublicLiveRooms(identity)
      .then(setRooms)
      .finally(() => setLoading(false))
  }, [identity])

  return (
    <div className="space-y-6 pt-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-2">
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
          <LiveGuideInfo />
        </div>
        <Button nativeButton={false} render={<Link href="/live/new" />} className="shrink-0">
          {t("newRoom")}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner className="size-6 text-muted-foreground" />
        </div>
      ) : rooms.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <ul className="space-y-2">
          {rooms.map((room) => (
            <li key={room.id}>
              <Link
                href={`/live/${room.id}`}
                className="block rounded-2xl border bg-card px-4 py-3 transition-colors hover:bg-accent/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{room.title}</span>
                  <span className="text-xs text-muted-foreground">{t(`state.${liveStateLabel(room.state)}`)}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {room.hostUsername[0] ? `@${room.hostUsername[0]}` : t("host")} ·{" "}
                  {Number(room.peerCount)} {t("participants")}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
