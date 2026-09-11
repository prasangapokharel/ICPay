"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Alert02Icon,
  PlayIcon,
  StopIcon,
  Delete02Icon,
} from "@hugeicons/core-free-icons"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { useAuth } from "@/components/auth/auth-provider"
import {
  startCanister,
  stopCanister,
  deleteCanister,
  formatManageError,
} from "@/services/canister/management"
import type { CanisterRunStatus } from "@/lib/canister/format"

export function CanisterLifecycleCard({
  canisterId,
  runStatus,
  isController,
  onRefresh,
}: {
  canisterId: string
  runStatus: CanisterRunStatus
  isController: boolean
  onRefresh: () => void
}) {
  const router = useRouter()
  const { identity } = useAuth()

  const [stopConfirmOpen, setStopConfirmOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [busyAction, setBusyAction] = useState<string | null>(null)

  const handleToggleState = async (action: "start" | "stop") => {
    if (!identity || !canisterId) return
    setBusyAction(action)
    try {
      if (action === "start") {
        await startCanister(identity, canisterId)
        toast.success("Canister started successfully")
      } else {
        await stopCanister(identity, canisterId)
        toast.success("Canister stopped successfully")
      }
      setStopConfirmOpen(false)
      onRefresh()
    } catch (err) {
      toast.error(formatManageError(err))
    } finally {
      setBusyAction(null)
    }
  }

  const handleDelete = async () => {
    if (!identity || !canisterId) return
    setBusyAction("delete")
    try {
      await deleteCanister(identity, canisterId)
      toast.success("Canister deleted successfully")
      router.push("/canister")
    } catch (err) {
      toast.error(formatManageError(err))
    } finally {
      setBusyAction(null)
      setDeleteConfirmOpen(false)
    }
  }

  return (
    <>
      <Card className="rounded-2xl border border-destructive/30 bg-card/40 shadow-xs">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive font-semibold">
            <HugeiconsIcon icon={Alert02Icon} className="size-4" />
            <CardTitle className="text-base">Canister Lifecycle & Danger Zone</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Manage canister execution state or permanently decommission this on-chain canister.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Start / Stop Section */}
          <div className="flex flex-col gap-3 rounded-xl border border-border/40 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                {runStatus === "running" ? "Stop Canister" : "Start Canister"}
              </p>
              <p className="text-xs text-muted-foreground">
                {runStatus === "running"
                  ? "Pause canister execution. In-flight messages finish, while new calls are rejected."
                  : "Resume normal canister execution, message ingress, and timers."}
              </p>
            </div>
            {runStatus === "running" ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!isController || busyAction != null}
                onClick={() => setStopConfirmOpen(true)}
                className="shrink-0 gap-1.5"
              >
                <HugeiconsIcon icon={StopIcon} className="size-4" />
                Stop Canister
              </Button>
            ) : (
              <Button
                type="button"
                variant="default"
                size="sm"
                disabled={!isController || busyAction != null}
                onClick={() => handleToggleState("start")}
                className="shrink-0 gap-1.5"
              >
                <HugeiconsIcon icon={PlayIcon} className="size-4" />
                {busyAction === "start" ? "Starting…" : "Start Canister"}
              </Button>
            )}
          </div>

          {/* Delete Canister Section */}
          <div className="flex flex-col gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-destructive">Delete Canister</p>
              <p className="text-xs text-muted-foreground">
                Irrevocably erase code, stable memory, and history. Remaining cycles are refunded to
                the controller cycles ledger. Must be stopped first.
              </p>
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={!isController || busyAction != null || runStatus !== "stopped"}
              onClick={() => setDeleteConfirmOpen(true)}
              className="shrink-0 gap-1.5"
            >
              <HugeiconsIcon icon={Delete02Icon} className="size-4" />
              Delete Canister
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stop Confirmation Dialog */}
      <AlertDialog open={stopConfirmOpen} onOpenChange={setStopConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Stop this canister?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Stopping pauses execution until you start it again. Only authorized controllers can
              start or stop canisters.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busyAction === "stop"}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={busyAction === "stop"}
              onClick={() => handleToggleState("stop")}
            >
              {busyAction === "stop" ? "Stopping…" : "Stop Canister"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Irrevocably delete this canister?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 text-xs">
              <p>This action is completely permanent and cannot be reversed.</p>
              <p className="break-all font-mono font-medium text-foreground">{canisterId}</p>
              <p>All canister memory, code, and stable state will be destroyed.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busyAction === "delete"}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={busyAction === "delete"}
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {busyAction === "delete" ? "Deleting…" : "Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
