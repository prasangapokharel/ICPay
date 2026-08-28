"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { copyText } from "@/lib/wallet/utils"
import { profileUrlFor } from "@/lib/profile/url"

// The link is the product here: it is what the user hands to someone else to
// get paid, so it is shown in full rather than truncated.
export function ShareProfileCard({ username }: { username: string }) {
  const t = useTranslations("profile")
  const tc = useTranslations("common")
  const url = profileUrlFor(username)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await copyText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  // Share sheet where the browser has one, copy everywhere else. Dismissing the
  // sheet rejects with AbortError, which is a choice rather than a failure and
  // must not fall through to a surprise copy.
  const handleShare = async () => {
    const payload = {
      title: t("shareSheetTitle", { name: username }),
      text: t("shareSheetText", { name: username }),
      url,
    }
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(payload)
        return
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return
      }
    }
    await handleCopy()
  }

  return (
    <Card>
      <CardContent className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{t("shareTitle")}</p>
          <p className="truncate font-mono text-xs text-muted-foreground">
            {url.replace(/^https?:\/\//, "")}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="shrink-0"
        >
          {copied ? tc("copied") : tc("copy")}
        </Button>
        <Button
          size="sm"
          onClick={handleShare}
          className="shrink-0"
        >
          {tc("share")}
        </Button>
      </CardContent>
    </Card>
  )
}
