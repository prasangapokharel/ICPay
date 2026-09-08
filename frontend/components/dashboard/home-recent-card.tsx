"use client"

import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import type { TransactionPublic } from "@/services/types"

export function HomeRecentCard({ transactions }: { transactions: TransactionPublic[] }) {
  const t = useTranslations("dashboard")

  return (
    <Card className="hidden md:flex md:flex-col">
      <CardHeader className="shrink-0 border-b">
        <CardTitle>{t("latestTransactions")}</CardTitle>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-auto p-0 pt-2">
        <RecentTransactions transactions={transactions} embedded />
      </CardContent>
    </Card>
  )
}
