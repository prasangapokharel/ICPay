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
  variant?: "inline" | "dock"
}

export function LiveMicControl({
  micOn,
  busy,
  disabled,
  onToggle,
  variant = "inline",
}: LiveMicControlProps) {
  const t = useTranslations("live")
  const label = busy ? t("micStarting") : micOn ? t("micOn") : t("micOff")
  const docked = variant === "dock"

  const button = (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-label={label}
      aria-pressed={micOn}
      className={cn(
        "flex items-center justify-center rounded-full transition-all active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        docked ? "size-[4.25rem]" : "size-20",
        micOn
          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
          : "bg-muted/80 text-muted-foreground ring-1 ring-border/80",
        disabled && "pointer-events-none opacity-45"
      )}
    >
      {busy ? (
        <Spinner className={cn("text-current", docked ? "size-6" : "size-7")} />
      ) : (
        <HugeiconsIcon
          icon={micOn ? Mic01Icon : MicOff01Icon}
          className={docked ? "size-8" : "size-9"}
          strokeWidth={1.75}
        />
      )}
    </button>
  )

  if (docked) {
    return (
      <div
        className="pointer-events-none fixed inset-x-0 z-40 bottom-[calc(6.25rem+env(safe-area-inset-bottom))]"
      >
        <div className="mx-auto flex max-w-md flex-col items-center gap-1 px-4">
          <div className="pointer-events-auto liquid-glass-strong rounded-full p-1.5 shadow-lg">
            {button}
          </div>
          <p className="text-[10px] font-medium text-muted-foreground/80">{label}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      {button}
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  )
}
