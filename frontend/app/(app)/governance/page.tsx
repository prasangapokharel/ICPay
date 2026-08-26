"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProposalList } from "@/components/governance/proposal-list"
import { useGovernanceFeed } from "@/hooks/governance/useGovernance"

export default function GovernancePage() {
  const t = useTranslations("governance")
  const { nns, sns, loading, refresh } = useGovernanceFeed()

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
          <ProposalList key="governance-nns" rows={nns} loading={loading} />
        </TabsContent>
        <TabsContent value="sns" className="mt-4">
          <ProposalList key="governance-sns" rows={sns} loading={loading} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
