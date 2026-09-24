"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Book02Icon,
  ArrowRight01Icon,
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

  const guides = [
    {
      href: "/blog/how-to-create-icp-canister",
      label: t("guideCreate"),
    },
    {
      href: "/blog/how-to-top-up-icp-cycles",
      label: t("guideTopUp"),
    },
    {
      href: "/blog/how-to-manage-icp-canister",
      label: t("guideManage"),
    },
    {
      href: "/blog/how-to-mint-cycles-ledger",
      label: t("guideMint"),
    },
    {
      href: "/blog/how-to-snapshot-icp-canister",
      label: t("guideSnapshot"),
    },
    {
      href: "/blog/what-is-cycles-minting-canister",
      label: t("guideCmc"),
    },
    {
      href: "/blog/icp-canister-controllers-explained",
      label: t("guideControllers"),
    },
    {
      href: "/blog/canister-out-of-cycles-fix",
      label: t("guideOutOfCycles"),
    },
  ] as const

  return (
    <>
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
                    <HugeiconsIcon
                      icon={card.icon}
                      className="size-5 text-primary"
                      strokeWidth={1.75}
                    />
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

      <section className="border-b border-border/60 bg-background">
        <div className="mx-auto max-w-4xl px-4 py-10 md:px-6 md:py-14">
          <div className="mb-6 flex flex-col gap-1">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {t("guidesTitle")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("guidesSubtitle")}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {guides.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/60 p-3.5 text-sm transition-all hover:border-primary/40 hover:bg-card"
              >
                <div className="flex items-center gap-2.5">
                  <HugeiconsIcon
                    icon={Book02Icon}
                    className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                  />
                  <span className="font-medium text-foreground">{label}</span>
                </div>
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  className="size-4 shrink-0 text-muted-foreground opacity-60 transition-all group-hover:translate-x-0.5 group-hover:text-primary group-hover:opacity-100"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
