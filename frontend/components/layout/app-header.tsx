"use client"

import Link from "next/link"
import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { createAvatar } from "@dicebear/core"
import { adventurer } from "@dicebear/collection"
import { useAuth } from "@/components/auth/auth-provider"
import { LanguageSwitch } from "@/components/i18n/language-switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function AppHeader() {
  const t = useTranslations("header")
  const { identity } = useAuth()

  const principal = identity?.getPrincipal().toText() ?? ""

  const avatarUri = useMemo(
    () => (principal ? createAvatar(adventurer, { seed: principal }).toDataUri() : ""),
    [principal]
  )

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between bg-background/80 px-4 backdrop-blur-xl">
      {/* Straight to the profile rather than a dropdown: every entry it held --
          profile, settings, sign out -- is already on the menu page. */}
      <Link
        href="/profile"
        aria-label={t("profile")}
        className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Avatar className="size-9">
          {avatarUri && <AvatarImage src={avatarUri} alt="" />}
          <AvatarFallback className="bg-muted text-xs font-medium">
            {principal.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Link>

      {/* The theme toggle lives in the settings drawer now; the header keeps a
          one-tap language switch so it is reachable on every screen. */}
      <LanguageSwitch />
    </header>
  )
}
