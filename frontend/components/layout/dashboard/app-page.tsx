import type { ReactNode } from "react"
import { cn } from "@/lib/ui/utils"
import { AppPageHeader } from "@/components/layout/dashboard/app-page-header"

export function AppPage({
  title,
  description,
  actions,
  accessory,
  back,
  children,
  className,
}: {
  title?: ReactNode
  description?: string
  actions?: ReactNode
  accessory?: ReactNode
  back?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("space-y-6", className)}>
      {title ? (
        <AppPageHeader
          title={title}
          description={description}
          actions={actions}
          accessory={accessory}
          back={back}
        />
      ) : null}
      {children}
    </div>
  )
}
