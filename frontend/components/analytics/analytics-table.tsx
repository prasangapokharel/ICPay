"use client"

import { useTranslations } from "next-intl"
import type { TransactionPublic } from "@/services/types"
import {
  formatTime,
  formatTokenAmount,
  shortenCounterparty,
  txStatusLabel,
} from "@/lib/wallet/utils"
import { cn } from "@/lib/ui/utils"
import { ICP_LEDGER_ID } from "@/services/tokens"

type AnalyticsTableProps = {
  rows: TransactionPublic[]
}

function txTypeDisplay(tx: TransactionPublic): string {
  if ("deposit" in tx.txType) return "deposit"
  if ("withdraw" in tx.txType) return "withdraw"
  if ("transfer" in tx.txType) return "transfer"
  if ("fee" in tx.txType) return "fee"
  if ("swapIn" in tx.txType) return "swapIn"
  if ("swapOut" in tx.txType) return "swapOut"
  return "transfer"
}

export function AnalyticsTable({ rows }: AnalyticsTableProps) {
  const t = useTranslations("analytics")
  const tt = useTranslations("transactions")

  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed py-8 text-center text-sm text-muted-foreground">
        {t("noRows")}
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[640px] text-left text-xs">
        <thead className="border-b bg-muted/40 text-muted-foreground">
          <tr>
            <th className="px-3 py-2 font-medium">{t("colDate")}</th>
            <th className="px-3 py-2 font-medium">{t("colType")}</th>
            <th className="px-3 py-2 font-medium">{t("colAmount")}</th>
            <th className="px-3 py-2 font-medium">{t("colFrom")}</th>
            <th className="px-3 py-2 font-medium">{t("colTo")}</th>
            <th className="px-3 py-2 font-medium">{t("colStatus")}</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((tx) => {
            const typeKey = txTypeDisplay(tx)
            const statusKey = txStatusLabel(tx.status)
            const token = tx.ledgerId === ICP_LEDGER_ID ? "ICP" : "TOKEN"
            return (
              <tr key={tx.id} className="hover:bg-muted/20">
                <td className="px-3 py-2 whitespace-nowrap tabular-nums">{formatTime(tx.createdAt)}</td>
                <td className="px-3 py-2">{tt(`type.${typeKey}` as "type.deposit")}</td>
                <td className="px-3 py-2 font-medium tabular-nums">
                  {formatTokenAmount(tx.amount, 8)} {token}
                </td>
                <td className="max-w-[120px] truncate px-3 py-2 font-mono text-[11px]">
                  {shortenCounterparty(tx.from)}
                </td>
                <td className="max-w-[120px] truncate px-3 py-2 font-mono text-[11px]">
                  {shortenCounterparty(tx.to)}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={cn(
                      statusKey === "completed" && "text-primary",
                      statusKey === "failed" && "text-destructive",
                      statusKey === "pending" && "text-muted-foreground",
                    )}
                  >
                    {tt(`status.${statusKey}` as "status.completed")}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
