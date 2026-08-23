"use client"

import { useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { CommunityForwardModal } from "@/components/community/community-forward-modal"
import { CommunityMessageContent } from "@/components/community/community-message-content"
import { CommunityIcon } from "@/components/community/community-icon"
import { CommunityReactionPicker } from "@/components/community/community-reaction-picker"
import { CommunityReactionRow } from "@/components/community/community-reaction-row"
import { Button } from "@/components/ui/button"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Spinner } from "@/components/ui/spinner"
import { CommunityAvatar } from "@/components/community/community-avatar"
import { formatMessageTime } from "@/lib/community/format"
import type { ReactionCode } from "@/lib/community/reactions"
import type { PendingMessage } from "@/lib/community/pendingMessage"
import { cn } from "@/lib/ui/utils"
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
}) {
  const t = useTranslations("community")
  const tc = useTranslations("common")
  const scrollRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const [showJumpToLatest, setShowJumpToLatest] = useState(false)
  const [forwardOpen, setForwardOpen] = useState(false)
  const [forwardText, setForwardText] = useState("")
  const pinned = pinnedId != null ? messages.find((m) => m.id === pinnedId) : undefined
  const rest = pinnedId != null ? messages.filter((m) => m.id !== pinnedId) : messages

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "auto" })
  }, [messages.length, pendingMessages.length])

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 200
      setShowJumpToLatest(!isNearBottom)
    }

    container.addEventListener("scroll", handleScroll)
    return () => container.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" })
  }

  const showEmpty = messages.length === 0 && pendingMessages.length === 0

  return (
    <div className="relative h-full min-h-0 w-full flex-1 overflow-hidden">
      <ScrollArea ref={scrollRef} className="h-full min-h-0 w-full flex-1 overflow-hidden bg-transparent">
        <div
          className={cn(
            "relative flex flex-col gap-0.5 py-2",
            showEmpty && "min-h-full justify-center"
          )}
        >
          {showEmpty ? (
            <div className="px-6 py-20 text-center">
              <p className="text-sm font-medium text-foreground">{t("noMessages")}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t("emptyPostsHint")}</p>
            </div>
          ) : (
            <>
              {pinned && (
                <BroadcastRow
                  channel={channel}
                  message={pinned}
                  pinned
                  isOwner={isOwner}
                  canReact={canReact}
                  canForward={canForward}
                  onPin={onPin}
                  onDelete={onDelete}
                  onReact={onReact}
                  onForward={() => {
                    setForwardText(pinned.text)
                    setForwardOpen(true)
                  }}
                />
              )}
              {rest.map((msg) => (
                <BroadcastRow
                  key={msg.id.toString()}
                  channel={channel}
                  message={msg}
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
                <PendingRow key={pending.clientId} channel={channel} pending={pending} />
              ))}
            </>
          )}
          <div ref={endRef} />
        </div>
      </ScrollArea>

      {showJumpToLatest && (
        <Button
          size="sm"
          className="absolute bottom-20 right-4 z-10 rounded-full shadow-lg"
          onClick={scrollToBottom}
        >
          <CommunityIcon name="arrowDown" size={16} />
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

function PendingRow({
  channel,
  pending,
}: {
  channel: CommunityChannelPublic
  pending: PendingMessage
}) {
  const t = useTranslations("community")
  const time = formatMessageTime(pending.createdAt)
  const sending = pending.status === "sending"
  const failed = pending.status === "failed"

  return (
    <div className="flex items-start gap-2.5 px-4 py-1.5 animate-in fade-in slide-in-from-bottom-1 duration-200">
      <CommunityAvatar
        seed={channel.slug}
        name={channel.name}
        size="default"
        className="mt-0.5 size-9 shrink-0"
      />
      <div
        className={cn(
          "min-w-0 max-w-[min(100%,22rem)] rounded-2xl rounded-tl-md border border-border/50 bg-background px-4 py-2.5 shadow-sm dark:bg-card",
          sending && "opacity-90",
          failed && "border-destructive/40"
        )}
      >
        <div className="text-foreground/95">
          <CommunityMessageContent text={pending.text} />
        </div>
        <div className="mt-2 flex items-center justify-end gap-1">
          {sending && <Spinner className="size-3 text-muted-foreground" />}
          {failed && (
            <span className="text-[10px] font-medium text-destructive">{t("postFailed")}</span>
          )}
          <span className="text-[11px] leading-none text-muted-foreground/70">{time}</span>
        </div>
      </div>
    </div>
  )
}

function BroadcastRow({
  channel,
  message,
  pinned = false,
  delivered = false,
  isOwner = false,
  canReact = false,
  canForward = false,
  onPin,
  onDelete,
  onReact,
  onForward,
}: {
  channel: CommunityChannelPublic
  message: CommunityMessagePublic
  pinned?: boolean
  delivered?: boolean
  isOwner?: boolean
  canReact?: boolean
  canForward?: boolean
  onPin?: (messageId: bigint) => Promise<void>
  onDelete?: (messageId: bigint) => Promise<void>
  onReact?: (messageId: bigint, code: ReactionCode) => Promise<void>
  onForward?: () => void
}) {
  const t = useTranslations("community")
  const time = formatMessageTime(message.createdAt)
  const [busy, setBusy] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const canManage = isOwner && (onPin || onDelete)
  const canInteract = canReact || canManage
  const hasReactions = (message.reactions?.length ?? 0) > 0

  const run = async (fn?: () => Promise<void>) => {
    if (!fn || busy) return
    setBusy(true)
    try {
      await fn()
    } finally {
      setBusy(false)
    }
  }

  const react = (code: ReactionCode) => {
    if (!onReact) return
    void onReact(message.id, code)
  }

  const copyMessageText = async () => {
    await navigator.clipboard.writeText(message.text)
  }

  const handleDelete = () => {
    if (!onDelete || deleting) return
    setDeleting(true)
    window.setTimeout(() => {
      void onDelete(message.id).catch(() => {
        setDeleting(false)
      })
    }, 160)
  }

  const bubble = (
    <div
      className={cn(
        "min-w-0 max-w-[min(100%,22rem)] rounded-2xl rounded-tl-md border border-border/50 bg-background px-4 py-2.5 shadow-sm transition-all duration-150 dark:bg-card",
        canInteract && "cursor-context-menu",
        deleting && "pointer-events-none scale-[0.98] opacity-40"
      )}
    >
      {pinned && (
        <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">{t("pinned")}</p>
      )}
      <div className="text-foreground/95">
        <CommunityMessageContent text={message.text} />
      </div>
      <div
        className={cn(
          "mt-2 flex items-end gap-2",
          hasReactions ? "justify-between" : "justify-end"
        )}
      >
        {canReact && hasReactions && (
          <CommunityReactionRow
            reactions={message.reactions}
            myReaction={message.myReaction}
            onToggle={react}
            inline
          />
        )}
        <div className="flex shrink-0 items-center gap-1.5">
          {deleting && (
            <span className="text-[10px] font-medium text-destructive">{t("deleting")}</span>
          )}
          {delivered && !deleting && (
            <span className="text-[10px] font-medium text-muted-foreground/80">{t("delivered")}</span>
          )}
          <span className="text-[11px] leading-none text-muted-foreground/70">{time}</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex items-start gap-2.5 px-4 py-1.5">
      <CommunityAvatar
        seed={channel.slug}
        name={channel.name}
        size="default"
        className="mt-0.5 size-9 shrink-0"
      />
      <div className="min-w-0 max-w-[min(100%,22rem)]">
        {canInteract ? (
          <ContextMenu>
            <ContextMenuTrigger>
              <div>{bubble}</div>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-48">
              {canReact && onReact && (
                <>
                  <CommunityReactionPicker
                    onPick={(code) => {
                      react(code)
                    }}
                  />
                  <ContextMenuSeparator />
                </>
              )}
              <ContextMenuGroup>
                <ContextMenuItem onClick={() => void copyMessageText()}>
                  <CommunityIcon name="copy" size={16} />
                  {t("copyText")}
                </ContextMenuItem>
                {canForward && onForward && (
                  <ContextMenuItem onClick={onForward}>
                    <CommunityIcon name="forward" size={16} />
                    {t("forward")}
                  </ContextMenuItem>
                )}
                {canManage && onPin && (
                  <ContextMenuItem
                    className="gap-0"
                    disabled={busy}
                    onClick={() =>
                      run(async () => {
                        await onPin(message.id)
                      })
                    }
                  >
                    {pinned ? t("unpin") : t("pin")}
                  </ContextMenuItem>
                )}
              </ContextMenuGroup>
              {canManage && onDelete && (
                <>
                  <ContextMenuSeparator />
                  <ContextMenuGroup>
                    <ContextMenuItem
                      className="gap-0"
                      variant="destructive"
                      disabled={busy || deleting}
                      onClick={handleDelete}
                    >
                      {deleting ? t("deleting") : t("delete")}
                    </ContextMenuItem>
                  </ContextMenuGroup>
                </>
              )}
            </ContextMenuContent>
          </ContextMenu>
        ) : (
          bubble
        )}
      </div>
    </div>
  )
}
