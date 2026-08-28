"use client"

import Link from "next/link"
import Image from "next/image"
import { useTranslations } from "next-intl"

const actions = [
  {
    href: "/transfer",
    labelKey: "send" as const,
    icon: "/images/dashboard/icons8-circled-up-right-48.png",
  },
  {
    href: "/swap",
    labelKey: "swap" as const,
    icon: "/images/dashboard/icons8-dividends-48.png",
  },
  {
    href: "/deposit",
    labelKey: "receive" as const,
    icon: "/images/dashboard/icons8-circled-down-left-48.png",
  },
]

export function DashboardActions() {
  const t = useTranslations("common")

  return (
    <div className="flex justify-around ">
      {actions.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          prefetch
          aria-label={t(item.labelKey)}
          className="flex flex-col items-center gap-1.5 transition-transform active:scale-95"
        >
          <span className="flex size-11 items-center justify-center rounded-full bg-gray-800">
            <Image src={item.icon} alt="" width={20} height={20} className="size-5 object-contain" />
          </span>
          <span className="text-[11px] font-medium lowercase text-foreground">{t(item.labelKey)}</span>
        </Link>
      ))}
    </div>
  )
}
