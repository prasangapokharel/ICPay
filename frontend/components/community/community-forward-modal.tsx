"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { CommunityAvatar } from "@/components/community/community-avatar"
import { CommunityIcon } from "@/components/community/community-icon"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/ui/utils"
import type { CommunityChannelPublic } from "@/services/community/community"

export function CommunityForwardModal({
  open,
  onOpenChange,
  channels,
  onForward,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  channels: CommunityChannelPublic[]
  onForward: (targetSlug: string) => Promise<void>
}) {
  const t = useTranslations("community")
  const [query, setQuery] = useState("")
  const [busySlug, setBusySlug] = useState<string | null>(null)
  const [successSlug, setSuccessSlug] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return channels
    return channels.filter(
      (ch) => ch.name.toLowerCase().includes(q) || ch.slug.toLowerCase().includes(q)
    )
  }, [channels, query])

  const reset = () => {
    setQuery("")
    setBusySlug(null)
    setSuccessSlug(null)
    setError(null)
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) reset()
    onOpenChange(next)
  }

  const pick = async (targetSlug: string) => {
    if (busySlug) return
    setError(null)
    setBusySlug(targetSlug)
    try {
      await onForward(targetSlug)
      setSuccessSlug(targetSlug)
      window.setTimeout(() => {
        handleOpenChange(false)
      }, 900)
    } catch (e) {
      setError(e instanceof Error ? e.message : t("forwardFailed"))
    } finally {
      setBusySlug(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[min(85dvh,560px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="border-b border-border/50 px-4 py-4 text-left">
          <DialogTitle className="text-base font-semibold">{t("forwardTo")}</DialogTitle>
        </DialogHeader>

        <div className="border-b border-border/40 px-4 py-3">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("forwardSearch")}
            className="h-10 rounded-xl"
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">{t("forwardEmpty")}</p>
          ) : (
            filtered.map((ch) => {
              const busy = busySlug === ch.slug
              const done = successSlug === ch.slug
              return (
                <button
                  key={ch.slug}
                  type="button"
                  disabled={Boolean(busySlug) && !busy}
                  onClick={() => void pick(ch.slug)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted/60",
                    busy && "bg-muted/40"
                  )}
                >
                  <CommunityAvatar seed={ch.slug} name={ch.name} size="default" className="size-10 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{ch.name}</p>
                    <p className="truncate text-xs text-muted-foreground">@{ch.slug}</p>
                  </div>
                  {busy && <Spinner className="size-4 text-muted-foreground" />}
                  {done && (
                    <span className="flex size-7 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <CommunityIcon name="check" size={16} />
                    </span>
                  )}
                </button>
              )
            })
          )}
        </div>

        {error && <p className="px-4 pb-2 text-center text-xs text-destructive">{error}</p>}

        <DialogFooter className="border-t border-border/50 px-4 py-3">
          <Button variant="ghost" className="w-full rounded-full" onClick={() => handleOpenChange(false)}>
            {t("cancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
