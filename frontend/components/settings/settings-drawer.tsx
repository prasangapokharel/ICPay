"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import useSWRImmutable from "swr/immutable"
import { useSWRConfig } from "swr"
import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  File01Icon,
  HelpCircleIcon,
  InformationCircleIcon,
  LockKeyIcon,
  Logout01Icon,
  MapsLocation01Icon,
  ShieldKeyIcon,
} from "@hugeicons/core-free-icons"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LanguageSelect } from "@/components/i18n/language-select"
import { FiatSelector } from "@/components/fiat/fiat-selector"
import { ThemeSelector } from "@/components/settings/theme-selector"
import { SoundSelector } from "@/components/settings/sound-selector"
import { useAuth } from "@/components/auth/auth-provider"
import { useLocale } from "@/components/i18n/locale-provider"
import { getSettings, updateSettings } from "@/services/settings/settings"
import type en from "@/language/en/common.json"

type ItemKey = keyof typeof en.settings.items

// Remote prefs apply once per page load — not on every drawer mount, and never
// for language: localStorage is the UI source of truth until the user saves.
let syncedRemoteSettings = false

const LEGAL: { href: string; key: ItemKey; icon: IconSvgElement }[] = [
  { href: "/about", key: "about", icon: InformationCircleIcon },
  { href: "/faq", key: "faq", icon: HelpCircleIcon },
  { href: "/roadmap", key: "roadmap", icon: MapsLocation01Icon },
  { href: "/transparency", key: "transparency", icon: ShieldKeyIcon },
  { href: "/terms", key: "terms", icon: File01Icon },
  { href: "/privacy", key: "privacy", icon: LockKeyIcon },
]

export function SettingsDrawer({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { logout, identity } = useAuth()
  const t = useTranslations("settings")
  const { resolvedTheme, setTheme } = useTheme()
  const { locale } = useLocale()
  const { mutate } = useSWRConfig()

  const principal = identity?.getPrincipal().toText()
  // Only theme and language are on the backend DTO -- fiat and sound stay
  // client-only. Immutable: this is an update call, so it is read once per
  // session rather than on every drawer open.
  const { data: remote } = useSWRImmutable(
    principal ? (["settings", principal] as const) : null,
    () => getSettings(identity)
  )

  // Remote wins on first load, then local wins for the rest of the session --
  // otherwise every render would reapply the stale remote value over a change
  // the user just made.
  const hydrated = useRef(false)
  const notifications = useRef(true)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (!remote || syncedRemoteSettings) return
    syncedRemoteSettings = true
    hydrated.current = true
    notifications.current = remote.notifications
    if (remote.theme && remote.theme !== resolvedTheme) setTheme(remote.theme)
  }, [remote, resolvedTheme, setTheme])

  const handleOpenChange = async (next: boolean) => {
    // Pushed on close, not on every toggle inside the drawer: updateSettings is
    // an update call, and a theme flip costs the same cycles as a real edit.
    if (next || !hydrated.current || !identity) {
      setSaveError(null)
      onOpenChange(next)
      return
    }
    const theme = resolvedTheme ?? "light"
    if (theme === remote?.theme && locale === remote?.language) {
      onOpenChange(false)
      return
    }
    const result = await updateSettings(identity, {
      theme,
      language: locale,
      notifications: notifications.current,
    })
    // The save is what closing means here, so a rejected one -- a rate limit,
    // most likely -- holds the drawer open. Closing anyway would report the
    // failure into a panel the user can no longer see.
    if ("err" in result) {
      setSaveError(result.err)
      return
    }
    const key = principal ? (["settings", principal] as const) : null
    if (key) await mutate(key, result.ok, { revalidate: false })
    setSaveError(null)
    onOpenChange(false)
  }

  return (
    <Drawer
      open={open}
      onOpenChange={handleOpenChange}
      swipeDirection="right"
      showSwipeHandle
    >
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t("sections.preferences")}</DrawerTitle>
          <DrawerDescription>{t("preferencesDescription")}</DrawerDescription>
        </DrawerHeader>

        <div className="space-y-3 overflow-y-auto p-4">
          {saveError && (
            <Alert variant="destructive">
              <AlertDescription>{saveError}</AlertDescription>
            </Alert>
          )}
          <LanguageSelect />
          <FiatSelector />
          <ThemeSelector />
          <SoundSelector />

          <h2 className="pt-3 text-sm font-semibold">{t("sections.legal")}</h2>
          <div className="overflow-hidden rounded-2xl border">
            {LEGAL.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className="flex items-center gap-3 border-b px-4 py-2.5 text-sm transition-colors last:border-0 hover:bg-accent"
              >
                <HugeiconsIcon
                  icon={item.icon}
                  className="size-4 shrink-0 text-muted-foreground"
                />
                <span className="flex-1">{t(`items.${item.key}`)}</span>
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  className="size-3.5 shrink-0 text-muted-foreground"
                />
              </Link>
            ))}
          </div>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              onOpenChange(false)
              logout()
            }}
            className="h-auto w-full justify-start gap-3 rounded-2xl border bg-transparent px-4 py-2.5 text-left text-sm"
          >
            <HugeiconsIcon icon={Logout01Icon} className="size-4 shrink-0" />
            <span className="flex-1">{t("signOut")}</span>
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
