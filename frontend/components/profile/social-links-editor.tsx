"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { Github01Icon, Linkedin01Icon, Globe02Icon, Add01Icon, Cancel01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { SocialLink, SocialPlatform, UserPublic } from "@/services/types"
import { setSocialLink, removeSocialLink } from "@/services/sociallink/sociallink"
import { useAuth } from "@/components/auth/auth-provider"

type Platform = "github" | "linkedin" | "website"

const PLATFORM_CONFIG: Record<Platform, {
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"]
  labelKey: "github" | "linkedin" | "website"
  placeholderKey: "github" | "linkedin" | "website"
}> = {
  github:   { icon: Github01Icon,   labelKey: "github",   placeholderKey: "github" },
  linkedin: { icon: Linkedin01Icon, labelKey: "linkedin", placeholderKey: "linkedin" },
  website:  { icon: Globe02Icon,    labelKey: "website",  placeholderKey: "website" },
}

function platformKey(p: SocialPlatform): Platform {
  if ("github" in p) return "github"
  if ("linkedin" in p) return "linkedin"
  return "website"
}

function toPlatform(key: Platform): SocialPlatform {
  if (key === "github") return { github: null }
  if (key === "linkedin") return { linkedin: null }
  return { website: null }
}

export function SocialLinksEditor({
  user,
  onUpdate,
}: {
  user: UserPublic
  onUpdate: (updated: UserPublic) => void
}) {
  const t = useTranslations("socialLinks")
  const tc = useTranslations("common")
  const { identity } = useAuth()
  const [open, setOpen] = useState<Platform | null>(null)
  const [url, setUrl] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const links: SocialLink[] = user.socialLinks?.[0] ?? []
  const linkMap = new Map(links.map((l) => [platformKey(l.platform), l.url]))

  const handleOpen = (platform: Platform) => {
    setOpen(platform)
    setUrl(linkMap.get(platform) ?? "")
    setError(null)
    setSaved(false)
  }

  const handleSave = async () => {
    if (!open) return
    setSaving(true)
    setError(null)
    const result = await setSocialLink(identity, toPlatform(open), url.trim())
    setSaving(false)
    if ("err" in result) { setError(result.err); return }
    onUpdate(result.ok)
    setSaved(true)
    setTimeout(() => { setOpen(null); setSaved(false) }, 800)
  }

  const handleRemove = async (platform: Platform) => {
    const result = await removeSocialLink(identity, toPlatform(platform))
    if ("ok" in result) onUpdate(result.ok)
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold">{t("title")}</p>

      <div className="space-y-2">
        {(["github", "linkedin", "website"] as Platform[]).map((platform) => {
          const cfg = PLATFORM_CONFIG[platform]
          const existing = linkMap.get(platform)
          const isOpen = open === platform

          return (
            <div key={platform} className="rounded-2xl border bg-muted/30 px-3 py-2.5">
              <div className="flex items-center gap-2.5">
                <HugeiconsIcon icon={cfg.icon} className="size-4 shrink-0 text-muted-foreground" />
                <span className="flex-1 text-sm font-medium">{t(cfg.labelKey)}</span>
                {existing && !isOpen ? (
                  <div className="flex items-center gap-1">
                    <a
                      href={existing}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate max-w-32 text-xs text-primary underline underline-offset-2"
                    >
                      {existing.replace("https://", "")}
                    </a>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleRemove(platform)}
                      className="size-6 text-muted-foreground hover:text-destructive"
                    >
                      <HugeiconsIcon icon={Cancel01Icon} className="size-3" />
                    </Button>
                  </div>
                ) : !isOpen ? (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleOpen(platform)}
                    className="size-6 text-muted-foreground"
                  >
                    <HugeiconsIcon icon={Add01Icon} className="size-3.5" />
                  </Button>
                ) : null}
              </div>

              {isOpen && (
                <div className="mt-2 space-y-1.5">
                  <Input
                    autoFocus
                    value={url}
                    onChange={(e) => { setUrl(e.target.value); setError(null) }}
                    placeholder={t(`urlPlaceholder.${cfg.placeholderKey}`)}
                    className="text-xs"
                    onKeyDown={(e) => e.key === "Enter" && handleSave()}
                  />
                  {error && <p className="text-xs text-destructive">{error}</p>}
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={saving || !url.trim()}
                      className="h-7 text-xs"
                    >
                      {saved ? t("saved") : saving ? "…" : t("saveBtn")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setOpen(null)}
                      className="h-7 text-xs text-muted-foreground"
                    >
                      {tc("cancel")}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
