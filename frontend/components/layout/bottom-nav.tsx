"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import { Home01Icon, UserMultipleIcon, Upload01Icon, Menu01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Home", icon: Home01Icon },
  { href: "/icpverse", label: "ICPverse", icon: UserMultipleIcon },
  { href: "/transfer", label: "Withdraw", icon: Upload01Icon },
  { href: "/settings", label: "Menu", icon: Menu01Icon },
]

export function BottomNav() {
  const pathname = usePathname()
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  // Split around the centered Buy action so the raised button sits mid-row.
  const left = navItems.slice(0, 2)
  const right = navItems.slice(2)

  return (
    <nav className="sticky bottom-0 z-50 mt-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-8">
      <div className="relative">
        {/* The raised button sits outside the bar: the glass surface clips its own
            children (overflow-hidden powers the inset border), so it is a sibling. */}
        <Link
          href="/username"
          aria-label="Buy a username"
          className="absolute -top-6 left-1/2 z-10 flex size-14 -translate-x-1/2 items-center justify-center transition-transform active:scale-95"
        >
          <Image
            src="/images/navballcenter/1.png"
            alt=""
            width={112}
            height={112}
            priority
            className="size-14 object-contain drop-shadow-lg animate-pulse"
          />
        </Link>

        <div className="liquid-glass-strong grid h-16 grid-cols-5 items-center rounded-3xl px-2 shadow-lg">
          {left.map((item) => (
            <NavTab key={item.href} {...item} active={isActive(item.href)} />
          ))}
          <span aria-hidden />
          {right.map((item) => (
            <NavTab key={item.href} {...item} active={isActive(item.href)} />
          ))}
        </div>
      </div>
    </nav>
  )
}

function NavTab({
  href,
  label,
  icon,
  active,
}: {
  href: string
  label: string
  icon: IconSvgElement
  active: boolean
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex h-full flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium transition-colors",
        active ? "text-primary" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <HugeiconsIcon icon={icon} className="size-5" strokeWidth={1.75} />
      <span>{label}</span>
      <span
        className={cn(
          "absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-primary transition-opacity",
          active ? "opacity-100" : "opacity-0",
        )}
      />
    </Link>
  )
}
