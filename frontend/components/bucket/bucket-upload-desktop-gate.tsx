"use client"

import { cloneElement, type ReactElement } from "react"
import { useTranslations } from "next-intl"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

/** Bucket uploads are desktop-only — WebP conversion and multi-MB files need a full browser. */
export function useBucketUploadDesktopOnly() {
  const isMobile = useIsMobile()
  return { isMobile, desktopOnly: isMobile }
}

export function BucketUploadDesktopAlert({ className }: { className?: string }) {
  const t = useTranslations("bucket")
  return (
    <Alert className={className}>
      <AlertDescription className="text-xs">{t("uploadDesktopOnly")}</AlertDescription>
    </Alert>
  )
}

export function BucketUploadDesktopTrigger({
  children,
  className,
}: {
  children: ReactElement<{ disabled?: boolean; onClick?: (e: React.MouseEvent) => void }>
  className?: string
}) {
  const t = useTranslations("bucket")
  const { desktopOnly } = useBucketUploadDesktopOnly()

  if (!desktopOnly) {
    return children
  }

  const label = t("uploadDesktopOnly")

  const blocked = cloneElement(children, {
    disabled: true,
  })

  return (
    <TooltipProvider delay={200}>
      <Tooltip>
        <TooltipTrigger
          render={
            <span
              className={cn("inline-flex", className)}
              onClick={(e: React.MouseEvent) => {
                e.preventDefault()
                e.stopPropagation()
                window.alert(label)
              }}
            />
          }
        >
          {blocked}
        </TooltipTrigger>
        <TooltipContent side="bottom">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
