"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, Share08Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { copyText } from "@/lib/wallet-utils"
import { profileUrlFor } from "@/lib/profile-url"

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
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm font-medium">{t("shareTitle")}</p>
          <p className="text-xs text-muted-foreground">
            {t("shareBody")}
          </p>
        </div>

        <p className="truncate rounded-xl bg-muted/50 px-3 py-2.5 font-mono text-xs">
          {url.replace(/^https?:\/\//, "")}
        </p>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={handleCopy}
            className="h-11 rounded-2xl"
          >
            <HugeiconsIcon
              icon={copied ? Tick02Icon : Copy01Icon}
              className={copied ? "size-4 text-primary" : "size-4"}
            />
            {copied ? tc("copied") : tc("copy")}
          </Button>
          <Button onClick={handleShare} className="h-11 rounded-2xl">
            <HugeiconsIcon icon={Share08Icon} className="size-4" />
            {tc("share")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
