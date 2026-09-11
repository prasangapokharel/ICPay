"use client"

import { useState } from "react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { CpuIcon, FloppyDiskIcon } from "@hugeicons/core-free-icons"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/auth/auth-provider"
import { updateCanisterSettings, formatManageError, type CanisterStatusView } from "@/services/canister/management"

export function CanisterResourcesCard({
  canisterId,
  data,
  isController,
  onRefresh,
}: {
  canisterId: string
  data: CanisterStatusView
  isController: boolean
  onRefresh: () => void
}) {
  const { identity } = useAuth()

  const initialDays =
    data.freezingThresholdSeconds != null
      ? Math.max(1, Math.round(Number(data.freezingThresholdSeconds) / 86400))
      : 30
  const initialCompute =
    data.computeAllocationPercent != null ? Number(data.computeAllocationPercent) : 0
  const initialMem =
    data.memoryAllocationBytes != null
      ? Math.round(Number(data.memoryAllocationBytes) / (1024 * 1024))
      : 0
  const initialWasmMem =
    data.wasmMemoryLimitBytes != null
      ? Math.round(Number(data.wasmMemoryLimitBytes) / (1024 * 1024))
      : 0

  const [freezingDays, setFreezingDays] = useState(String(initialDays))
  const [computePercent, setComputePercent] = useState(String(initialCompute))
  const [memoryMb, setMemoryMb] = useState(String(initialMem))
  const [wasmMemoryMb, setWasmMemoryMb] = useState(String(initialWasmMem))
  const [saving, setSaving] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!identity || !canisterId) return

    const days = parseInt(freezingDays, 10)
    const compute = parseInt(computePercent, 10)
    const memory = parseInt(memoryMb, 10)
    const wasmMem = parseInt(wasmMemoryMb, 10)

    if (isNaN(days) || days < 0) {
      toast.error("Freezing threshold days must be a positive number")
      return
    }
    if (isNaN(compute) || compute < 0 || compute > 100) {
      toast.error("Compute allocation must be between 0% and 100%")
      return
    }
    if (isNaN(memory) || memory < 0) {
      toast.error("Memory allocation must be 0 or a positive number")
      return
    }
    if (isNaN(wasmMem) || wasmMem < 0) {
      toast.error("Wasm memory limit must be 0 or a positive number")
      return
    }

    setSaving(true)
    try {
      const freezingThreshold = BigInt(days) * 86400n
      const computeAllocation = BigInt(compute)
      const memoryAllocation = BigInt(memory) * 1024n * 1024n
      const wasmMemoryLimit = wasmMem > 0 ? BigInt(wasmMem) * 1024n * 1024n : 0n

      await updateCanisterSettings(identity, canisterId, {
        freezingThreshold,
        computeAllocation,
        memoryAllocation,
        ...(wasmMemoryLimit > 0n ? { wasmMemoryLimit } : {}),
      })
      toast.success("Canister resource limits updated successfully")
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
          <HugeiconsIcon icon={CpuIcon} className="size-4 text-primary" />
          <CardTitle className="text-base">Resource & Compute Limits</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Configure on-chain resource quotas, compute slice guarantees, and freezing protection
          supported by the IC management protocol.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Freezing Threshold */}
            <div className="space-y-1.5">
              <Label htmlFor="res-freezing" className="text-xs font-medium">
                Freezing Threshold (Days)
              </Label>
              <Input
                id="res-freezing"
                type="number"
                min="0"
                value={freezingDays}
                onChange={(e) => setFreezingDays(e.target.value)}
                disabled={!isController || saving}
                className="text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Time (default 30 days) the canister will survive idle burn before freezing its state.
              </p>
            </div>

            {/* Compute Allocation */}
            <div className="space-y-1.5">
              <Label htmlFor="res-compute" className="text-xs font-medium">
                Compute Allocation (%)
              </Label>
              <Input
                id="res-compute"
                type="number"
                min="0"
                max="100"
                value={computePercent}
                onChange={(e) => setComputePercent(e.target.value)}
                disabled={!isController || saving}
                className="text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Dedicated subnet CPU cores (0% = best effort, recommended for most applications).
              </p>
            </div>

            {/* Memory Allocation */}
            <div className="space-y-1.5">
              <Label htmlFor="res-mem" className="text-xs font-medium">
                Memory Allocation (MB)
              </Label>
              <Input
                id="res-mem"
                type="number"
                min="0"
                value={memoryMb}
                onChange={(e) => setMemoryMb(e.target.value)}
                disabled={!isController || saving}
                className="text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Guaranteed physical RAM reservation (0 = dynamic allocation up to 48 GiB).
              </p>
            </div>

            {/* Wasm Memory Limit */}
            <div className="space-y-1.5">
              <Label htmlFor="res-wasm" className="text-xs font-medium">
                Wasm Memory Limit (MB)
              </Label>
              <Input
                id="res-wasm"
                type="number"
                min="0"
                value={wasmMemoryMb}
                onChange={(e) => setWasmMemoryMb(e.target.value)}
                disabled={!isController || saving}
                className="text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Upper limit on 32-bit wasm linear heap (0 = protocol maximum 4 GiB).
              </p>
            </div>
          </div>

          {isController && (
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={saving} size="sm" className="gap-1.5">
                <HugeiconsIcon icon={FloppyDiskIcon} className="size-4" />
                {saving ? "Saving…" : "Save Resource Limits"}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
