"use client"

import { useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { createAvatar } from "@dicebear/core"
import { adventurer } from "@dicebear/collection"
import { useAuth } from "@/components/auth/auth-provider"
import { CommunityIcon } from "@/components/community/community-icon"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/ui/utils"

export function CommunityNavRail() {
  const pathname = usePathname()
  const tNav = useTranslations("nav")
  const tHeader = useTranslations("header")
  const t = useTranslations("community")
  const { identity } = useAuth()
  const principal = identity?.getPrincipal().toText() ?? ""
  const avatarUri = useMemo(
    () => (principal ? createAvatar(adventurer, { seed: principal }).toDataUri() : ""),
    [principal]
  )

  return (
    <div className="flex h-full flex-col items-center gap-3 border-r border-border/60 bg-muted/20 py-3">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              aria-label={tHeader("profile")}
            />
          }
        >
          <Avatar size="sm">
            {avatarUri && <AvatarImage src={avatarUri} alt="" />}
            <AvatarFallback className="text-[10px] font-medium">
              {principal.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start">
          <DropdownMenuItem render={<Link href="/profile" />}>{tHeader("profile")}</DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/settings" />}>{tNav("menu")}</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RailButton href="/" label={tNav("home")} active={pathname === "/"}>
        <CommunityIcon name="home" size={20} />
      </RailButton>
      <RailButton
        href="/channels"
        label={t("title")}
        active={
          pathname === "/channels" ||
          (pathname.startsWith("/channels/") && pathname !== "/channels/new")
        }
      >
        <CommunityIcon name="community" size={20} />
      </RailButton>
      <RailButton href="/channels/new" label={t("newChannel")} active={pathname === "/channels/new"}>
        <CommunityIcon name="upload" size={20} />
      </RailButton>

      <div className="flex-1" />

      <RailButton href="/settings" label={tNav("menu")} active={pathname.startsWith("/settings")}>
        <CommunityIcon name="settings" size={20} />
      </RailButton>
    </div>
  )
}

function RailButton({
  href,
  label,
  active,
  children,
}: {
  href: string
  label: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Link
            href={href}
            prefetch
            aria-label={label}
            aria-current={active ? "page" : undefined}
            className={cn(buttonVariants({ variant: active ? "secondary" : "ghost", size: "icon" }), active && "bg-muted")}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}
