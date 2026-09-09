"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { CrownIcon, SparklesIcon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/ui/utils"

export function PremiumLockedCard({
  title,
  description,
  badge = "ICPay Premium",
  actionText = "Get Premium Handle",
  href = "/username",
  className,
}: {
  title: string
  description: string
  badge?: string
  actionText?: string
  href?: string
  className?: string
}) {
  return (
    <Card className={cn("relative overflow-hidden border border-dashed border-border/80 bg-gradient-to-b from-card/80 to-card/40 text-center p-6 sm:p-8", className)}>
      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20 shadow-inner">
        <HugeiconsIcon icon={CrownIcon} className="size-6 text-primary" />
      </div>

      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
        <HugeiconsIcon icon={SparklesIcon} className="size-3" />
        <span>{badge}</span>
      </div>

      <h3 className="mt-3 text-base sm:text-lg font-semibold tracking-tight text-foreground">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-md text-xs sm:text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>

      <div className="mt-5 flex justify-center">
        <Button nativeButton={false} render={<Link href={href} />} className="gap-2 shadow-sm font-medium">
          <span>{actionText}</span>
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
        </Button>
      </div>
    </Card>
  )
}

export function PremiumGateDialog({
  open,
  onOpenChange,
  title,
  description,
  featureName = "This feature",
  actionText = "Get Premium Handle",
  href = "/username",
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  featureName?: string
  actionText?: string
  href?: string
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-4" showCloseButton>
        <DialogHeader className="text-center sm:text-left">
          <div className="mx-auto sm:mx-0 mb-2 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
            <HugeiconsIcon icon={CrownIcon} className="size-5 text-primary" />
          </div>
          <div className="inline-flex w-fit items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
            <span>ICPay Premium</span>
          </div>
          <DialogTitle className="text-lg font-semibold pt-1">{title}</DialogTitle>
          <DialogDescription className="text-xs leading-relaxed text-muted-foreground pt-1">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-border/60 bg-muted/40 p-3.5 text-xs text-muted-foreground space-y-1.5">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <HugeiconsIcon icon={SparklesIcon} className="size-3.5 text-primary" />
            <span>Premium handles include:</span>
          </div>
          <ul className="list-disc pl-4 space-y-1 text-[11px]">
            <li>1–4 character rare on-chain usernames (e.g. @pro, @dex)</li>
            <li>Verified Gold / Blue badge on all transactions & channels</li>
            <li>Full access to {featureName} & advanced controls</li>
          </ul>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            nativeButton={false}
            render={<Link href={href} onClick={() => onOpenChange(false)} />}
            className="gap-1.5"
          >
            <span>{actionText}</span>
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
