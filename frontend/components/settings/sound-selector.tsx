"use client"

import { useSyncExternalStore } from "react"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { VolumeHighIcon, VolumeOffIcon } from "@hugeicons/core-free-icons"
import { Switch } from "@/components/ui/switch"
import {
  soundEnabled,
  setSoundEnabled,
  subscribeSound,
  playSuccessChime,
} from "@/lib/ui/successChime"

export function SoundSelector() {
  const t = useTranslations("sound")
  // Read through the store rather than into state: localStorage is unavailable
  // while the static export prerenders, and the server snapshot keeps the
  // markup matching the on-by-default client until hydration corrects it.
  const on = useSyncExternalStore(subscribeSound, soundEnabled, () => true)

  return (
    <div className="flex items-center gap-3 rounded-2xl border px-4 py-3.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
        <HugeiconsIcon icon={on ? VolumeHighIcon : VolumeOffIcon} className="size-4.5" />
      </span>
      <div className="flex-1">
        <p className="text-sm">{t("label")}</p>
        <p className="text-xs text-muted-foreground">{t("description")}</p>
      </div>
      <Switch
        checked={on}
        onCheckedChange={(checked) => {
          setSoundEnabled(checked)
          // Turning it on is the one moment a chime is both wanted and inside a
          // real tap, so it doubles as the permission prime mobile needs.
          if (checked) playSuccessChime()
        }}
        aria-label={t("label")}
        className="shrink-0"
      />
    </div>
  )
}
