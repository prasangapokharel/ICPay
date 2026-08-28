"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { ProfileCard } from "@/components/profile/profile-card"
import { IcpSubaccountsCard } from "@/components/profile/icp-subaccounts-card"
import { ShareProfileCard } from "@/components/profile/share-profile-card"
import { SocialLinksEditor } from "@/components/profile/social-links-editor"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { PremiumBadge } from "@/components/verifed/premium-badge"
import { useAuth } from "@/components/auth/auth-provider"
import { usePatchDashboardUser, useOwnProfile } from "@/hooks/wallet/useWalletData"
import { updateUsername } from "@/services/profile/profile"
import { avatarUriFor } from "@/lib/profile/avatar"
import { copyText, shortPrincipal } from "@/lib/wallet/utils"

export default function ProfilePage() {
  const t = useTranslations("profile")
  const tc = useTranslations("common")
  const { identity } = useAuth()
  const patchDashboardUser = usePatchDashboardUser()
  const principal = identity?.getPrincipal().toText() ?? ""
  const [copied, setCopied] = useState(false)

  const { data: user, isLoading, mutate } = useOwnProfile()

  const handleUpdateUsername = async (username: string): Promise<string | null> => {
    const result = await updateUsername(identity, username)
    if ("err" in result) return result.err

    mutate(result.ok, { revalidate: false })
    // The dashboard holds its own copy of the user, and the mandatory username
    // prompt keys off it. The canister already returned the saved record, so
    // patch it in rather than paying another getDashboard.
    patchDashboardUser(result.ok)
    return null
  }

  // Copies the full principal, not the truncated form on screen -- a shortened
  // one pasted into a send field would address nothing.
  const handleCopyPrincipal = async () => {
    await copyText(principal)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  if (isLoading && !user) return <div className="flex justify-center py-12"><p className="text-muted-foreground">{tc("loading")}</p></div>
  if (!user) return null

  const claimed = user.username?.[0]

  return (
    <div className="mx-auto max-w-lg space-y-6 pt-2">
      {/* The handle and the principal are what this page is about, so they lead
          rather than sitting as two more rows inside a settings card. */}
      <div className="flex flex-col items-center">
        <Avatar className="size-20">
          <AvatarImage src={avatarUriFor(claimed ?? principal)} alt="" />
          <AvatarFallback className="text-lg font-medium uppercase">
            {(claimed ?? principal).slice(0, 2)}
          </AvatarFallback>
        </Avatar>

        <h1 className="flex items-center gap-1.5 pt-3 text-xl font-bold tracking-tight">
          {claimed ? `@${claimed}` : t("title")}
          {claimed && <PremiumBadge name={claimed} className="size-4" />}
        </h1>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyPrincipal}
          aria-label={t("copyPrincipal")}
          className="mt-1 gap-1.5 text-muted-foreground"
        >
          <span className="font-mono text-xs">{shortPrincipal(principal)}</span>
          <span className="text-xs">{copied ? tc("copied") : tc("copy")}</span>
        </Button>
      </div>

      {claimed && <ShareProfileCard username={claimed} />}
      <SocialLinksEditor user={user} onUpdate={(updated) => mutate(updated, { revalidate: false })} />
      <IcpSubaccountsCard />
      <ProfileCard user={user} onUpdateUsername={handleUpdateUsername} />
    </div>
  )
}
