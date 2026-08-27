"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProposalList } from "@/components/governance/proposal-list"
import { useGovernanceFeed } from "@/hooks/governance/useGovernance"
import {
  filterProposals,
  type ProposalFilter,
} from "@/services/governance/governance"
import { cn } from "@/lib/ui/utils"

const FILTERS: ProposalFilter[] = ["all", "open", "executed", "rejected"]

export default function GovernancePage() {
  const t = useTranslations("governance")
  const { nns, sns, loading, refresh } = useGovernanceFeed()
  const [filter, setFilter] = useState<ProposalFilter>("all")

  const filteredNns = filterProposals(nns, filter)
  const filteredSns = filterProposals(sns, filter)

  return (
    <div className="space-y-6 pt-2">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={() => void refresh()}>
          {t("refresh")}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">{t("readOnlyNote")}</p>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f}
            type="button"
            size="sm"
            variant={filter === f ? "default" : "outline"}
            className={cn("rounded-full text-xs", filter !== f && "bg-transparent")}
            onClick={() => setFilter(f)}
          >
            {t(`filter.${f}`)}
          </Button>
        ))}
      </div>

      <Tabs defaultValue="nns">
        <TabsList className="w-full">
          <TabsTrigger value="nns" className="flex-1">
            {t("tabNns")}
          </TabsTrigger>
          <TabsTrigger value="sns" className="flex-1">
            {t("tabSns")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="nns" className="mt-4">
          <ProposalList key={`governance-nns-${filter}`} rows={filteredNns} loading={loading} />
        </TabsContent>
        <TabsContent value="sns" className="mt-4">
          <ProposalList key={`governance-sns-${filter}`} rows={filteredSns} loading={loading} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
