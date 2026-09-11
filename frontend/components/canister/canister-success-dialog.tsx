"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function CanisterSuccessDialog({
  open,
  onClose,
  title,
  description,
  highlight,
  detail,
  monoId,
  actions,
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  highlight?: ReactNode
  detail?: ReactNode
  monoId?: string | null
  actions?: ReactNode
}) {
  const tc = useTranslations("common")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 1500)
    return () => window.clearTimeout(timer)
  }, [copied])

  const onCopy = async () => {
    if (!monoId) return
    try {
      await navigator.clipboard.writeText(monoId)
      setCopied(true)
    } catch {
      /* icon-only feedback; ignore */
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setCopied(false)
          onClose()
        }
      }}
    >
      <DialogContent className="gap-5 p-5 sm:max-w-md sm:p-6" closeButtonSize="icon-lg">
        <DialogHeader className="items-center pr-10 text-center sm:items-center sm:text-center">
          <div className="animate-in fade-in zoom-in-75 mb-1 flex size-16 items-center justify-center rounded-full bg-success/10 duration-300 ease-out">
            <span className="flex size-11 items-center justify-center rounded-full bg-success text-background shadow-sm">
              <HugeiconsIcon icon={Tick02Icon} className="size-7" strokeWidth={3} />
            </span>
          </div>
          <DialogTitle className="text-lg">{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : (
            <DialogDescription className="sr-only">{title}</DialogDescription>
          )}
          {highlight}
        </DialogHeader>

        {(monoId || detail) && (
          <div className="space-y-3 text-center">
            {monoId ? (
              <div className="flex items-center justify-center gap-1">
                <p className="max-w-[85%] break-all font-mono text-sm text-foreground/80">
                  {monoId}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0"
                  aria-label={copied ? tc("copied") : tc("copy")}
                  onClick={() => void onCopy()}
                >
                  <HugeiconsIcon
                    icon={copied ? Tick02Icon : Copy01Icon}
                    className="size-3.5"
                  />
                </Button>
              </div>
            ) : null}
            {detail}
          </div>
        )}

        <DialogFooter className="flex-col gap-2 sm:flex-col sm:justify-stretch">
          {actions}
          <Button
            type="button"
            size="lg"
            variant="default"
            className="w-full"
            onClick={onClose}
          >
            {tc("close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
