"use client"

import type { Principal } from "@icp-sdk/core/principal"
import { useTranslations } from "next-intl"
import { avatarUriFor } from "@/lib/profile/avatar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { PremiumBadge } from "@/components/verifed/premium-badge"
import { isPremiumHandle } from "@/lib/verified/premiumTick"
import { cn } from "@/lib/ui/utils"
import type { LivePeer } from "@/services/live/live"

type LiveParticipantGridProps = {
  peers: LivePeer[]
  selfTabId: string
  selfUsername: string | null
  hostPrincipal: Principal
  micOnTabIds: ReadonlySet<string>
  speakingTabIds: ReadonlySet<string>
}

function bareHandle(name: string) {
  return name.startsWith("@") ? name.slice(1) : name
}

function peerHandle(peer: LivePeer, selfTabId: string, selfUsername: string | null) {
  if (peer.tabId === selfTabId) return selfUsername
  return peer.username[0] ?? null
}

function peerSeed(peer: LivePeer, selfTabId: string, selfUsername: string | null) {
  const handle = peerHandle(peer, selfTabId, selfUsername)
  if (handle) return bareHandle(handle)
  return peer.principal.toText()
}

function displayName(handle: string | null, fallback: string) {
  if (!handle) return fallback
  return bareHandle(handle)
}

function SpeakingWaves() {
  return (
    <>
      <span
        className="pointer-events-none absolute inset-0 rounded-full border-2 border-emerald-500 motion-safe:animate-live-speak-ring"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute inset-0 rounded-full border-2 border-emerald-500 motion-safe:animate-live-speak-ring [animation-delay:700ms]"
        aria-hidden
      />
    </>
  )
}

function ParticipantTile({
  peer,
  selfTabId,
  selfUsername,
  isHost,
  speaking,
  micOn,
  large,
}: {
  peer: LivePeer
  selfTabId: string
  selfUsername: string | null
  isHost: boolean
  speaking: boolean
  micOn: boolean
  large?: boolean
}) {
  const t = useTranslations("live")
  const seed = peerSeed(peer, selfTabId, selfUsername)
  const handle = peerHandle(peer, selfTabId, selfUsername)
  const premium = isPremiumHandle(handle)
  const fallback = `${peer.principal.toText().slice(0, 6)}…`
  const label = displayName(handle, fallback)
  const initials = label.slice(0, 2).toUpperCase()
  const frame = large ? "size-[4.5rem] sm:size-20" : "size-12 sm:size-14"

  return (
    <div className="flex min-w-0 flex-col items-center gap-1.5">
      <div className={cn("relative flex items-center justify-center", frame)}>
        {speaking && <SpeakingWaves />}
        <div
          className={cn(
            "relative size-full overflow-hidden rounded-full transition-shadow duration-200",
            speaking && "ring-2 ring-emerald-500 shadow-[0_0_14px_rgba(16,185,129,0.5)]",
            micOn && !speaking && "ring-1 ring-emerald-500/30"
          )}
        >
          <Avatar className="size-full after:hidden bg-transparent">
            <AvatarImage src={avatarUriFor(seed)} alt={label} />
            <AvatarFallback className="bg-transparent text-[10px]">{initials}</AvatarFallback>
          </Avatar>
        </div>
        {isHost && (
          <Badge
            variant="secondary"
            className="absolute -bottom-1 left-1/2 z-10 -translate-x-1/2 px-1.5 py-0 text-[9px] font-medium"
          >
            {t("host")}
          </Badge>
        )}
        {!isHost && premium && handle && (
          <span className="absolute -bottom-0.5 -right-0.5 z-10 drop-shadow-sm">
            <PremiumBadge name={handle} className="size-3.5" />
          </span>
        )}
        {isHost && premium && handle && (
          <span className="absolute -right-0.5 -top-0.5 z-10 drop-shadow-sm">
            <PremiumBadge name={handle} className="size-3.5" />
          </span>
        )}
      </div>
      <p
        className={cn(
          "w-full truncate text-center leading-tight text-foreground/90",
          large ? "text-xs font-medium sm:text-sm" : "text-[11px] sm:text-xs",
          speaking && "font-medium text-emerald-600 dark:text-emerald-400"
        )}
      >
        {label}
      </p>
    </div>
  )
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
    return <p className="py-2 text-center text-xs text-muted-foreground">{t("gridEmpty")}</p>
  }

  const hostPeer = peers.find((p) => p.principal.toText() === hostText) ?? peers[0]
  const guests = peers.filter((p) => p.tabId !== hostPeer.tabId)

  return (
    <div className="flex flex-col items-start gap-4 sm:items-center">
      <ParticipantTile
        peer={hostPeer}
        selfTabId={selfTabId}
        selfUsername={selfUsername}
        isHost
        speaking={speakingTabIds.has(hostPeer.tabId)}
        micOn={micOnTabIds.has(hostPeer.tabId)}
        large
      />

      {guests.length > 0 && (
        <div className="grid w-full grid-cols-3 gap-x-3 gap-y-4 sm:max-w-md">
          {guests.map((peer) => (
            <ParticipantTile
              key={peer.tabId}
              peer={peer}
              selfTabId={selfTabId}
              selfUsername={selfUsername}
              isHost={false}
              speaking={speakingTabIds.has(peer.tabId)}
              micOn={micOnTabIds.has(peer.tabId)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
