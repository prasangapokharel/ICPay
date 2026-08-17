"use client"

import type { Principal } from "@icp-sdk/core/principal"
import { useTranslations } from "next-intl"
import { avatarUriFor } from "@/lib/avatar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PremiumBadge } from "@/components/verifed/premium-badge"
import { isPremiumHandle } from "@/lib/verifed/premium-tick"
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

function UsernameLabel({ handle, fallback }: { handle: string | null; fallback: string }) {
  if (!handle) {
    return <span className="truncate">{fallback}</span>
  }
  return (
    <span className="inline-flex min-w-0 max-w-full items-baseline justify-center gap-px">
      <span className="shrink-0">@</span>
      <span className="truncate">{bareHandle(handle)}</span>
    </span>
  )
}

function ParticipantTile({
  peer,
  selfTabId,
  selfUsername,
  active,
  large,
}: {
  peer: LivePeer
  selfTabId: string
  selfUsername: string | null
  active: boolean
  large?: boolean
}) {
  const seed = peerSeed(peer, selfTabId, selfUsername)
  const handle = peerHandle(peer, selfTabId, selfUsername)
  const premium = isPremiumHandle(handle)
  const fallback = `@${peer.principal.toText().slice(0, 6)}…`
  const initials = (handle ? bareHandle(handle) : fallback.replace("@", "")).slice(0, 2).toUpperCase()

  return (
    <div className="flex min-w-0 flex-col items-center gap-1.5">
      <div className="relative">
        <div
          className={cn(
            "overflow-hidden rounded-full transition-shadow",
            large ? "size-[72px] sm:size-20" : "size-14 sm:size-16",
            active && "ring-2 ring-emerald-500 ring-offset-2 ring-offset-background"
          )}
        >
          <Avatar className="size-full after:hidden bg-transparent">
            <AvatarImage src={avatarUriFor(seed)} alt={handle ? `@${bareHandle(handle)}` : fallback} />
            <AvatarFallback className="bg-transparent text-[10px]">{initials}</AvatarFallback>
          </Avatar>
        </div>
        {premium && handle && (
          <span className="absolute -bottom-0.5 -right-0.5 drop-shadow-sm">
            <PremiumBadge name={handle} className={cn(large ? "size-4" : "size-3.5")} />
          </span>
        )}
      </div>
      <p
        className={cn(
          "w-full truncate text-center leading-tight text-foreground/90",
          large ? "text-xs font-medium sm:text-sm" : "text-[11px] sm:text-xs"
        )}
      >
        <UsernameLabel handle={handle} fallback={fallback} />
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
    return <p className="py-4 text-center text-xs text-muted-foreground">{t("gridEmpty")}</p>
  }

  const hostPeer = peers.find((p) => p.principal.toText() === hostText) ?? peers[0]
  const guests = peers.filter((p) => p.tabId !== hostPeer.tabId)
  const isActive = (tabId: string) => speakingTabIds.has(tabId) || micOnTabIds.has(tabId)

  return (
    <div className="flex flex-col items-center gap-4 py-1">
      <ParticipantTile
        peer={hostPeer}
        selfTabId={selfTabId}
        selfUsername={selfUsername}
        active={isActive(hostPeer.tabId)}
        large
      />

      {guests.length > 0 && (
        <div className="grid w-full max-w-sm grid-cols-4 gap-x-2 gap-y-4 sm:max-w-md sm:gap-x-3">
          {guests.map((peer) => (
            <ParticipantTile
              key={peer.tabId}
              peer={peer}
              selfTabId={selfTabId}
              selfUsername={selfUsername}
              active={isActive(peer.tabId)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
