"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { ProposalDetailDrawer } from "@/components/governance/proposal-detail-drawer"
import type { ProposalRow } from "@/services/governance/governance"

const PAGE_SIZE = 10

export function ProposalList({
  rows,
  loading,
}: {
  rows: ProposalRow[]
  loading?: boolean
}) {
  const t = useTranslations("governance")
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<ProposalRow | null>(null)

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const slice = rows.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)
  const hasPrev = safePage > 0
  const hasNext = safePage < totalPages - 1

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    )
  }

  if (!rows.length) {
    return <p className="py-8 text-center text-sm text-muted-foreground">{t("empty")}</p>
  }

  return (
    <>
      <ul className="space-y-3">
        {slice.map((row) => (
          <li key={`${row.source}-${row.ledgerId ?? "nns"}-${row.id}`}>
            <button
              type="button"
              onClick={() => setSelected(row)}
              className="w-full rounded-xl border border-border/40 bg-background/45 p-3 text-left backdrop-blur-sm transition-colors hover:bg-muted/40 active:scale-[0.99]"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold leading-snug">{row.title}</p>
                <span className="shrink-0 rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-medium uppercase">
                  {row.source}
                </span>
              </div>
              {row.summary ? (
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                  {row.summary}
                </p>
              ) : null}
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                <span>{t("proposalId", { id: row.id.toString() })}</span>
                <span className="rounded-full bg-muted/50 px-1.5 py-0.5 text-[10px]">
                  {row.status}
                </span>
                {row.ledgerId ? <span>{row.ledgerId.slice(0, 5)}…</span> : null}
              </div>
            </button>
          </li>
        ))}
      </ul>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            {t("pageOf", {
              page: String(safePage + 1),
              total: String(totalPages),
              count: String(rows.length),
            })}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!hasPrev}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              {t("prevPage")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!hasNext}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            >
              {t("nextPage")}
            </Button>
          </div>
        </div>
      ) : null}

      <ProposalDetailDrawer
        proposal={selected}
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
      />
    </>
  )
}
