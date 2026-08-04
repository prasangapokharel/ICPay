"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { useTranslations } from "next-intl"
import { GiftIcon, BadgeCheckIcon } from "@hugeicons/core-free-icons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Spinner } from "@/components/ui/spinner"
import { avatarUriFor } from "@/lib/avatar"
import { shortPrincipal } from "@/lib/wallet-utils"
import { cn } from "@/lib/utils"

// The confirmation a payment app owes the user before they send money: proof the
// name they typed resolves to a real account. Mirrors the contact card pattern
// where entering a name reveals who it belongs to.
export function RecipientCard({
  username,
  principal,
  className,
}: {
  username: string
  principal?: string | null
  className?: string
}) {
  const tp = useTranslations("profileView")
  // 3-4 char handles are the rarest premium tier the sale issues.
  const verified = username.length >= 3 && username.length <= 4

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl bg-muted/40 p-3 ring-1 ring-border/60",
        className
      )}
    >
      <Avatar className="size-10">
        <AvatarImage src={avatarUriFor(username)} alt="" />
        <AvatarFallback className="bg-muted text-xs font-medium uppercase">
          {username.slice(0, 2)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1 truncate text-sm font-semibold">
          {username}
          {verified && (
            <HugeiconsIcon
              icon={BadgeCheckIcon}
              className="size-4 shrink-0 text-blue-500"
              aria-label={tp("premium")}
            />
          )}
        </p>
        {principal && (
          <p className="truncate font-mono text-xs text-muted-foreground">
            {shortPrincipal(principal)}
          </p>
        )}
      </div>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <HugeiconsIcon icon={GiftIcon} className="size-4" />
      </span>
    </div>
  )
}

export function RecipientLookup({
  username,
  principal,
  isLoading,
}: {
  username: string
  principal: string | null
  isLoading: boolean
}) {
  const t = useTranslations("transfer")
  const trimmed = username.trim()
  if (trimmed.length < 3) return null

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-muted/40 p-3 ring-1 ring-border/60">
        <Spinner className="size-4 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">{t("lookingUp", { name: trimmed })}</p>
      </div>
    )
  }

  if (!principal) {
    return (
      <p className="px-1 text-xs text-muted-foreground">
        {t("noAccount", { name: trimmed })}
      </p>
    )
  }

  return <RecipientCard username={trimmed} principal={principal} />
}
