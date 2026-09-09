"use client"

import { useState } from "react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserAdd01Icon,
  UserGroupIcon,
  Delete02Icon,
  AiSecurity01Icon,
} from "@hugeicons/core-free-icons"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
  Principal,
  addController,
  removeController,
  formatManageError,
} from "@/services/canister/management"

export function CanisterControllersCard({
  canisterId,
  controllers,
  isController,
  onRefresh,
}: {
  canisterId: string
  controllers: string[]
  isController: boolean
  onRefresh: () => void
}) {
  const { identity } = useAuth()
  const principal = identity?.getPrincipal().toText() ?? null

  const [newControllerText, setNewControllerText] = useState("")
  const [adding, setAdding] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<string | null>(null)
  const [removing, setRemoving] = useState(false)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!identity || !canisterId) return
    const text = newControllerText.trim()
    if (!text) return

    try {
      const p = Principal.fromText(text)
      if (p.isAnonymous()) {
        toast.error("Anonymous principal is not allowed")
        return
      }
    } catch {
      toast.error("Invalid principal format")
      return
    }

    setAdding(true)
    try {
      await addController(identity, canisterId, text)
      toast.success("Controller added successfully")
      setNewControllerText("")
      onRefresh()
    } catch (err) {
      toast.error(formatManageError(err))
    } finally {
      setAdding(false)
    }
  }

  const handleRemove = async () => {
    if (!identity || !canisterId || !removeTarget) return
    setRemoving(true)
    try {
      await removeController(identity, canisterId, removeTarget)
      toast.success("Controller removed successfully")
      setRemoveTarget(null)
      onRefresh()
    } catch (err) {
      toast.error(formatManageError(err))
    } finally {
      setRemoving(false)
    }
  }

  return (
    <>
      <Card className="rounded-2xl border border-border/40 bg-card/40 shadow-xs">
        <CardHeader>
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <HugeiconsIcon icon={UserGroupIcon} className="size-4 text-primary" />
            <CardTitle className="text-base">Canister Controllers</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Controllers possess administrative privileges over this canister. They can upgrade WASM
            code, change settings, start/stop execution, and manage cycles.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {controllers.map((ctrl) => {
              const isYou = principal === ctrl
              const canRemove = isController && controllers.length > 1
              return (
                <div
                  key={ctrl}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border/40 bg-muted/20 p-3 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon icon={AiSecurity01Icon} className="size-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate font-mono font-medium text-foreground">
                        {ctrl}
                      </span>
                      {isYou && (
                        <Badge variant="secondary" className="px-1.5 py-0 text-[10px] shrink-0">
                          You
                        </Badge>
                      )}
                    </div>
                  </div>
                  {canRemove && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={removing}
                      onClick={() => setRemoveTarget(ctrl)}
                      className="h-7 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <HugeiconsIcon icon={Delete02Icon} className="mr-1 size-3.5" />
                      Remove
                    </Button>
                  )}
                </div>
              )
            })}
          </div>

          {isController && (
            <form onSubmit={handleAdd} className="space-y-2.5 pt-2">
              <Label htmlFor="new-ctrl-input" className="text-xs font-medium">
                Add New Controller
              </Label>
              <div className="flex gap-2">
                <Input
                  id="new-ctrl-input"
                  placeholder="Principal ID (e.g. 2vxsx-theme-sample...)"
                  value={newControllerText}
                  onChange={(e) => setNewControllerText(e.target.value)}
                  className="font-mono text-xs"
                  disabled={adding}
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={adding || !newControllerText.trim()}
                  className="shrink-0 gap-1.5"
                >
                  <HugeiconsIcon icon={UserAdd01Icon} className="size-4" />
                  {adding ? "Adding…" : "Add Controller"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={removeTarget != null}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove controller?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 text-xs">
              <p>Are you sure you want to remove this principal as a controller?</p>
              <p className="break-all font-mono font-medium text-foreground">{removeTarget}</p>
              <p>
                This identity will immediately lose administrative access to manage or upgrade this
                canister.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={removing}
              onClick={handleRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removing ? "Removing…" : "Remove Controller"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
