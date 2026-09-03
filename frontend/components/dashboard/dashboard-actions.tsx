"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDataTransferHorizontalIcon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  Exchange01Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type DashboardAction = {
  href: string
  labelKey: "common.send" | "common.receive" | "common.swap" | "transactions.type.transfer"
  icon: typeof ArrowUp01Icon
}

const actions: DashboardAction[] = [
  { href: "/transfer", labelKey: "common.send", icon: ArrowUp01Icon },
  { href: "/deposit", labelKey: "common.receive", icon: ArrowDown01Icon },
  { href: "/trade", labelKey: "common.swap", icon: Exchange01Icon },
  {
    href: "/withdraw",
    labelKey: "transactions.type.transfer",
    icon: ArrowDataTransferHorizontalIcon,
  },
]

export function DashboardActions() {
  const t = useTranslations()

  return (
    <>
      <div className="grid grid-cols-4 gap-2 md:hidden">
        {actions.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            prefetch
            aria-label={t(item.labelKey)}
            className="flex flex-col items-center gap-1.5 transition-transform active:scale-95"
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-muted text-foreground">
              <HugeiconsIcon icon={item.icon} className="size-5" strokeWidth={1.75} />
            </span>
            <span className="text-[11px] font-medium lowercase text-foreground">
              {t(item.labelKey)}
            </span>
          </Link>
        ))}
      </div>

      <Card className="hidden md:flex">
        <CardHeader className="border-b">
          <CardTitle>{t("dashboard.quickActions")}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 pt-4">
          {actions.map((item) => (
            <Button
              key={item.href}
              variant={item.href === "/trade" ? "default" : "outline"}
              className="h-10 justify-start gap-2 rounded-xl px-3"
              nativeButton={false}
              render={<Link href={item.href} />}
            >
              <HugeiconsIcon icon={item.icon} className="size-4" strokeWidth={1.75} />
              <span className="truncate text-sm font-medium">{t(item.labelKey)}</span>
            </Button>
          ))}
        </CardContent>
      </Card>
    </>
  )
}
