"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { useSWRConfig } from "swr"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth/auth-provider"
import { CommunityChannelCard } from "@/components/community/community-channel-card"
import { LanguageSwitch } from "@/components/i18n/language-switch"
import {
  useInvalidateCommunity,
  useMyCommunityChannels,
  usePublicCommunityChannels,
} from "@/hooks/community/useCommunity"
import { communityMemberKey } from "@/lib/community/cacheKeys"
import { getCachedLatest, hasUnread } from "@/lib/community/readState"
import { sortCommunityChannels, type CommunitySort } from "@/lib/community/sort"
import { useRewrittenLastSegment } from "@/lib/routing/rewrittenRoute"
import { joinCommunityChannel } from "@/services/community/community"

export function CommunityExplorer() {
  const t = useTranslations("community")
  const pathname = usePathname()
  const segment = useRewrittenLastSegment()
  const { identity } = useAuth()
  const { mutate } = useSWRConfig()
  const invalidate = useInvalidateCommunity()
  const publicQ = usePublicCommunityChannels()
  const mineQ = useMyCommunityChannels()
  const [joiningSlug, setJoiningSlug] = useState<string | null>(null)
  const [sort, setSort] = useState<CommunitySort>("newest")

  const principal = identity?.getPrincipal().toText() ?? ""
  const joinedSlugs = useMemo(
    () => new Set(mineQ.channels.map((ch) => ch.slug)),
    [mineQ.channels]
  )
  const activeSlug =
    pathname.startsWith("/channels/") && segment !== "new" && segment !== "join"
      ? segment
      : ""

  const sortedPublic = useMemo(
    () => sortCommunityChannels(publicQ.channels, sort),
    [publicQ.channels, sort]
  )
  const sortedMine = useMemo(
    () => sortCommunityChannels(mineQ.channels, sort),
    [mineQ.channels, sort]
  )

  const handleJoin = async (slug: string) => {
    if (!identity || joiningSlug) return
    setJoiningSlug(slug)
    const memberKey = communityMemberKey(identity, slug)
    await mutate(memberKey, true, { revalidate: false })
    try {
      await joinCommunityChannel(identity, slug)
      await Promise.all([invalidate(), mineQ.refresh(), publicQ.refresh()])
      await mutate(memberKey, true)
    } catch {
      await mutate(memberKey, false, { revalidate: false })
    } finally {
      setJoiningSlug(null)
    }
  }

  return (
    <Tabs defaultValue="explore" className="flex h-full min-h-0 flex-col gap-0">
      <div className="shrink-0 border-b border-border/60 px-4 py-2 md:py-3">
        <div className="flex items-center justify-between gap-2">
          <h1 className="truncate text-lg font-semibold tracking-tight">{t("title")}</h1>
          <div className="flex shrink-0 items-center gap-1.5">
            <div className="hidden md:block">
              <LanguageSwitch />
            </div>
            <Button size="sm" nativeButton={false} render={<Link href="/channels/new" />}>
              {t("newChannel")}
            </Button>
          </div>
        </div>
        <p className="mt-0.5 hidden truncate text-xs text-muted-foreground md:block">
          {t("subtitle")}
        </p>
        <TabsList className="mt-3 grid w-full grid-cols-2">
          <TabsTrigger value="explore">{t("explore")}</TabsTrigger>
          <TabsTrigger value="mine">{t("mine")}</TabsTrigger>
        </TabsList>
        <label className="mt-2 flex items-center gap-2">
          <span className="shrink-0 text-[11px] text-muted-foreground">{t("sort")}</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as CommunitySort)}
            className="min-w-0 flex-1 rounded-lg border border-border/60 bg-muted/30 px-2 py-1.5 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            <option value="newest">{t("sortNewest")}</option>
            <option value="members">{t("sortMembers")}</option>
            <option value="freeFirst">{t("sortFree")}</option>
          </select>
        </label>
      </div>

      <ScrollArea className="h-full w-full min-h-0 flex-1">
        <TabsContent value="explore" className="m-0">
          <ChannelList
            loading={publicQ.isLoading}
            channels={sortedPublic}
            principal={principal}
            joinedSlugs={joinedSlugs}
            joiningSlug={joiningSlug}
            activeSlug={activeSlug}
            onJoin={handleJoin}
            emptyLabel={t("empty")}
            emptyHint={t("emptyHint")}
          />
        </TabsContent>
        <TabsContent value="mine" className="m-0">
          <ChannelList
            loading={mineQ.isLoading}
            channels={sortedMine}
            principal={principal}
            joinedSlugs={joinedSlugs}
            joiningSlug={joiningSlug}
            activeSlug={activeSlug}
            emptyLabel={t("empty")}
            emptyHint={t("emptyHint")}
          />
        </TabsContent>
      </ScrollArea>
    </Tabs>
  )
}

function ChannelList({
  loading,
  channels,
  principal,
  joinedSlugs,
  joiningSlug,
  activeSlug,
  onJoin,
  emptyLabel,
  emptyHint,
}: {
  loading: boolean
  channels: ReturnType<typeof usePublicCommunityChannels>["channels"]
  principal: string
  joinedSlugs: Set<string>
  joiningSlug: string | null
  activeSlug: string
  onJoin?: (slug: string) => void
  emptyLabel: string
  emptyHint: string
}) {
  if (loading) {
    return (
      <div className="divide-y divide-border/50">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5">
            <Skeleton className="size-11 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-8 w-16 rounded-full" />
          </div>
        ))}
      </div>
    )
  }

  if (channels.length === 0) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="font-medium text-foreground">{emptyLabel}</p>
        <p className="mt-1.5 text-sm text-muted-foreground">{emptyHint}</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border/50">
      {channels.map((ch) => {
        const latest = getCachedLatest(ch.slug)
        const lastActiveNs = latest ? BigInt(latest.at) : undefined
        return (
          <CommunityChannelCard
            key={ch.id}
            channel={ch}
            href={`/channels/${encodeURIComponent(ch.slug)}`}
            isOwner={ch.owner.toText() === principal}
            isJoined={joinedSlugs.has(ch.slug)}
            joining={joiningSlug === ch.slug}
            selected={activeSlug === ch.slug}
            unread={principal ? joinedSlugs.has(ch.slug) && hasUnread(principal, ch.slug) : false}
            lastActiveNs={lastActiveNs}
            onJoin={onJoin ? () => onJoin(ch.slug) : undefined}
          />
        )
      })}
    </div>
  )
}
