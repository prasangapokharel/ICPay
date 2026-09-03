"use client"

import Link from "next/link"
import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { createAvatar } from "@dicebear/core"
import { adventurer } from "@dicebear/collection"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDataTransferHorizontalIcon,
  ArrowDown01Icon,
  ArrowUp01Icon,
} from "@hugeicons/core-free-icons"
import { useAuth } from "@/components/auth/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PUBLIC_WALLET_MENU_LINKS } from "@/lib/public/nav-wallet-menu"

const MENU_ICONS = {
  deposit: ArrowDown01Icon,
  transfer: ArrowDataTransferHorizontalIcon,
  withdraw: ArrowUp01Icon,
} as const

export function PublicNavAuth() {
  const tNav = useTranslations("publicSite.nav")
  const tDeposit = useTranslations("deposit")
  const tWithdraw = useTranslations("withdraw")
  const tTxType = useTranslations("transactions.type")
  const { identity, isAuthenticated, isLoading } = useAuth()
  const principal = identity?.getPrincipal().toText() ?? ""

  const avatarUri = useMemo(
    () => (principal ? createAvatar(adventurer, { seed: principal }).toDataUri() : ""),
    [principal]
  )

  const labels = {
    deposit: tDeposit("title"),
    transfer: tWithdraw("title"),
    withdraw: tTxType("withdraw"),
  } as const

  if (isLoading) {
    return <div className="size-9 shrink-0 animate-pulse rounded-full bg-muted" aria-hidden />
  }

  if (isAuthenticated) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-9 rounded-full p-0"
              aria-label={tNav("openWallet")}
            />
          }
        >
          <Avatar className="size-9">
            {avatarUri ? <AvatarImage src={avatarUri} alt="" /> : null}
            <AvatarFallback className="bg-muted text-xs font-medium">
              {principal.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44" sideOffset={8}>
          <DropdownMenuGroup>
            {PUBLIC_WALLET_MENU_LINKS.map((item) => (
              <DropdownMenuItem key={item.href} render={<Link href={item.href} />}>
                <HugeiconsIcon icon={MENU_ICONS[item.labelKey]} className="size-4" strokeWidth={1.75} />
                {labels[item.labelKey]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem render={<Link href="/home" />}>{tNav("wallet")}</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Button
      size="sm"
      nativeButton={false}
      render={<Link href="/login" />}
      className="rounded-full px-4"
    >
      {tNav("signIn")}
    </Button>
  )
}
