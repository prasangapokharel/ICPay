"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { TransactionList } from "@/components/transactions/transaction-list"
import { Skeleton } from "@/components/ui/skeleton"
import { useTransactions } from "@/hooks/wallet/useWalletData"

const PAGE_SIZE = 20

export default function TransactionsPage() {
  const t = useTranslations("transactions")
  const [page, setPage] = useState(0)
  const { items, total, isLoading } = useTransactions(page, PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>
      {isLoading && items.length === 0 ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      ) : (
        <TransactionList
          transactions={items}
          total={total}
          page={page}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}
