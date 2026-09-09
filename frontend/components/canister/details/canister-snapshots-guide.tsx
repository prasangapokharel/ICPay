"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  HelpCircleIcon,
  ArrowDown01Icon,
  Camera01Icon,
  Clock01Icon,
  Alert02Icon,
  Coins01Icon,
} from "@hugeicons/core-free-icons"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/ui/utils"

export function CanisterSnapshotsGuide() {
  const [open, setOpen] = useState(false)

  return (
    <Card className="border-border/60 bg-gradient-to-br from-card/80 to-muted/20 backdrop-blur-xs transition-all">
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-center justify-between p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <HugeiconsIcon icon={HelpCircleIcon} className="size-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-foreground">
                Canister Snapshots Guide
              </h3>
              <p className="text-xs text-muted-foreground">
                Understand point-in-time state backups, restore procedures, and memory impacts on the Internet Computer.
              </p>
            </div>
          </div>
          <CollapsibleTrigger
            render={
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <span>{open ? "Hide guide" : "Learn more"}</span>
                <HugeiconsIcon
                  icon={ArrowDown01Icon}
                  className={cn("size-3.5 transition-transform duration-200", open && "rotate-180")}
                />
              </Button>
            }
          />
        </div>

        <CollapsibleContent>
          <CardContent className="border-t border-border/40 pt-4 pb-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Point in Time */}
              <div className="rounded-xl border border-border/40 bg-card/40 p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <HugeiconsIcon icon={Camera01Icon} className="size-4 text-blue-500" />
                  <span>Point-in-Time State</span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  A snapshot freezes the exact state of your canister, capturing the compiled WASM binary, heap memory, and 64-bit stable memory at a specific execution round.
                </p>
              </div>

              {/* Safe Upgrades */}
              <div className="rounded-xl border border-border/40 bg-card/40 p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <HugeiconsIcon icon={Clock01Icon} className="size-4 text-emerald-500" />
                  <span>Pre-Upgrade Safety</span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Best practice is to take a snapshot immediately prior to deploying code upgrades or running data migrations. If anything goes wrong, you can restore to this exact point.
                </p>
              </div>

              {/* State Restoration */}
              <div className="rounded-xl border border-border/40 bg-card/40 p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <HugeiconsIcon icon={Alert02Icon} className="size-4 text-amber-500" />
                  <span>Restore Considerations</span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Restoring a snapshot overwrites the canister&apos;s current memory and replaces the active WASM module with the snapshot&apos;s state. Any state written after the snapshot was taken will be lost.
                </p>
              </div>

              {/* Storage Overhead */}
              <div className="rounded-xl border border-border/40 bg-card/40 p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <HugeiconsIcon icon={Coins01Icon} className="size-4 text-pink-500" />
                  <span>Storage & Cycles Cost</span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Snapshots are stored on the subnet and consume canister memory allocation. Delete old or unneeded snapshots to minimize recurring storage cycle burn.
                </p>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
