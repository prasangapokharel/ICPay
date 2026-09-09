"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  HelpCircleIcon,
  ArrowDown01Icon,
  CpuIcon,
  FuelStationIcon,
  Blockchain01Icon,
  AiSecurity01Icon,
} from "@hugeicons/core-free-icons"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/ui/utils"

export function CanisterOverviewGuide() {
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
                Canister Architecture Guide
              </h3>
              <p className="text-xs text-muted-foreground">
                Understand how canisters run, burn cycles, and replicate across the Internet Computer.
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
              {/* Reverse Gas Model */}
              <div className="rounded-xl border border-border/40 bg-card/40 p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <HugeiconsIcon icon={FuelStationIcon} className="size-4 text-pink-500" />
                  <span>Reverse-Gas Model</span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Unlike traditional blockchains where users pay gas per transaction, ICP canisters pay for their own compute and storage using cycles. 1 Trillion cycles (1 T) equals 1 XDR (~$1.35 USD).
                </p>
              </div>

              {/* Memory Model */}
              <div className="rounded-xl border border-border/40 bg-card/40 p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <HugeiconsIcon icon={CpuIcon} className="size-4 text-cyan-500" />
                  <span>WASM & Stable Memory</span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Wasm memory holds the 32-bit runtime heap (up to 4 GiB). Stable memory is 64-bit persistent storage (up to 400 GiB) that survives canister upgrades without data loss.
                </p>
              </div>

              {/* Lifecycle States */}
              <div className="rounded-xl border border-border/40 bg-card/40 p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <HugeiconsIcon icon={Blockchain01Icon} className="size-4 text-emerald-500" />
                  <span>Lifecycle Management</span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Running canisters accept queries and ingress calls. Stopping waits for ongoing calls to complete before pausing. Stopped canisters can be safely upgraded or taken snapshot of.
                </p>
              </div>

              {/* Subnet Consensus */}
              <div className="rounded-xl border border-border/40 bg-card/40 p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <HugeiconsIcon icon={AiSecurity01Icon} className="size-4 text-amber-500" />
                  <span>Subnet Replication</span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Every message execution is replicated across 13 to 40 independent node machines located in multiple independent data centers worldwide, ensuring tamperproof execution.
                </p>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
