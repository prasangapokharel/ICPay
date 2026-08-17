"use client"

import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { Mic01Icon, MicOff01Icon } from "@hugeicons/core-free-icons"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

type LiveMicControlProps = {
  micOn: boolean
  busy: boolean
  disabled: boolean
  onToggle: () => void
}

export function LiveMicControl({ micOn, busy, disabled, onToggle }: LiveMicControlProps) {
  const t = useTranslations("live")

  return (
    <div className="flex flex-col items-center gap-2 py-2">
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        aria-label={busy ? t("micStarting") : micOn ? t("micOn") : t("micOff")}
        aria-pressed={micOn}
        className={cn(
          "flex size-20 items-center justify-center rounded-full transition-all active:scale-95",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          micOn
            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
            : "bg-muted/80 text-muted-foreground ring-1 ring-border/80",
          disabled && "pointer-events-none opacity-45"
        )}
      >
        {busy ? (
          <Spinner className="size-7 text-current" />
        ) : (
          <HugeiconsIcon
            icon={micOn ? Mic01Icon : MicOff01Icon}
            className="size-9"
            strokeWidth={1.75}
          />
        )}
      </button>
      <p className="text-[11px] text-muted-foreground">
        {busy ? t("micStarting") : micOn ? t("micOn") : t("micOff")}
      </p>
    </div>
  )
}
