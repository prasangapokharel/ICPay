"use client"

import Link from "next/link"
import { useState } from "react"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon } from "@hugeicons/core-free-icons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { PremiumBadge } from "@/components/verifed/premium-badge"
import { SocialLinkIcons } from "@/components/profile/social-link-icons"
import { avatarUriFor } from "@/lib/profile/avatar"
import { profileUrlFor } from "@/lib/profile/url"
import { copyText } from "@/lib/wallet/utils"
import type { SocialLink } from "@/services/types"

type WalletOverviewIdentityProps = {
  username?: string
  displayName?: string
  userId: string
  socialLinks?: SocialLink[]
}

export function WalletOverviewIdentity({
  username,
  displayName,
  userId,
  socialLinks = [],
}: WalletOverviewIdentityProps) {
  const t = useTranslations("wallet")
  const tc = useTranslations("common")
  const [copied, setCopied] = useState(false)
  const seed = username ?? userId
  const title = displayName?.trim() || username || t("title")
  const profileHref = username ? profileUrlFor(username) : "/profile"

  async function onCopyUid() {
    await copyText(userId)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex items-center gap-3 border-b pb-4">
      <Link href={profileHref} className="shrink-0 rounded-full ring-1 ring-border/60">
        <Avatar className="size-11">
          <AvatarImage src={avatarUriFor(seed)} alt="" />
          <AvatarFallback className="bg-muted text-xs font-semibold uppercase">
            {seed.slice(0, 2)}
          </AvatarFallback>
        </Avatar>
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1.5">
          {username ? (
            <Link
              href={profileHref}
              className="truncate text-sm font-semibold tracking-tight hover:underline"
            >
              @{username}
            </Link>
          ) : (
            <span className="truncate text-sm font-semibold tracking-tight">{title}</span>
          )}
          {username ? <PremiumBadge name={username} className="size-3.5" /> : null}
        </div>
        {displayName && username && displayName !== username ? (
          <p className="truncate text-xs text-muted-foreground">{displayName}</p>
        ) : null}
        {socialLinks.length > 0 ? (
          <div className="mt-1.5">
            <SocialLinkIcons links={socialLinks} size="sm" />
          </div>
        ) : null}
      </div>

      <div className="hidden h-10 w-px shrink-0 bg-border sm:block" aria-hidden />

      <div className="hidden shrink-0 sm:block">
        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {t("uid")}
        </p>
        <div className="mt-0.5 flex items-center gap-1">
          <span className="max-w-[7.5rem] truncate font-mono text-xs tabular-nums">{userId}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={onCopyUid}
            aria-label={tc("copy")}
          >
            <HugeiconsIcon icon={Copy01Icon} className="size-3.5" strokeWidth={2} />
          </Button>
        </div>
        {copied ? <p className="text-[10px] text-muted-foreground">{tc("copied")}</p> : null}
      </div>
    </div>
  )
}
