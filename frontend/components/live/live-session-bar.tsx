"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { Mic01Icon, MicOff01Icon } from "@hugeicons/core-free-icons"
import { Spinner } from "@/components/ui/spinner"
import { useLiveSession } from "@/components/live/live-session-provider"
import { liveStateLabel } from "@/services/live/live"
import { cn } from "@/lib/utils"

export function LiveSessionBar() {
  const t = useTranslations("live")
  const { roomId, room, micOn, micBusy, toggleMic, visible } = useLiveSession()

  if (!visible || !roomId || !room) return null

  const live = liveStateLabel(room.state) === "live"

  return (
    <div className="flex min-w-0 items-center justify-center gap-1.5">
      <Link
        href={`/live/${roomId}`}
        className="flex min-w-0 max-w-[11rem] items-center gap-1.5 rounded-full border border-border/60 bg-muted/50 px-2.5 py-1 transition-colors hover:bg-muted"
      >
        <span
          className={cn(
            "size-1.5 shrink-0 rounded-full",
            live ? "animate-pulse bg-emerald-500" : "bg-muted-foreground/50"
          )}
        />
        <span className="truncate text-xs font-medium">{room.title}</span>
      </Link>

      {live && (
        <button
          type="button"
          onClick={() => void toggleMic()}
          disabled={micBusy}
          aria-label={micOn ? t("micOn") : t("micOff")}
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full transition-all active:scale-95",
            micOn
              ? "bg-emerald-500 text-white"
              : "border border-border/60 bg-muted/50 text-muted-foreground"
          )}
        >
          {micBusy ? (
            <Spinner className="size-3.5" />
          ) : (
            <HugeiconsIcon
              icon={micOn ? Mic01Icon : MicOff01Icon}
              className="size-3.5"
              strokeWidth={1.75}
            />
          )}
        </button>
      )}
    </div>
  )
}
