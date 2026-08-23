"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { CommunityMessageBody } from "@/components/community/community-message-body"
import { truncateMessagePreview } from "@/lib/community/messagePreview"
import { cn } from "@/lib/ui/utils"

const seeMoreLink =
  "inline border-0 bg-transparent p-0 font-medium text-primary align-baseline shadow-none outline-none hover:bg-transparent hover:underline focus-visible:ring-0"

export function CommunityMessageContent({ text }: { text: string }) {
  const t = useTranslations("community")
  const [expanded, setExpanded] = useState(false)
  const { preview, truncated } = truncateMessagePreview(text)
  const collapsible = truncated

  if (!collapsible || expanded) {
    return (
      <div>
        <CommunityMessageBody text={text} />
        {collapsible && expanded ? (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className={cn(seeMoreLink, "mt-1.5 block text-left")}
          >
            {t("showLess")}
          </button>
        ) : null}
      </div>
    )
  }

  return (
    <div>
      <CommunityMessageBody text={preview} />
      <span className="text-muted-foreground">{" … "}</span>
      <button type="button" onClick={() => setExpanded(true)} className={seeMoreLink}>
        {t("seeMore")}
      </button>
    </div>
  )
}
