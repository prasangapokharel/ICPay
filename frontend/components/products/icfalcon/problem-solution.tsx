"use client"

import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Layers01Icon,
  TerminalIcon,
  LinkSquare02Icon,
  Package01Icon,
} from "@hugeicons/core-free-icons"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

const PROBLEM_IDS = ["0", "1", "2", "3"] as const
const SOLUTION_ICONS = [
  Layers01Icon,
  TerminalIcon,
  LinkSquare02Icon,
  Package01Icon,
] as const

export function ProblemSolution() {
  const t = useTranslations("publicSite.icfalcon.problemSolution")

  return (
    <section className="border-b border-border/60 bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center space-y-3">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl bg-linear-to-b from-foreground via-foreground/90 to-foreground/45 bg-clip-text text-transparent">
              {t("title")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t("subtitle")}</p>
          </div>

          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="mb-6 flex items-center gap-2">
                <span className="size-2 rounded-full bg-destructive/80" />
                <h3 className="text-xl font-semibold tracking-tight">{t("problemHeading")}</h3>
              </div>
              <div className="space-y-4">
                {PROBLEM_IDS.map((id) => (
                  <Card key={id} size="sm" className="border-border/60 bg-card/60 backdrop-blur-xs transition-colors hover:border-destructive/30 hover:bg-card/90">
                    <CardHeader>
                      <CardTitle className="text-base">{t(`problems.${id}.title`)}</CardTitle>
                      <CardDescription className="text-sm leading-relaxed">{t(`problems.${id}.description`)}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-6 flex items-center gap-2">
                <span className="size-2 rounded-full bg-primary" />
                <h3 className="text-xl font-semibold tracking-tight">{t("solutionHeading")}</h3>
              </div>
              <div className="space-y-4">
                {PROBLEM_IDS.map((id, index) => (
                  <Card key={id} size="sm" className="border-border/60 bg-card/60 backdrop-blur-xs transition-colors hover:border-primary/40 hover:bg-card/90">
                    <CardHeader>
                      <CardTitle className="flex items-start gap-3 text-base">
                        <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                          <HugeiconsIcon
                            icon={SOLUTION_ICONS[index]}
                            className="size-4"
                          />
                        </div>
                        <span className="pt-0.5">{t(`solutions.${id}.title`)}</span>
                      </CardTitle>
                      <CardDescription className="pl-10 text-sm leading-relaxed">{t(`solutions.${id}.description`)}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
