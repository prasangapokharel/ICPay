"use client"

import Image from "next/image"
import { useTranslations } from "next-intl"
import { SIGN_IN_PROVIDER_ICONS } from "@/lib/auth/sign-in-providers"
import { cn } from "@/lib/ui/utils"

export function HeroSignOptions() {
  const t = useTranslations("publicSite.heroSignOptions")

  return (
    <div className="space-y-2.5 pt-1">
      <p className="text-xs text-muted-foreground">{t("label")}</p>
      <div className="flex flex-wrap items-center gap-2.5" aria-label={t("ariaLabel")}>
        {SIGN_IN_PROVIDER_ICONS.map((provider) => (
          <div
            key={provider.id}
            className="flex size-10 items-center justify-center rounded-xl border border-border/60 bg-background"
            title={provider.label}
          >
            <Image
              src={provider.src}
              alt=""
              width={22}
              height={22}
              unoptimized
              className={cn(
                "size-5 object-contain",
                "iconClassName" in provider ? provider.iconClassName : undefined
              )}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
