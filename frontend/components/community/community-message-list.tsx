"use client"

import { useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { CommunityMessageContent } from "@/components/community/community-message-content"
import { AppIcon } from "@/components/ui/app-icon"
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
  onPin,
  onDelete,
}: {
  channel: CommunityChannelPublic
  messages: CommunityMessagePublic[]
  pendingMessages?: PendingMessage[]
  deliveredIds?: Set<string>
  pinnedId?: bigint
  isOwner?: boolean
  onPin?: (messageId: bigint) => Promise<void>
  onDelete?: (messageId: bigint) => Promise<void>
}) {
  const t = useTranslations("community")
  const endRef = useRef<HTMLDivElement>(null)
  const pinned = pinnedId != null ? messages.find((m) => m.id === pinnedId) : undefined
  const rest = pinnedId != null ? messages.filter((m) => m.id !== pinnedId) : messages

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" })
  }, [messages.length, pendingMessages.length])

  const showEmpty = messages.length === 0 && pendingMessages.length === 0

  return (
    <ScrollArea className="h-full min-h-0 w-full flex-1 overflow-hidden bg-transparent">
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
                onPin={onPin}
                onDelete={onDelete}
              />
            )}
            {rest.map((msg) => (
              <BroadcastRow
                key={msg.id.toString()}
                channel={channel}
                message={msg}
                delivered={isOwner && deliveredIds.has(msg.id.toString())}
                isOwner={isOwner}
                onPin={onPin}
                onDelete={onDelete}
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
    <div className="flex items-start gap-2.5 px-4 py-1.5">
      <CommunityAvatar
        seed={channel.slug}
        name={channel.name}
        size="default"
        className="mt-0.5 size-9 shrink-0"
      />
      <div
        className={cn(
          "min-w-0 max-w-[min(100%,22rem)] rounded-2xl rounded-tl-md border border-border/40 bg-background/92 px-3.5 py-2.5 shadow-sm backdrop-blur-sm",
          failed && "border-destructive/40"
        )}
      >
        <div className="text-[15px] leading-relaxed text-foreground">
          <CommunityMessageContent text={pending.text} />
        </div>
        <div className="mt-1.5 flex items-center justify-end gap-1">
          {sending && <Spinner className="size-3 text-muted-foreground" />}
          {failed && (
            <span className="text-[10px] font-medium text-destructive">{t("postFailed")}</span>
          )}
          <span className="text-[11px] leading-none text-muted-foreground">{time}</span>
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
  onPin,
  onDelete,
}: {
  channel: CommunityChannelPublic
  message: CommunityMessagePublic
  pinned?: boolean
  delivered?: boolean
  isOwner?: boolean
  onPin?: (messageId: bigint) => Promise<void>
  onDelete?: (messageId: bigint) => Promise<void>
}) {
  const t = useTranslations("community")
  const time = formatMessageTime(message.createdAt)
  const [busy, setBusy] = useState(false)
  const canManage = isOwner && (onPin || onDelete)

  const run = async (fn?: () => Promise<void>) => {
    if (!fn || busy) return
    setBusy(true)
    try {
      await fn()
    } finally {
      setBusy(false)
    }
  }

  const bubble = (
    <div
      className={cn(
        "min-w-0 max-w-[min(100%,22rem)] rounded-2xl rounded-tl-md border border-border/40 bg-background/92 px-3.5 py-2.5 shadow-sm backdrop-blur-sm dark:bg-card/90",
        canManage && "cursor-context-menu"
      )}
    >
      {pinned && (
        <p className="mb-1 flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
          <AppIcon name="chatPin" size={12} mono />
          {t("pinned")}
        </p>
      )}
      <div className="text-[15px] leading-relaxed text-foreground">
        <CommunityMessageContent text={message.text} />
      </div>
      <div className="mt-1.5 flex items-center justify-end gap-1.5">
        {delivered && (
          <span className="text-[10px] font-medium text-muted-foreground">{t("delivered")}</span>
        )}
        <span className="text-[11px] leading-none text-muted-foreground">{time}</span>
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
      {canManage ? (
        <ContextMenu>
          <ContextMenuTrigger>{bubble}</ContextMenuTrigger>
          <ContextMenuContent className="w-48">
            <ContextMenuGroup>
              {onPin && (
                <ContextMenuItem
                  disabled={busy}
                  onClick={() =>
                    run(async () => {
                      await onPin(message.id)
                    })
                  }
                >
                  <AppIcon name="chatPin" size={16} mono />
                  {pinned ? t("unpin") : t("pin")}
                </ContextMenuItem>
              )}
            </ContextMenuGroup>
            {onDelete && (
              <>
                <ContextMenuSeparator />
                <ContextMenuGroup>
                  <ContextMenuItem
                    variant="destructive"
                    disabled={busy}
                    onClick={() =>
                      run(async () => {
                        await onDelete(message.id)
                      })
                    }
                  >
                    <AppIcon name="chatDelete" size={16} mono />
                    {t("delete")}
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
  )
}
