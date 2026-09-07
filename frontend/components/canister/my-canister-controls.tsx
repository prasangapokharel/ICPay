"use client"

import { useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Camera01Icon,
  CheckmarkCircle02Icon,
  Copy01Icon,
  FuelStationIcon,
  LinkSquare02Icon,
  MoreVerticalIcon,
  PlayIcon,
  SentIcon,
  Settings02Icon,
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MyCanisterTopupDialog } from "@/components/canister/my-canister-topup-dialog"
import { MyCanisterTransferDialog } from "@/components/canister/my-canister-transfer-dialog"
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
}: {
  canisterId: string
  status: CanisterStatusState
  onRefresh: () => void
  onCopyId: () => void
}) {
  const t = useTranslations("myCanisters")
  const { identity } = useAuth()
  const [busy, setBusy] = useState<"start" | "stop" | null>(null)
  const [copied, setCopied] = useState(false)
  const [stopOpen, setStopOpen] = useState(false)
  const [topupOpen, setTopupOpen] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)

  const canControl = status.kind === "ok" && status.data.isController
  const running = status.kind === "ok" && status.data.runStatus === "running"
  const stopped = status.kind === "ok" && status.data.runStatus === "stopped"
  const id = encodeURIComponent(canisterId)

  const handleCopy = () => {
    onCopyId()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
        {/* Start/Stop Toggle Button */}
        {running ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1.5"
            disabled={!canControl || busy != null}
            onClick={() => setStopOpen(true)}
          >
            <HugeiconsIcon icon={StopIcon} className="size-3.5" />
            {t("stop")}
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1.5"
            disabled={!canControl || busy != null}
            onClick={() => void run("start")}
          >
            <HugeiconsIcon icon={PlayIcon} className="size-3.5" />
            {busy === "start" ? t("starting") : t("start")}
          </Button>
        )}

        {/* Top-up Button */}
        <Button
          type="button"
          size="sm"
          className="gap-1.5"
          disabled={busy != null}
          onClick={() => setTopupOpen(true)}
        >
          <HugeiconsIcon icon={FuelStationIcon} className="size-3.5" />
          {t("topUp")}
        </Button>

        {/* Transfer Button */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="gap-1.5"
          disabled={!canControl || busy != null}
          onClick={() => setTransferOpen(true)}
        >
          <HugeiconsIcon icon={SentIcon} className="size-3.5" />
          {t("transfer")}
        </Button>

        {/* More Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button type="button" size="sm" variant="outline" className="px-2" />}>
            <HugeiconsIcon icon={MoreVerticalIcon} className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleCopy}>
                <HugeiconsIcon
                  icon={copied ? CheckmarkCircle02Icon : Copy01Icon}
                  className="mr-2 size-4"
                />
                {copied ? t("copied") : t("copyId")}
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href={`/canister/${id}/top-up`} />}>
                <HugeiconsIcon icon={FuelStationIcon} className="mr-2 size-4" />
                {t("topUpHistory")}
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href={`/canister/${id}/settings`} />}>
                <HugeiconsIcon icon={Settings02Icon} className="mr-2 size-4" />
                {t("settings")}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Running Status Badge */}
        {running && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600">
            <span className="size-1.5 rounded-full bg-green-600" />
            {t("running")}
          </span>
        )}
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
      <MyCanisterTransferDialog
        open={transferOpen}
        onOpenChange={setTransferOpen}
        fromCanisterId={canisterId}
        onDone={onRefresh}
      />
    </>
  )
}
