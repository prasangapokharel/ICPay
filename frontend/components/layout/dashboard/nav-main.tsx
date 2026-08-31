"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavIcon } from "@/components/layout/dashboard/nav-icon"
import { GradientBadge } from "@/components/ui/gradient-badge"
import { useAuth } from "@/components/auth/auth-provider"
import {
  isSidebarItemActive,
  SIDEBAR_FOOTER,
  SIDEBAR_SECTIONS,
  type SidebarNavItem,
} from "@/lib/navigation/app-sidebar-nav"
import { prefetchAppRoute } from "@/lib/navigation/prefetchRoute"

const itemClass =
  "h-8 gap-2.5 rounded-lg px-2.5 text-[13px] font-normal text-foreground [&>svg]:size-4 data-active:bg-muted data-active:font-medium"

export function DashboardNavMain() {
  const pathname = usePathname()
  const t = useTranslations()
  const { identity } = useAuth()

  return (
    <>
      {SIDEBAR_SECTIONS.map((section) => (
        <SidebarGroup key={section.sectionKey} className="py-1">
          <SidebarGroupLabel className="mb-0.5 h-6 px-2.5 text-[11px] font-medium text-muted-foreground">
            {t(`settings.sections.${section.sectionKey}`)}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {section.items.map((item) => (
                <NavRow
                  key={item.href}
                  item={item}
                  label={t(item.labelKey as never)}
                  active={isSidebarItemActive(pathname, item.href)}
                  onWarm={() => prefetchAppRoute(item.href, identity)}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  )
}

export function DashboardNavFooter() {
  const pathname = usePathname()
  const t = useTranslations()
  const { identity } = useAuth()

  return (
    <SidebarMenu className="gap-0.5">
      {SIDEBAR_FOOTER.map((item) => (
        <NavRow
          key={item.href}
          item={item}
          label={t(item.labelKey as never)}
          active={isSidebarItemActive(pathname, item.href)}
          onWarm={() => prefetchAppRoute(item.href, identity)}
        />
      ))}
    </SidebarMenu>
  )
}

function NavRow({
  item,
  label,
  active,
  onWarm,
}: {
  item: SidebarNavItem
  label: string
  active: boolean
  onWarm: () => void
}) {
  const t = useTranslations()

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={label}
        isActive={active}
        className={itemClass}
        render={<Link href={item.href} />}
        onMouseEnter={onWarm}
        onFocus={onWarm}
      >
        <NavIcon icon={item.icon} />
        <span className="min-w-0 flex-1 truncate">{label}</span>
        {item.badgeKey ? (
          <GradientBadge size="sm">{t(item.badgeKey as never)}</GradientBadge>
        ) : null}
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
