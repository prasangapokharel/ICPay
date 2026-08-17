"use client"

import type { Principal } from "@icp-sdk/core/principal"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { Mic01Icon, MicOff01Icon } from "@hugeicons/core-free-icons"
import { avatarUriFor } from "@/lib/avatar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { LivePeer } from "@/services/live/live"

type LiveParticipantGridProps = {
  peers: LivePeer[]
  selfTabId: string
  selfUsername: string | null
  hostPrincipal: Principal
  micOnTabIds: ReadonlySet<string>
  speakingTabIds: ReadonlySet<string>
}

function peerLabel(peer: LivePeer, selfTabId: string, t: ReturnType<typeof useTranslations<"live">>) {
  if (peer.tabId === selfTabId) return t("gridYou")
  const name = peer.username[0]
  if (name) return `@${name}`
  return peer.principal.toText().slice(0, 8) + "…"
}

function peerSeed(peer: LivePeer, selfTabId: string, selfUsername: string | null) {
  if (peer.tabId === selfTabId && selfUsername) return selfUsername
  if (peer.username[0]) return peer.username[0]
  return peer.principal.toText()
}

export function LiveParticipantGrid({
  peers,
  selfTabId,
  selfUsername,
  hostPrincipal,
  micOnTabIds,
  speakingTabIds,
}: LiveParticipantGridProps) {
  const t = useTranslations("live")
  const hostText = hostPrincipal.toText()

  if (peers.length === 0) {
    return (
      <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
        {t("gridEmpty")}
      </p>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {peers.map((peer) => {
        const isSelf = peer.tabId === selfTabId
        const isHost = peer.principal.toText() === hostText
        const speaking = speakingTabIds.has(peer.tabId)
        const micOn = micOnTabIds.has(peer.tabId)
        const label = peerLabel(peer, selfTabId, t)
        const seed = peerSeed(peer, selfTabId, selfUsername)

        return (
          <div
            key={peer.tabId}
            className={cn(
              "relative flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center transition-shadow",
              speaking && "ring-2 ring-emerald-500/70 ring-offset-2 ring-offset-background"
            )}
          >
            <div className="relative">
              <Avatar size="lg" className="size-16 sm:size-20">
                <AvatarImage src={avatarUriFor(seed)} alt={label} />
                <AvatarFallback>{label.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              {(isSelf ? micOn : speaking) && (
                <span className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-background shadow-sm ring-1 ring-border">
                  <HugeiconsIcon
                    icon={micOn || speaking ? Mic01Icon : MicOff01Icon}
                    className={cn("size-3.5", (micOn || speaking) && "text-emerald-600 dark:text-emerald-400")}
                    strokeWidth={1.75}
                  />
                </span>
              )}
            </div>

            <div className="min-w-0 w-full space-y-1">
              <p className="truncate text-sm font-medium">{label}</p>
              <div className="flex flex-wrap items-center justify-center gap-1">
                {isHost && (
                  <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                    {t("host")}
                  </Badge>
                )}
                {speaking && !isSelf && (
                  <span className="text-[10px] font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                    {t("speaking")}
                  </span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
