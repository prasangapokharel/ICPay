"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import {
  BroadcastMessage,
  PendingBroadcastMessage,
} from "@/components/community/community-broadcast-message"
import { CommunityForwardModal } from "@/components/community/community-forward-modal"
import { Button } from "@/components/ui/button"
import { MessageGroup } from "@/components/ui/message"
import { cn } from "@/lib/ui/utils"
import type { ReactionCode } from "@/lib/community/reactions"
import type { PendingMessage } from "@/lib/community/pendingMessage"
import type { CommunityChannelPublic, CommunityMessagePublic } from "@/services/community/community"

export function CommunityMessageList({
  channel,
  messages,
  pendingMessages = [],
  deliveredIds = new Set<string>(),
  pinnedId,
  isOwner,
  canReact = false,
  canForward = false,
  forwardTargets = [],
  onPin,
  onDelete,
  onReact,
  onForward,
  scrollToMessageId,
  highlightMessageId,
  onScrollToMessageDone,
}: {
  channel: CommunityChannelPublic
  messages: CommunityMessagePublic[]
  pendingMessages?: PendingMessage[]
  deliveredIds?: Set<string>
  pinnedId?: bigint
  isOwner?: boolean
  canReact?: boolean
  canForward?: boolean
  forwardTargets?: CommunityChannelPublic[]
  onPin?: (messageId: bigint) => Promise<void>
  onDelete?: (messageId: bigint) => Promise<void>
  onReact?: (messageId: bigint, code: ReactionCode) => Promise<void>
  onForward?: (targetSlug: string, text: string) => Promise<void>
  scrollToMessageId?: bigint | null
  highlightMessageId?: bigint | null
  onScrollToMessageDone?: () => void
}) {
  const t = useTranslations("community")
  const tc = useTranslations("common")
  const scrollRef = useRef<HTMLDivElement>(null)
  const nearBottomRef = useRef(false)
  const prevMessageCountRef = useRef(0)
  const prevPendingCountRef = useRef(0)
  const channelSlugRef = useRef(channel.slug)
  const [showJumpToLatest, setShowJumpToLatest] = useState(false)
  const [forwardOpen, setForwardOpen] = useState(false)
  const [forwardText, setForwardText] = useState("")

  const BOTTOM_THRESHOLD = 120

  const syncScrollState = (el: HTMLDivElement) => {
    const overflow = el.scrollHeight - el.clientHeight
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    const isNearBottom = distanceFromBottom < BOTTOM_THRESHOLD
    const hasMoreBelow = overflow > 4 && distanceFromBottom >= BOTTOM_THRESHOLD
    nearBottomRef.current = isNearBottom
    setShowJumpToLatest(hasMoreBelow)
  }

  const scrollToTop = (el: HTMLDivElement) => {
    el.scrollTop = 0
  }

  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el) return
    channelSlugRef.current = channel.slug
    scrollToTop(el)
    nearBottomRef.current = false
    prevMessageCountRef.current = 0
    prevPendingCountRef.current = 0
    setShowJumpToLatest(false)
  }, [channel.slug])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const messageCount = messages.length
    const pendingCount = pendingMessages.length
    const channelJustOpened =
      channelSlugRef.current === channel.slug && prevMessageCountRef.current === 0
    const isFirstLoad = channelJustOpened && messageCount > 0
    const pendingAdded = pendingCount > prevPendingCountRef.current
    const messagesAdded = messageCount > prevMessageCountRef.current

    prevMessageCountRef.current = messageCount
    prevPendingCountRef.current = pendingCount

    if (isFirstLoad) {
      scrollToTop(el)
      requestAnimationFrame(() => {
        if (!scrollRef.current || channelSlugRef.current !== channel.slug) return
        scrollToTop(scrollRef.current)
        syncScrollState(scrollRef.current)
      })
      return
    }

    if (pendingAdded || (messagesAdded && nearBottomRef.current)) {
      el.scrollTo({ top: el.scrollHeight, behavior: pendingAdded ? "auto" : "smooth" })
      nearBottomRef.current = true
      setShowJumpToLatest(false)
    }
  }, [messages.length, pendingMessages.length, channel.slug])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const frame = requestAnimationFrame(() => syncScrollState(el))
    return () => cancelAnimationFrame(frame)
  }, [messages.length, pendingMessages.length, pinnedId])

  useEffect(() => {
    if (scrollToMessageId == null) return
    const el = scrollRef.current?.querySelector(
      `[data-message-id="${scrollToMessageId.toString()}"]`
    )
    if (!el) return
    el.scrollIntoView({ behavior: "smooth", block: "center" })
    nearBottomRef.current = false
    requestAnimationFrame(() => {
      if (scrollRef.current) syncScrollState(scrollRef.current)
      onScrollToMessageDone?.()
    })
  }, [scrollToMessageId, messages, onScrollToMessageDone])

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    syncScrollState(el)
  }

  const scrollToBottom = () => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
    nearBottomRef.current = true
    setShowJumpToLatest(false)
  }

  const showEmpty = messages.length === 0 && pendingMessages.length === 0

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain [overflow-anchor:none]"
      >
        <div className={cn("flex flex-col py-2 pr-1", showEmpty && "min-h-full justify-center")}>
          {showEmpty ? (
            <div className="px-6 py-20 text-center">
              <p className="text-sm font-medium text-foreground">{t("noMessages")}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t("emptyPostsHint")}</p>
            </div>
          ) : (
            <MessageGroup className="gap-1">
              {messages.map((msg) => (
                <BroadcastMessage
                  key={msg.id.toString()}
                  message={msg}
                  channelSlug={channel.slug}
                  highlighted={highlightMessageId != null && msg.id === highlightMessageId}
                  pinned={pinnedId != null && msg.id === pinnedId}
                  delivered={isOwner && deliveredIds.has(msg.id.toString())}
                  isOwner={isOwner}
                  canReact={canReact}
                  onPin={onPin}
                  onDelete={onDelete}
                  onReact={onReact}
                  canForward={canForward}
                  onForward={() => {
                    setForwardText(msg.text)
                    setForwardOpen(true)
                  }}
                />
              ))}
              {pendingMessages.map((pending) => (
                <PendingBroadcastMessage
                  key={pending.clientId}
                  pending={pending}
                />
              ))}
            </MessageGroup>
          )}
        </div>
      </div>

      {showJumpToLatest && (
        <Button
          size="sm"
          className="absolute bottom-4 right-4 z-10 rounded-full shadow-lg"
          onClick={scrollToBottom}
        >
          {tc("jumpToLatest")}
        </Button>
      )}

      {canForward && onForward && (
        <CommunityForwardModal
          open={forwardOpen}
          onOpenChange={setForwardOpen}
          channels={forwardTargets}
          onForward={async (targetSlug) => {
            await onForward(targetSlug, forwardText)
          }}
        />
      )}
    </div>
  )
}
