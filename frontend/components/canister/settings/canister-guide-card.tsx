"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Book02Icon,
  InformationCircleIcon,
  AiSecurity01Icon,
  CpuIcon,
  EyeIcon,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/ui/utils"

export function CanisterGuideCard({
  defaultOpen = false,
  className,
}: {
  defaultOpen?: boolean
  className?: string
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className={cn(
        "rounded-2xl border border-primary/20 bg-primary/5 transition-all overflow-hidden shadow-xs",
        className
      )}
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between p-4 sm:p-5 text-left hover:bg-primary/10 transition-colors cursor-pointer">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <HugeiconsIcon icon={Book02Icon} className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Internet Computer Canister Architecture Guide
            </h3>
            <p className="text-xs text-muted-foreground">
              Learn how controllers, compute allocations, memory limits, and log visibility work.
            </p>
          </div>
        </div>
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          className={cn(
            "size-4 text-muted-foreground transition-transform duration-200 shrink-0",
            !open && "-rotate-90"
          )}
        />
      </CollapsibleTrigger>

      <CollapsibleContent className="border-t border-primary/15 p-5 space-y-4 text-xs text-muted-foreground leading-relaxed">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5 rounded-xl border border-border/40 bg-card/60 p-3.5">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <HugeiconsIcon icon={AiSecurity01Icon} className="size-4 text-primary" />
              <span>Controllers</span>
            </div>
            <p>
              Controllers hold root cryptographic authority over this canister. They can deploy code,
              install WASM modules, inspect status, and modify settings. Always maintain at least one
              backup controller identity.
            </p>
          </div>

          <div className="space-y-1.5 rounded-xl border border-border/40 bg-card/60 p-3.5">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <HugeiconsIcon icon={InformationCircleIcon} className="size-4 text-destructive" />
              <span>Freezing Threshold</span>
            </div>
            <p>
              Number of seconds of idle cycle burn guaranteed before the canister freezes. Freezing
              stops message execution to prevent the canister from exhausting all cycles and having its
              state permanently deleted.
            </p>
          </div>

          <div className="space-y-1.5 rounded-xl border border-border/40 bg-card/60 p-3.5">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <HugeiconsIcon icon={CpuIcon} className="size-4 text-foreground" />
              <span>Compute & Memory</span>
            </div>
            <p>
              Compute allocation (0–100%) reserves a guaranteed fraction of subnet CPU cores. Memory
              allocation guarantees physical RAM on subnet nodes (0 = dynamic up to 48 GiB).
            </p>
          </div>

          <div className="space-y-1.5 rounded-xl border border-border/40 bg-card/60 p-3.5">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <HugeiconsIcon icon={EyeIcon} className="size-4 text-emerald-500" />
              <span>Log Visibility</span>
            </div>
            <p>
              Controls whether on-chain execution logs and trap backtraces are restricted strictly to
              controllers or readable publicly by any caller via the IC management canister.
            </p>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
