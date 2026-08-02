"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, Share08Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { copyText } from "@/lib/wallet-utils"
import { profileUrlFor } from "@/lib/profile-url"

// The link is the product here: it is what the user hands to someone else to
// get paid, so it is shown in full rather than truncated.
export function ShareProfileCard({ username }: { username: string }) {
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
      title: `Pay @${username} on ICPay`,
      text: `Send me ICP at @${username}`,
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
          <p className="text-sm font-medium">Your payment link</p>
          <p className="text-xs text-muted-foreground">
            Anyone can open this to pay you — no account needed.
          </p>
        </div>

        <p className="truncate rounded-xl bg-muted/50 px-3 py-2.5 font-mono text-xs">
          {url.replace(/^https?:\/\//, "")}
        </p>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex h-11 items-center justify-center gap-2 rounded-2xl text-sm font-medium ring-1 ring-border transition-colors hover:bg-accent active:scale-[0.99]"
          >
            <HugeiconsIcon
              icon={copied ? Tick02Icon : Copy01Icon}
              className={copied ? "size-4 text-primary" : "size-4"}
            />
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 active:scale-[0.99]"
          >
            <HugeiconsIcon icon={Share08Icon} className="size-4" />
            Share
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
