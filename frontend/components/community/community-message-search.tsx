"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { formatMessageTime, messageSearchPreview } from "@/lib/community/format"
import type { CommunityMessagePublic } from "@/services/community/community"

export function CommunityMessageSearch({
  open,
  onOpenChange,
  messages,
  onSelect,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  messages: CommunityMessagePublic[]
  onSelect: (messageId: bigint) => void
}) {
  const t = useTranslations("community")

  const items = useMemo(
    () =>
      [...messages]
        .sort((a, b) => Number(b.createdAt - a.createdAt))
        .map((message) => ({
          id: message.id,
          preview: messageSearchPreview(message.text),
          time: formatMessageTime(message.createdAt),
        })),
    [messages]
  )

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("searchMessages")}
      description={t("searchPlaceholder")}
      className="sm:max-w-md"
    >
      <Command>
        <CommandInput placeholder={t("searchPlaceholder")} />
        <CommandList>
          <CommandEmpty>{t("searchEmpty")}</CommandEmpty>
          <CommandGroup heading={t("searchMessages")}>
            {items.map((item) => (
              <CommandItem
                key={item.id.toString()}
                value={`${item.preview} ${item.time}`}
                onSelect={() => {
                  onSelect(item.id)
                  onOpenChange(false)
                }}
              >
                <span className="min-w-0 flex-1 truncate">{item.preview}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{item.time}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
