"use client"

import { useMemo } from "react"
import useSWR from "swr"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { MyCanisterDetails, type CanisterDetailTab } from "@/components/canister/details"
import { useAuth } from "@/components/auth/auth-provider"
import { useCanisterStatus } from "@/hooks/canister/useCanisterStatus"
import { useSavedCanisterEntries } from "@/hooks/canister/useSavedCanisters"
import { fetchCanisterIndexMeta } from "@/services/canister/controlledCanisters"
import { copyText } from "@/lib/wallet/utils"
import { cn } from "@/lib/ui/utils"

export function CanisterDetailDrawer({
  open,
  onOpenChange,
  canisterId,
  initialTab = "overview",
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  canisterId: string | null
  initialTab?: CanisterDetailTab
}) {
  const t = useTranslations("myCanisters")
  const isMobile = useIsMobile()
  const { identity, isAuthenticated } = useAuth()
  const [copied, setCopied] = useState(false)

  const principal = identity?.getPrincipal().toText() ?? null
  const entries = useSavedCanisterEntries(principal)
  const nameById = useMemo(() => new Map(entries.map((e) => [e.id, e.name])), [entries])
  const localName = canisterId ? nameById.get(canisterId) ?? "" : ""

  const status = useCanisterStatus(
    identity,
    canisterId ?? "",
    Boolean(isAuthenticated && canisterId && open)
  )

  const { data: indexMeta } = useSWR(
    canisterId && open ? (["canister-index-meta", canisterId] as const) : null,
    ([, id]) => fetchCanisterIndexMeta(id),
    { revalidateOnFocus: false, dedupingInterval: 120_000 }
  )
  const meta = indexMeta ?? null

  const handleCopy = () => {
    if (!canisterId) return
    copyText(canisterId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!canisterId) return null

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      showSwipeHandle={isMobile}
      swipeDirection={isMobile ? "down" : "right"}
    >
      <DrawerContent className="data-[swipe-axis=x]:sm:w-[560px] data-[swipe-axis=x]:sm:max-w-[560px] flex flex-col h-full max-h-[94dvh] sm:max-h-dvh">
        <DrawerHeader className="border-b border-border/60 pb-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1 text-left">
              <DrawerTitle className="truncate text-base font-semibold">
                {localName || t("detailTitle")}
              </DrawerTitle>
              <DrawerDescription className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground mt-0.5">
                <span className="truncate">{canisterId}</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 rounded hover:text-foreground cursor-pointer transition-colors shrink-0"
                  title="Copy canister ID"
                >
                  <HugeiconsIcon
                    icon={copied ? Tick02Icon : Copy01Icon}
                    className={cn("size-3", copied && "text-emerald-500")}
                  />
                </button>
              </DrawerDescription>
            </div>
            <DrawerClose render={<Button variant="ghost" size="icon-sm" className="size-8 rounded-full">✕</Button>} />
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <MyCanisterDetails
            canisterId={canisterId}
            localName={localName}
            meta={meta}
            status={status}
            defaultTab={initialTab}
            onCopyId={handleCopy}
            onRefresh={() => status.refresh()}
          />
        </div>

        <DrawerFooter className="border-t border-border/60 pt-2 pb-3">
          <DrawerClose render={<Button variant="outline" className="w-full text-xs h-8">Close</Button>} />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
