"use client"

import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { LinkSquare02Icon } from "@hugeicons/core-free-icons"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ProposalRow } from "@/services/governance/governance"
import { nnsProposalUrl } from "@/services/governance/governance"

export function ProposalDetailDrawer({
  proposal,
  open,
  onOpenChange,
}: {
  proposal: ProposalRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const t = useTranslations("governance")

  if (!proposal) return null

  const dashboardUrl =
    proposal.source === "nns" ? nnsProposalUrl(proposal.id) : undefined

  return (
    <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle>
      <DrawerContent>
        <DrawerHeader>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge variant="secondary" className="text-[10px] uppercase">
              {proposal.source}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {proposal.status}
            </Badge>
          </div>
          <DrawerTitle className="text-center text-base leading-snug">
            {proposal.title}
          </DrawerTitle>
          <DrawerDescription className="text-center text-xs">
            {t("proposalId", { id: proposal.id.toString() })}
            {proposal.ledgerId ? ` · ${proposal.ledgerId}` : ""}
          </DrawerDescription>
        </DrawerHeader>

        <div className="max-h-[50vh] space-y-4 overflow-y-auto px-4 pb-2">
          {proposal.summary ? (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">{t("summary")}</p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{proposal.summary}</p>
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground">{t("noSummary")}</p>
          )}
        </div>

        {dashboardUrl ? (
          <div className="px-4 pb-6 pt-2">
            <Button
              variant="outline"
              className="w-full"
              nativeButton={false}
              render={<a href={dashboardUrl} target="_blank" rel="noopener noreferrer" />}
            >
              <HugeiconsIcon icon={LinkSquare02Icon} className="size-4" />
              {t("viewOnDashboard")}
            </Button>
          </div>
        ) : null}
      </DrawerContent>
    </Drawer>
  )
}
