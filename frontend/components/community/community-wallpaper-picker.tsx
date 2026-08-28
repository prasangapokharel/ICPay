"use client"

import { useTranslations } from "next-intl"
import { useCommunityWallpaper } from "@/hooks/community/useCommunityWallpaper"
import Image from "next/image"
import { wallpaperUrl } from "@/lib/community/wallpaper"
import { cn } from "@/lib/ui/utils"

export function CommunityWallpaperPicker({ slug }: { slug: string }) {
  const t = useTranslations("community")
  const { wallpaperId, selectWallpaper, options } = useCommunityWallpaper(slug)

  return (
    <div className="mb-4">
      <p className="mb-2 text-sm text-muted-foreground">{t("channelTheme")}</p>
      <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-6 sm:gap-3">
        {options.map((id) => {
          const selected = wallpaperId === id
          const url = wallpaperUrl(id)
          const isDefault = id === 0
          return (
            <button
              key={id}
              type="button"
              aria-label={isDefault ? t("themeDefault") : t("channelThemeOption", { n: id })}
              aria-pressed={selected}
              onClick={() => selectWallpaper(id)}
              className={cn(
                "aspect-square relative w-full cursor-pointer overflow-hidden rounded-xl border-2 transition-all",
                selected
                  ? "border-primary ring-2 ring-primary/25"
                  : "border-border/50 opacity-90 hover:opacity-100 hover:ring-1 hover:ring-border/60"
              )}
            >
              <Image
                src={url}
                alt=""
                fill
                unoptimized
                className="object-cover object-center"
                draggable={false}
              />
              {isDefault ? (
                <span className="absolute inset-x-0 bottom-0 bg-background/80 py-0.5 text-center text-[9px] font-medium text-muted-foreground">
                  {t("themeDefault")}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
