"use client"

import { useTranslations } from "next-intl"
import { useBtcWithdrawals } from "@/hooks/chainkey/useBtcWithdrawals"
import { Spinner } from "@/components/ui/spinner"

export function BtcWithdrawalList({ ledgerId }: { ledgerId: string }) {
  const t = useTranslations("chainKey")
  const { rows, isLoading } = useBtcWithdrawals(ledgerId)

  if (isLoading) {
    return (
      <div className="flex justify-center py-2">
        <Spinner className="size-4 text-muted-foreground" />
      </div>
    )
  }

  if (!rows.length) return null

  return (
    <div className="space-y-2 rounded-xl border border-border/40 bg-background/45 p-3 backdrop-blur-sm">
      <p className="text-xs font-medium">{t("withdrawalsTitle")}</p>
      <ul className="space-y-1.5">
        {rows.slice(0, 5).map((row) => (
          <li
            key={row.id.toString()}
            className="flex items-center justify-between gap-2 text-xs text-muted-foreground"
          >
            <span>#{row.id.toString()}</span>
            <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-medium">
              {row.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
