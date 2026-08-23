"use client"

import { useAuth } from "@/components/auth/auth-provider"
import { CommunityChannelView } from "@/components/community/community-channel-view"
import { CommunityMessageList } from "@/components/community/community-message-list"
import { Spinner } from "@/components/ui/spinner"
import {
  useCommunityChannel,
  useCommunityDeleteMessage,
  useCommunityMembership,
  useCommunityMessages,
  useCommunityPinMessage,
  useCommunityPostMessage,
  useCommunityReaction,
  useInvalidateCommunity,
  useInvalidateCommunityLists,
  useMyCommunityChannels,
} from "@/hooks/community/useCommunity"
import { useRewrittenLastSegment } from "@/lib/routing/rewrittenRoute"
import { cacheLatestMessage, getCachedLatest, markChannelRead } from "@/lib/community/readState"
import { createPendingMessage, type PendingMessage } from "@/lib/community/pendingMessage"
import {
  isCommunityOpen,
  isCommunityPaid,
  joinCommunityChannel,
  leaveCommunityChannel,
  postCommunityMessage,
} from "@/services/community/community"
import { useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"

import { useMemo, useEffect, useState } from "react"

export function CommunityChannelScreen() {
  const slug = useRewrittenLastSegment()
  const searchParams = useSearchParams()
  const urlInvite = searchParams.get("code") ?? undefined
  const t = useTranslations("community")
  const { identity } = useAuth()
  const invalidate = useInvalidateCommunity()
  const invalidateLists = useInvalidateCommunityLists(slug)
  const { channel, isLoading } = useCommunityChannel(slug)
  const { isMember, mutate: mutateMember } = useCommunityMembership(slug)
  const mineQ = useMyCommunityChannels()

  const isOwner = useMemo(() => {
    if (!channel || !identity) return false
    return channel.owner.toText() === identity.getPrincipal().toText()
  }, [channel, identity])

  const isJoined = useMemo(() => {
    if (isOwner) return true
    if (isMember) return true
    if (!slug) return false
    return mineQ.channels.some((ch) => ch.slug === slug)
  }, [isOwner, isMember, slug, mineQ.channels])

  const forwardTargets = useMemo(() => {
    if (!identity) return []
    const me = identity.getPrincipal().toText()
    return mineQ.channels.filter((ch) => ch.owner.toText() === me && ch.slug !== slug)
  }, [identity, mineQ.channels, slug])

  const canForward = forwardTargets.length > 0

  const canReadMessages =
    !!channel &&
    (isOwner ||
      isJoined ||
      (isCommunityOpen(channel.visibility) && !isCommunityPaid(channel.access)))

  const { messages } = useCommunityMessages(slug, canReadMessages)
  const postMessage = useCommunityPostMessage(slug)
  const pinMessage = useCommunityPinMessage(slug)
  const reactToMessage = useCommunityReaction(slug)
  const deleteMessage = useCommunityDeleteMessage(slug)

  const [pendingMessages, setPendingMessages] = useState<PendingMessage[]>([])
  const [deliveredIds, setDeliveredIds] = useState<Set<string>>(() => new Set())

  const removePending = (clientId: string) => {
    setPendingMessages((prev) => prev.filter((m) => m.clientId !== clientId))
  }

  const patchPending = (clientId: string, status: PendingMessage["status"]) => {
    setPendingMessages((prev) =>
      prev.map((m) => (m.clientId === clientId ? { ...m, status } : m))
    )
  }

  const visiblePending = useMemo(
    () =>
      pendingMessages.filter(
        (p) =>
          p.status === "failed" ||
          p.status === "sending" ||
          !messages.some((m) => m.text === p.text)
      ),
    [pendingMessages, messages]
  )

  const inviteCode =
    typeof window !== "undefined" && slug
      ? sessionStorage.getItem(`community-invite-${slug}`) ?? undefined
      : undefined

  const lastActiveNs = useMemo(() => {
    if (!slug) return undefined
    if (messages.length === 0) {
      const cached = getCachedLatest(slug)
      return cached ? BigInt(cached.at) : undefined
    }
    const last = messages[messages.length - 1]
    return last.createdAt
  }, [messages, slug])

  useEffect(() => {
    if (!slug || !identity || messages.length === 0 || !canReadMessages) return
    const last = messages[messages.length - 1]
    const principal = identity.getPrincipal().toText()
    cacheLatestMessage(slug, last.id, last.createdAt)
    markChannelRead(principal, slug, last.id)
  }, [slug, identity, messages, canReadMessages])

  if (!slug || slug === "slug") {
    return null
  }

  if (isLoading || !channel) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    )
  }

  const pinnedId = channel.pinnedMessageId[0]
  const pinnedPreview =
    pinnedId != null ? messages.find((m) => m.id === pinnedId) : undefined

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
    <CommunityChannelView
      channel={channel}
      slug={slug}
      isOwner={isOwner}
      isMember={isJoined}
      inviteCode={inviteCode}
      pinnedPreview={pinnedPreview}
      lastActiveNs={lastActiveNs}
      onJoin={async () => {
        await mutateMember(true, { revalidate: false })
        try {
          await joinCommunityChannel(identity, slug, urlInvite)
          await invalidate()
          return null
        } catch (e) {
          await mutateMember(false, { revalidate: false })
          return e instanceof Error ? e.message : t("joinFailed")
        }
      }}
      onLeave={async () => {
        try {
          await leaveCommunityChannel(identity, slug)
          await invalidate()
          return null
        } catch (e) {
          return e instanceof Error ? e.message : t("leaveFailed")
        }
      }}
      onPost={async (text) => {
        const pending = createPendingMessage(text)
        setPendingMessages((prev) => [...prev, pending])

        try {
          const posted = await postMessage(text)

          removePending(pending.clientId)
          setDeliveredIds((prev) => new Set(prev).add(posted.id.toString()))

          if (identity) {
            const principal = identity.getPrincipal().toText()
            cacheLatestMessage(slug, posted.id, posted.createdAt)
            markChannelRead(principal, slug, posted.id)
          }

          void invalidateLists()
          return null
        } catch (e) {
          patchPending(pending.clientId, "failed")
          return e instanceof Error ? e.message : t("postFailed")
        }
      }}
      messagesSlot={
        <CommunityMessageList
          channel={channel}
          messages={messages}
          pendingMessages={visiblePending}
          deliveredIds={deliveredIds}
          pinnedId={pinnedId}
          isOwner={isOwner}
          canReact={!!identity && canReadMessages}
          canForward={canForward}
          forwardTargets={forwardTargets}
          onForward={async (targetSlug, text) => {
            await postCommunityMessage(identity, targetSlug, text)
            void invalidateLists()
          }}
          onReact={(messageId, code) => reactToMessage(messageId, code)}
          onPin={async (messageId) => {
            await pinMessage(messageId)
          }}
          onDelete={async (messageId) => {
            await deleteMessage(messageId)
            void invalidate()
          }}
        />
      }
    />
    </div>
  )
}
