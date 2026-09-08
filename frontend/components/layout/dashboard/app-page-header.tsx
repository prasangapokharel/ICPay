import type { ReactNode } from "react"
import { cn } from "@/lib/ui/utils"

export function AppPageHeader({
  title,
  description,
  actions,
  accessory,
  back,
  className,
}: {
  title: ReactNode
  description?: string
  actions?: ReactNode
  accessory?: ReactNode
  back?: ReactNode
  className?: string
}) {
  return (
    <div className={cn("space-y-1", className)}>
      {back}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-2">
          <div className="min-w-0 space-y-1">
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {accessory}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </div>
  )
}
