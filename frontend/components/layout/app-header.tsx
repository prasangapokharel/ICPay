"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"
import { createAvatar } from "@dicebear/core"
import { adventurer } from "@dicebear/collection"
import { HugeiconsIcon } from "@hugeicons/react"
import { Sun01Icon, Moon02Icon } from "@hugeicons/core-free-icons"
import { useAuth } from "@/components/auth/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function AppHeader() {
  const t = useTranslations("header")
  const { identity } = useAuth()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // resolvedTheme is undefined until next-themes reads localStorage on the
  // client, so rendering the icon before mount would flash the wrong one.
  useEffect(() => setMounted(true), [])

  const principal = identity?.getPrincipal().toText() ?? ""

  const avatarUri = useMemo(
    () => (principal ? createAvatar(adventurer, { seed: principal }).toDataUri() : ""),
    [principal]
  )

  const isDark = resolvedTheme === "dark"

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

      <button
        type="button"
        aria-label={isDark ? t("lightMode") : t("darkMode")}
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="flex size-9 items-center justify-center rounded-full border bg-background text-foreground transition-colors hover:bg-accent active:scale-95"
      >
        {mounted ? (
          isDark ? <HugeiconsIcon icon={Sun01Icon} className="size-4.5" /> : <HugeiconsIcon icon={Moon02Icon} className="size-4.5" />
        ) : (
          <span className="size-4.5" />
        )}
      </button>
    </header>
  )
}
