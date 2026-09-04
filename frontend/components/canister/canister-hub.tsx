"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Camera01Icon,
  Package01Icon,
  Settings01Icon,
  Wallet01Icon,
  ZapIcon,
} from "@hugeicons/core-free-icons"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function CanisterHub() {
  const t = useTranslations("canisterHub")

  const cards = [
    {
      href: "/canister/manage",
      icon: Settings01Icon,
      title: t("manageTitle"),
      description: t("manageDescription"),
    },
    {
      href: "/canister/create",
      icon: Package01Icon,
      title: t("createTitle"),
      description: t("createDescription"),
    },
    {
      href: "/canister/cycles",
      icon: Wallet01Icon,
      title: t("cyclesTitle"),
      description: t("cyclesDescription"),
    },
    {
      href: "/topup",
      icon: ZapIcon,
      title: t("topupTitle"),
      description: t("topupDescription"),
    },
    {
      href: "/canister/snapshots",
      icon: Camera01Icon,
      title: t("snapshotsTitle"),
      description: t("snapshotsDescription"),
    },
  ] as const

  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-10 md:px-6 md:py-14">
        <header className="flex flex-col gap-3 text-center lg:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            {t("eyebrow")}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {t("title")}
          </h1>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base lg:mx-0">
            {t("subtitle")}
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Link key={card.href} href={card.href} className="group block outline-none">
              <Card className="h-full transition-colors group-hover:border-primary/40 group-focus-visible:ring-2 group-focus-visible:ring-ring">
                <CardHeader className="gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <HugeiconsIcon icon={card.icon} className="size-5" strokeWidth={1.75} />
                  </span>
                  <CardTitle className="text-lg">{card.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {card.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        <p className="text-center text-xs leading-relaxed text-muted-foreground lg:text-left">
          {t("note")}
        </p>
      </div>
    </section>
  )
}
