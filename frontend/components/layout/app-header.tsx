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
    <header className="sticky top-0 z-40 flex h-14 items-center gap-2 bg-background/80 px-4 backdrop-blur-xl">
      <Link
        href="/profile"
        aria-label={t("profile")}
        className="shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Avatar className="size-9">
          {avatarUri && <AvatarImage src={avatarUri} alt="" />}
          <AvatarFallback className="bg-muted text-xs font-medium">
            {principal.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex-1" />

      <div className="shrink-0">
        <LanguageSwitch />
      </div>
    </header>
  )
}
