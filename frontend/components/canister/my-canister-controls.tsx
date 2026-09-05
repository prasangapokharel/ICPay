"use client"

import { useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Camera01Icon,
  Copy01Icon,
  Delete02Icon,
  FuelIcon,
  LinkSquare02Icon,
  PlayIcon,
  StopIcon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MyCanisterTopupDialog } from "@/components/canister/my-canister-topup-dialog"
import { useAuth } from "@/components/auth/auth-provider"
import {
  formatManageError,
  startCanister,
  stopCanister,
} from "@/services/canister/management"
import { canisterDashboardUrl } from "@/services/cycles/topUp"
import { rememberCanister } from "@/lib/canister/savedCanisters"
import type { CanisterStatusState } from "@/hooks/canister/useCanisterStatus"

export function MyCanisterControls({
  canisterId,
  status,
  onRefresh,
  onCopyId,
  onRemove,
}: {
  canisterId: string
  status: CanisterStatusState
  onRefresh: () => void
  onCopyId: () => void
  onRemove: () => void
}) {
  const t = useTranslations("myCanisters")
  const { identity } = useAuth()
  const [busy, setBusy] = useState<"start" | "stop" | null>(null)
  const [stopOpen, setStopOpen] = useState(false)
  const [topupOpen, setTopupOpen] = useState(false)

  const canControl = status.kind === "ok" && status.data.isController
  const running = status.kind === "ok" && status.data.runStatus === "running"
  const stopped = status.kind === "ok" && status.data.runStatus === "stopped"
  const id = encodeURIComponent(canisterId)

  const run = async (action: "start" | "stop") => {
    if (!identity) return
    setBusy(action)
    try {
      if (action === "start") await startCanister(identity, canisterId)
      else await stopCanister(identity, canisterId)
      rememberCanister(identity.getPrincipal().toText(), canisterId)
      onRefresh()
    } catch (e) {
      toast.error(formatManageError(e))
    } finally {
      setBusy(null)
      setStopOpen(false)
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="gap-1.5"
          disabled={!canControl || running || busy != null}
          onClick={() => void run("start")}
        >
          <HugeiconsIcon icon={PlayIcon} className="size-3.5" />
          {busy === "start" ? t("starting") : t("start")}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="gap-1.5"
          disabled={!canControl || stopped || busy != null}
          onClick={() => setStopOpen(true)}
        >
          <HugeiconsIcon icon={StopIcon} className="size-3.5" />
          {t("stop")}
        </Button>
        <Button
          type="button"
          size="sm"
          className="gap-1.5"
          disabled={busy != null}
          onClick={() => setTopupOpen(true)}
        >
          <HugeiconsIcon icon={FuelIcon} className="size-3.5" />
          {t("topUp")}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button type="button" size="sm" variant="ghost" className="px-2" />}
          >
            {t("more")}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-48">
            <DropdownMenuGroup>
              <DropdownMenuItem render={<Link href={`/canister/snapshots?id=${id}`} />}>
                <HugeiconsIcon icon={Camera01Icon} className="size-4" />
                {t("snapshots")}
              </DropdownMenuItem>
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
              >
                <HugeiconsIcon icon={LinkSquare02Icon} className="size-4" />
                {t("dashboard")}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={onRemove}>
              <HugeiconsIcon icon={Delete02Icon} className="size-4" />
              {t("remove")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={stopOpen} onOpenChange={setStopOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("stopConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("stopConfirmBody")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("topUpCancel")}</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy === "stop"}
              onClick={() => void run("stop")}
            >
              {busy === "stop" ? t("stopping") : t("stop")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <MyCanisterTopupDialog
        open={topupOpen}
        onOpenChange={setTopupOpen}
        canisterId={canisterId}
        onDone={onRefresh}
      />
    </>
  )
}
