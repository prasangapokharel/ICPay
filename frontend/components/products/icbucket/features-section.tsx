"use client"

import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  FolderLibraryIcon,
  CloudUploadIcon,
  Key01Icon,
  Globe02Icon,
  CodeIcon,
  ShieldIcon,
  SearchList01Icon,
  DashboardSpeed01Icon,
} from "@hugeicons/core-free-icons"

const FEATURE_ICONS = [
  FolderLibraryIcon,
  CloudUploadIcon,
  Key01Icon,
  Globe02Icon,
  CodeIcon,
  ShieldIcon,
  SearchList01Icon,
  DashboardSpeed01Icon,
] as const

const FEATURE_IDS = ["0", "1", "2", "3", "4", "5", "6", "7"] as const

export function FeaturesSection() {
  const t = useTranslations("publicSite.icbucket.features")

  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <div className="mb-12 space-y-3 text-center md:mb-14">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">{t("title")}</h2>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">{t("subtitle")}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {FEATURE_IDS.map((id, index) => (
            <Card
              key={id}
              className="border-border/60 bg-card rounded-2xl shadow-sm"
            >
              <CardHeader className="gap-3">
                <HugeiconsIcon
                  icon={FEATURE_ICONS[index]}
                  className="size-5 text-primary"
                  strokeWidth={1.75}
                />
                <CardTitle className="text-base font-semibold text-foreground">
                  {t(`items.${id}.title`)}
                </CardTitle>
                <CardContent className="p-0">
                  <p className="text-sm leading-relaxed text-muted-foreground">{t(`items.${id}.description`)}</p>
                </CardContent>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
