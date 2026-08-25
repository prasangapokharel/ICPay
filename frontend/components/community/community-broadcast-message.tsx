"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { CommunityIcon } from "@/components/community/community-icon"
import { CommunityMessageContent } from "@/components/community/community-message-content"
import { CommunityReactionPicker } from "@/components/community/community-reaction-picker"
import { CommunityReactionRow } from "@/components/community/community-reaction-row"
import { Bubble, BubbleContent, BubbleReactions } from "@/components/ui/bubble"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Marker, MarkerContent } from "@/components/ui/marker"
import { Message, MessageContent, MessageFooter } from "@/components/ui/message"
import { Spinner } from "@/components/ui/spinner"
import { formatMessageTime } from "@/lib/community/format"
import { myReactionCode, type ReactionCode } from "@/lib/community/reactions"
import type { PendingMessage } from "@/lib/community/pendingMessage"
import { cn } from "@/lib/ui/utils"
import type { CommunityMessagePublic } from "@/services/community/community"

export function PendingBroadcastMessage({ pending }: { pending: PendingMessage }) {
  const t = useTranslations("community")
  const time = formatMessageTime(pending.createdAt)
  const sending = pending.status === "sending"
  const failed = pending.status === "failed"

  return (
    <Message className="px-3 py-1 animate-in fade-in slide-in-from-bottom-1 duration-200">
      <MessageContent>
        <Bubble
          variant="outline"
          className={cn(sending && "opacity-90", failed && "border-destructive/40")}
        >
          <BubbleContent>
            <CommunityMessageContent text={pending.text} />
          </BubbleContent>
        </Bubble>
        <MessageFooter className="gap-1.5">
          {sending && <Spinner className="size-3" />}
          {failed && <span className="text-destructive">{t("postFailed")}</span>}
          <span>{time}</span>
        </MessageFooter>
      </MessageContent>
    </Message>
  )
}

export function BroadcastMessage({
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
    if (!onReact || myReactionCode(message) === code) return
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
    <Bubble
      variant="muted"
      className={cn(
        "max-w-[min(100%,22rem)]",
        canInteract && "cursor-context-menu",
        deleting && "pointer-events-none scale-[0.98] opacity-40"
      )}
    >
      {pinned && (
        <Marker className="px-3.5 pt-1 text-[11px]">
          <MarkerContent>{t("pinned")}</MarkerContent>
        </Marker>
      )}
      <BubbleContent>
        <CommunityMessageContent text={message.text} />
      </BubbleContent>
      {canReact && hasReactions && (
        <BubbleReactions aria-label="Message reactions">
          <CommunityReactionRow
            reactions={message.reactions}
            myReaction={message.myReaction}
            onToggle={react}
            inline
          />
        </BubbleReactions>
      )}
    </Bubble>
  )

  const footerParts = [
    deleting ? t("deleting") : null,
    delivered && !deleting ? t("delivered") : null,
    time,
  ].filter(Boolean)

  const body = (
    <Message className="px-3 py-1" data-message-id={message.id.toString()}>
      <MessageContent>
        {canInteract ? (
          <ContextMenu>
            <ContextMenuTrigger render={<div className="w-fit max-w-full" />}>{bubble}</ContextMenuTrigger>
            <ContextMenuContent className="w-48">
              {canReact && onReact && (
                <>
                  <CommunityReactionPicker onPick={react} activeCode={myReactionCode(message)} />
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
        {footerParts.length > 0 && (
          <MessageFooter>{footerParts.join(" · ")}</MessageFooter>
        )}
      </MessageContent>
    </Message>
  )

  return body
}
