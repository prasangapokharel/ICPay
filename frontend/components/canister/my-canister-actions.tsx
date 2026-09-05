"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Camera01Icon,
  Copy01Icon,
  Delete02Icon,
  LinkSquare02Icon,
  Package01Icon,
  Settings01Icon,
  UserIcon,
  Wallet01Icon,
  ZapIcon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { canisterDashboardUrl } from "@/services/cycles/topUp"

export function MyCanisterActions({
  canisterId,
  onCopyId,
  onCopyPrincipal,
  onRemove,
  disabled,
}: {
  canisterId: string
  onCopyId: () => void
  onCopyPrincipal: () => void
  onRemove: () => void
  disabled?: boolean
}) {
  const t = useTranslations("myCanisters")
  const id = encodeURIComponent(canisterId)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={disabled}
          render={<Button type="button" size="sm" disabled={disabled} className="gap-1.5" />}
        >
          {t("menuActions")}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-[11px] text-muted-foreground">
              {t("menuGroupActions")}
            </DropdownMenuLabel>
            <DropdownMenuItem render={<Link href={`/canister/manage?id=${id}`} />}>
              <HugeiconsIcon icon={Settings01Icon} className="size-4" />
              {t("manage")}
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href={`/topup?canister=${id}`} />}>
              <HugeiconsIcon icon={ZapIcon} className="size-4" />
              {t("topUp")}
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href={`/canister/snapshots?id=${id}`} />}>
              <HugeiconsIcon icon={Camera01Icon} className="size-4" />
              {t("snapshots")}
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/canister/cycles" />}>
              <HugeiconsIcon icon={Wallet01Icon} className="size-4" />
              {t("cycles")}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-[11px] text-muted-foreground">
              {t("menuGroupReference")}
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={onCopyId}>
              <HugeiconsIcon icon={Copy01Icon} className="size-4" />
              {t("copyId")}
            </DropdownMenuItem>
            <DropdownMenuItem
              render={
                <a
                  href={canisterDashboardUrl(canisterId)}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
              className="pr-2"
            >
              <HugeiconsIcon icon={LinkSquare02Icon} className="size-4" />
              <span className="flex-1">{t("dashboard")}</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem variant="destructive" onClick={onRemove}>
              <HugeiconsIcon icon={Delete02Icon} className="size-4" />
              {t("remove")}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        type="button"
        size="sm"
        variant="outline"
        className="gap-1.5"
        onClick={onCopyPrincipal}
      >
        <HugeiconsIcon icon={UserIcon} className="size-3.5" />
        {t("menuBackup")}
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="gap-1.5"
        nativeButton={false}
        render={<Link href="/canister/create" />}
      >
        <HugeiconsIcon icon={Package01Icon} className="size-3.5" />
        {t("menuCreate")}
      </Button>
    </div>
  )
}
