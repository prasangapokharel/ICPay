import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@/components/ui/button"

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  title: string
  description: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
        <HugeiconsIcon icon={icon as never} className="size-8 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && (
        <>
          {action.href ? (
            <Button size="sm" render={<Link href={action.href} />}>
              {action.label}
            </Button>
          ) : (
            <Button size="sm" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </>
      )}
    </div>
  )
}
