"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useTheme } from "next-themes"
import { createAvatar } from "@dicebear/core"
import { adventurer } from "@dicebear/collection"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserIcon, Settings01Icon, Logout01Icon, Sun01Icon, Moon02Icon } from "@hugeicons/core-free-icons"
import { useAuth } from "@/components/auth/auth-provider"
import { shortPrincipal } from "@/lib/wallet-utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AppHeader() {
  const { identity, logout } = useAuth()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // resolvedTheme is undefined until next-themes reads localStorage on the
  // client, so rendering the icon before mount would flash the wrong one.
  useEffect(() => setMounted(true), [])

  const principal = identity?.getPrincipal().toText() ?? ""
  const short = shortPrincipal(principal)

  const avatarUri = useMemo(
    () => (principal ? createAvatar(adventurer, { seed: principal }).toDataUri() : ""),
    [principal]
  )

  const isDark = resolvedTheme === "dark"

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between bg-background/80 px-4 backdrop-blur-xl">
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Account menu"
          className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Avatar className="size-9">
            {avatarUri && <AvatarImage src={avatarUri} alt="" />}
            <AvatarFallback className="bg-muted text-xs font-medium">
              {principal.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="font-normal">
              <span className="block text-xs text-muted-foreground">Signed in as</span>
              <span className="block truncate font-mono text-xs">{short}</span>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem render={<Link href="/profile" />}>
            <HugeiconsIcon icon={UserIcon} className="size-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/settings" />}>
            <HugeiconsIcon icon={Settings01Icon} className="size-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => logout()}>
            <HugeiconsIcon icon={Logout01Icon} className="size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <button
        type="button"
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="flex size-9 items-center justify-center rounded-full border bg-background text-foreground transition-colors hover:bg-accent active:scale-95"
      >
        {mounted ? (
          isDark ? <HugeiconsIcon icon={Sun01Icon} className="size-4.5" /> : <HugeiconsIcon icon={Moon02Icon} className="size-4.5" />
        ) : (
          <span className="size-4.5" />
        )}
      </button>
    </header>
  )
}
