"use client"

import { useTranslations } from "next-intl"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { LanguageSelect } from "@/components/i18n/language-select"
import { FiatSelector } from "@/components/fiat/fiat-selector"
import { ThemeSelector } from "@/components/settings/theme-selector"
import { SoundSelector } from "@/components/settings/sound-selector"
import { useAuth } from "@/components/auth/auth-provider"

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
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      swipeDirection="right"
      showSwipeHandle
    >
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t("sections.preferences")}</DrawerTitle>
          <DrawerDescription>{t("preferencesDescription")}</DrawerDescription>
        </DrawerHeader>

        <div className="space-y-3 overflow-y-auto p-4">
          <LanguageSelect />
          <FiatSelector />
          <ThemeSelector />
          <SoundSelector />

          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              onOpenChange(false)
              logout()
            }}
            className="h-auto w-full rounded-2xl border bg-transparent px-4 py-2.5 text-sm"
          >
            {t("signOut")}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
