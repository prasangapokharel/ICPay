"use client"

import { PremiumBadge } from "@/components/verifed/premium-badge"
import { ScoreCircle } from "@/components/transfer/trust-signals"
import { useTranslations } from "next-intl"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Spinner } from "@/components/ui/spinner"
import { avatarUriFor } from "@/lib/avatar"
import { shortPrincipal } from "@/lib/wallet-utils"
import { USERNAME_MIN_LENGTH } from "@/lib/username"
import { useRecipientProfile, useRecipientTxCount } from "@/hooks/use-wallet-data"
import { cn } from "@/lib/utils"

export function RecipientCard({
  username,
  principal,
  className,
}: {
  username: string
  principal?: string | null
  className?: string
}) {
  const profile = useRecipientProfile(username, principal ?? null)
  const txCount = useRecipientTxCount(principal ?? null)

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl bg-muted/40 p-3 ring-1 ring-border/60",
        className,
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
          <PremiumBadge name={username} />
        </p>
        {principal && (
          <p className="truncate font-mono text-xs text-muted-foreground">
            {shortPrincipal(principal)}
          </p>
        )}
      </div>

      {/* Score circle replaces the gift icon — same slot, same size. */}
      <ScoreCircle
        username={username}
        createdAtNs={profile?.createdAt}
        txCount={txCount}
      />
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
  if (trimmed.length < USERNAME_MIN_LENGTH) return null

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
