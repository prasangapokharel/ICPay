"use client"

import type { MouseEvent } from "react"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { visiblePageItems } from "@/lib/market/overview"
import { cn } from "@/lib/ui/utils"

export function MarketPager({
  page,
  pages,
  onPage,
  compact,
  prevLabel,
  nextLabel,
}: {
  page: number
  pages: number
  onPage: (n: number) => void
  compact?: boolean
  prevLabel?: string
  nextLabel?: string
}) {
  if (pages <= 1) return null
  const items = visiblePageItems(page, pages)

  function go(n: number, event: MouseEvent) {
    event.preventDefault()
    if (n < 1 || n > pages || n === page) return
    onPage(n)
  }

  return (
    <Pagination className={cn(compact && "mx-0 py-1")}>
      <PaginationContent className={cn(compact && "gap-0.5")}>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            text={compact ? "" : prevLabel}
            className={cn(page <= 1 && "pointer-events-none opacity-40", compact && "h-7 px-1.5")}
            onClick={(e) => go(page - 1, e)}
          />
        </PaginationItem>
        {items.map((item, i) =>
          item === "ellipsis" ? (
            <PaginationItem key={`e-${i}`}>
              <PaginationEllipsis className={cn(compact && "size-7")} />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink
                href="#"
                isActive={item === page}
                className={cn(compact && "size-7 text-[11px]")}
                onClick={(e) => go(item, e)}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          )
        )}
        <PaginationItem>
          <PaginationNext
            href="#"
            text={compact ? "" : nextLabel}
            className={cn(page >= pages && "pointer-events-none opacity-40", compact && "h-7 px-1.5")}
            onClick={(e) => go(page + 1, e)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
