"use client"

import { Badge } from "@/components/ui/badge"
import { useLedgerStandards } from "@/hooks/ledger/useLedgerStandards"

export function TokenStandardsBadge({ ledgerId }: { ledgerId: string }) {
  const { standards, isLoading } = useLedgerStandards(ledgerId)
  if (isLoading || !standards.length) return null

  const labels = standards
    .map((s) => s.toUpperCase())
    .filter((s) => s.startsWith("ICRC"))
    .slice(0, 4)

  if (!labels.length) return null

  return (
    <div className="flex flex-wrap justify-center gap-1.5">
      {labels.map((label) => (
        <Badge key={label} variant="secondary" className="text-[10px] font-medium">
          {label}
        </Badge>
      ))}
    </div>
  )
}
