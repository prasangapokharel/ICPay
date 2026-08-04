"use client"

import Link from "next/link"
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
import { LanguageSelect } from "@/components/i18n/language-select"
import { FiatSelector } from "@/components/fiat/fiat-selector"
import { ThemeSelector } from "@/components/settings/theme-selector"
import { useAuth } from "@/components/auth/auth-provider"
import type en from "@/language/en/common.json"

type ItemKey = keyof typeof en.settings.items

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
  const { logout } = useAuth()
  const t = useTranslations("settings")

  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right" showSwipeHandle>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t("sections.preferences")}</DrawerTitle>
          <DrawerDescription>{t("preferencesDescription")}</DrawerDescription>
        </DrawerHeader>

        <div className="space-y-3 overflow-y-auto p-4">
          <LanguageSelect />
          <FiatSelector />
          <ThemeSelector />

          <h2 className="pt-3 text-sm font-semibold">{t("sections.legal")}</h2>
          <div className="overflow-hidden rounded-2xl border">
            {LEGAL.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className="flex items-center gap-3 border-b px-4 py-3.5 text-sm transition-colors last:border-0 hover:bg-accent"
              >
                <HugeiconsIcon icon={item.icon} className="size-4.5 shrink-0 text-muted-foreground" />
                <span className="flex-1">{t(`items.${item.key}`)}</span>
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  className="size-4 shrink-0 text-muted-foreground"
                />
              </Link>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              onOpenChange(false)
              logout()
            }}
            className="flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left text-sm text-destructive transition-colors hover:bg-destructive/10"
          >
            <HugeiconsIcon icon={Logout01Icon} className="size-4.5 shrink-0" />
            <span className="flex-1">{t("signOut")}</span>
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
