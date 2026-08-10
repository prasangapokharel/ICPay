import { HugeiconsIcon } from "@hugeicons/react"
import { Github01Icon, Linkedin01Icon, Globe02Icon } from "@hugeicons/core-free-icons"
import type { SocialLink, SocialPlatform } from "@/services/types"

function platformKey(p: SocialPlatform): "github" | "linkedin" | "website" {
  if ("github" in p) return "github"
  if ("linkedin" in p) return "linkedin"
  return "website"
}

const ICONS = {
  github:   Github01Icon,
  linkedin: Linkedin01Icon,
  website:  Globe02Icon,
}

// Shows social link icons (with href) for public profiles — no editing.
export function SocialLinkIcons({ links }: { links: SocialLink[] }) {
  if (!links.length) return null
  return (
    <div className="flex items-center gap-2">
      {links.map((l) => {
        const key = platformKey(l.platform)
        return (
          <a
            key={key}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={key}
            className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <HugeiconsIcon icon={ICONS[key]} className="size-4" />
          </a>
        )
      })}
    </div>
  )
}
