"use client"

import { useState } from "react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { EyeIcon, FloppyDiskIcon } from "@hugeicons/core-free-icons"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth/auth-provider"
import {
  LogVisibility,
  updateCanisterSettings,
  formatManageError,
} from "@/services/canister/management"

export function CanisterVisibilityCard({
  canisterId,
  initialLogVisibility,
  isController,
  onRefresh,
}: {
  canisterId: string
  initialLogVisibility?: "controllers" | "public"
  isController: boolean
  onRefresh: () => void
}) {
  const { identity } = useAuth()
  const [logPublic, setLogPublic] = useState(initialLogVisibility === "public")
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!identity || !canisterId) return
    setSaving(true)
    try {
      await updateCanisterSettings(identity, canisterId, {
        logVisibility: logPublic ? LogVisibility.Public : LogVisibility.Controllers,
      })
      toast.success("Canister log visibility updated")
      onRefresh()
    } catch (err) {
      toast.error(formatManageError(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="rounded-2xl border border-border/40 bg-card/40 shadow-xs">
      <CardHeader>
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <HugeiconsIcon icon={EyeIcon} className="size-4 text-primary" />
          <CardTitle className="text-base">Canister Visibility & Logs</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Determine who can inspect execution logs, error backtraces, and runtime telemetry.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 rounded-xl border border-border/40 bg-muted/20 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">Log Inspection Policy</p>
              <p className="text-xs text-muted-foreground">
                {logPublic
                  ? "Logs are publicly queryable by any caller on the Internet Computer network."
                  : "Logs are private and only queryable by authorized canister controllers."}
              </p>
            </div>
            <Badge variant={logPublic ? "default" : "secondary"} className="shrink-0">
              {logPublic ? "Public Access" : "Controllers Only"}
            </Badge>
          </div>

          {isController && (
            <div className="flex items-center gap-2.5 pt-2">
              <Button
                type="button"
                variant={!logPublic ? "default" : "outline"}
                size="sm"
                onClick={() => setLogPublic(false)}
                className="text-xs"
              >
                Controllers Only (Private)
              </Button>
              <Button
                type="button"
                variant={logPublic ? "default" : "outline"}
                size="sm"
                onClick={() => setLogPublic(true)}
                className="text-xs"
              >
                Public Access
              </Button>
            </div>
          )}
        </div>

        {isController && (
          <div className="flex justify-end pt-1">
            <Button type="button" size="sm" disabled={saving} onClick={handleSave} className="gap-1.5">
              <HugeiconsIcon icon={FloppyDiskIcon} className="size-4" />
              {saving ? "Saving…" : "Save Visibility"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
