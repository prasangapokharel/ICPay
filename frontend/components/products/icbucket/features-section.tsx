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
    <section className="border-b border-border/60 bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">{t("subtitle")}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {FEATURE_IDS.map((id, index) => (
              <Card key={id} className="border-muted transition-colors hover:border-primary/50">
                <CardHeader className="space-y-3">
                  <HugeiconsIcon icon={FEATURE_ICONS[index]} className="size-6 text-primary" />
                  <CardTitle className="text-lg">{t(`items.${id}.title`)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{t(`items.${id}.description`)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
