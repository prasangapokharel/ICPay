"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDataTransferHorizontalIcon,
  Coins01Icon,
  ShoppingBag01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { markPresaleGuideSeen } from "@/lib/icpay/presaleGuide"

const STEPS = [
  { titleKey: "guideStep1Title", bodyKey: "guideStep1Body", icon: ShoppingBag01Icon },
  { titleKey: "guideStep2Title", bodyKey: "guideStep2Body", icon: ArrowDataTransferHorizontalIcon },
  { titleKey: "guideStep3Title", bodyKey: "guideStep3Body", icon: UserIcon },
  { titleKey: "guideStep4Title", bodyKey: "guideStep4Body", icon: Coins01Icon },
] as const

export function PresaleGuideDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const t = useTranslations("buyIcpay")
  const [step, setStep] = useState(0)

  const close = () => {
    markPresaleGuideSeen()
    setStep(0)
    onOpenChange(false)
  }

  const current = STEPS[step]
  const last = step === STEPS.length - 1
  const first = step === 0

  useEffect(() => {
    if (open) setStep(0)
  }, [open])

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) close()
        else onOpenChange(true)
      }}
    >
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
        <div className="bg-gradient-to-br from-primary via-primary to-primary/80 px-6 pb-8 pt-6 text-primary-foreground">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo/icpay/token.png"
              alt=""
              width={48}
              height={48}
              unoptimized
              className="size-12 rounded-full ring-2 ring-primary-foreground/30"
            />
            <div>
              <DialogHeader className="text-left">
                <DialogTitle className="text-lg text-primary-foreground">{t("heroTitle")}</DialogTitle>
                <DialogDescription className="text-primary-foreground/80">
                  {t("heroSubtitle")}
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <HugeiconsIcon icon={current.icon} className="size-5" strokeWidth={1.75} />
          </div>
          <div className="space-y-2">
            <p className="text-base font-semibold">{t(current.titleKey)}</p>
            <p className="text-sm leading-relaxed text-muted-foreground">{t(current.bodyKey)}</p>
          </div>
          <div className="flex justify-center gap-1.5 pt-1">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        </div>

        <DialogFooter className="flex-row gap-2 border-t border-border/60 px-6 py-4">
          <Button
            variant="ghost"
            className="flex-1"
            disabled={first}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            {t("guidePrevious")}
          </Button>
          {last ? (
            <Button className="flex-1" onClick={close}>
              {t("guideStart")}
            </Button>
          ) : (
            <Button className="flex-1" onClick={() => setStep((s) => s + 1)}>
              {t("guideNext")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
