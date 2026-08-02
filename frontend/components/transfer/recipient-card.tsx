"use client"

import Image from "next/image"
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
        <p className="truncate text-sm font-semibold">@{username}</p>
        {principal && (
          <p className="truncate font-mono text-xs text-muted-foreground">
            {shortPrincipal(principal)}
          </p>
        )}
      </div>
      <Image
        src="/images/logo/logo.png"
        alt="Verified ICPay account"
        width={40}
        height={40}
        className="size-5 shrink-0 object-contain"
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
  const trimmed = username.trim()
  if (trimmed.length < 3) return null

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-muted/40 p-3 ring-1 ring-border/60">
        <Spinner className="size-4 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">Looking up @{trimmed}…</p>
      </div>
    )
  }

  if (!principal) {
    return (
      <p className="px-1 text-xs text-muted-foreground">
        No ICPay account found for @{trimmed}.
      </p>
    )
  }

  return <RecipientCard username={trimmed} principal={principal} />
}
