import Link from "next/link"
import { ChevronRightIcon } from "lucide-react"
import { cn } from "@/lib/ui/utils"

type CharityBreadcrumbProps = {
  items: { label: string; href?: string }[]
  className?: string
}

export function CharityBreadcrumb({ items, className }: CharityBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm text-muted-foreground", className)}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {index > 0 ? <ChevronRightIcon className="size-3.5 shrink-0 opacity-60" /> : null}
              {item.href && !isLast ? (
                <Link href={item.href} className="transition-colors hover:text-foreground">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "text-foreground" : undefined}>{item.label}</span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
