"use client"

import Link from "next/link"
import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { createAvatar } from "@dicebear/core"
import { adventurer } from "@dicebear/collection"
import { useAuth } from "@/components/auth/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export function PublicNavAuth() {
  const tNav = useTranslations("publicSite.nav")
  const { identity, isAuthenticated, isLoading } = useAuth()
  const principal = identity?.getPrincipal().toText() ?? ""

  const avatarUri = useMemo(
    () => (principal ? createAvatar(adventurer, { seed: principal }).toDataUri() : ""),
    [principal]
  )

  if (isLoading) {
    return <div className="size-9 shrink-0 animate-pulse rounded-full bg-muted" aria-hidden />
  }

  if (isAuthenticated) {
    return (
      <Link
        href="/home"
        className="shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={tNav("wallet")}
      >
        <Avatar className="size-9">
          {avatarUri ? <AvatarImage src={avatarUri} alt="" /> : null}
          <AvatarFallback className="bg-muted text-xs font-medium">
            {principal.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Link>
    )
  }

  return (
    <Button
      size="sm"
      nativeButton={false}
      render={<Link href="/login" />}
      className="rounded-full px-4"
    >
      {tNav("signIn")}
    </Button>
  )
}
