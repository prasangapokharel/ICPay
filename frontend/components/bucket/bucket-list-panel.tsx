"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, CloudIcon, Search01Icon } from "@hugeicons/core-free-icons"
import { AppPage } from "@/components/layout/dashboard/app-page"
import { BucketCard } from "@/components/bucket/bucket-card"
import { BucketCreateForm } from "@/components/bucket/bucket-create-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuth } from "@/components/auth/auth-provider"
import { useBucketList, useInvalidateBucketCache } from "@/hooks/bucket/useBucket"
import { clearLegacyBucketStorage } from "@/lib/bucket/legacyStorage"
import { useRefreshWallet } from "@/hooks/wallet/useWalletData"
import { isBucketActive } from "@/lib/bucket/bucket"
import { createBucket } from "@/services/bucket/bucket"

type FilterTab = "all" | "active" | "expired"

export function BucketListPanel() {
  const t = useTranslations("bucket")
  const tCommon = useTranslations("common")
  const tGov = useTranslations("governance")
  const router = useRouter()
  const { identity } = useAuth()
  const refreshWallet = useRefreshWallet()
  const invalidateBucketCache = useInvalidateBucketCache()
  const { buckets, isLoading, refresh } = useBucketList()
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<FilterTab>("all")
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => {
    clearLegacyBucketStorage()
  }, [])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return buckets.filter((bucket) => {
      const active = isBucketActive(bucket.status)
      if (filter === "active" && !active) return false
      if (filter === "expired" && active) return false
      if (!needle) return true
      return bucket.name.toLowerCase().includes(needle) || bucket.id.toLowerCase().includes(needle)
    })
  }, [buckets, filter, query])

  const handleCreate = async (
    name: string,
    capacityGB: number,
    visibility: Parameters<typeof createBucket>[3],
  ): Promise<string | null> => {
    const result = await createBucket(identity, name, capacityGB, visibility)
    if ("err" in result) return result.err
    refreshWallet()
    await Promise.all([refresh(), invalidateBucketCache()])
    setCreateOpen(false)
    router.push(`/bucket/${encodeURIComponent(result.ok)}`)
    return null
  }

  return (
    <AppPage
      title={t("title")}
      description={t("subtitle")}
      actions={
        <>
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/bucket/docs" />}>
            {t("docs")}
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <HugeiconsIcon icon={Add01Icon} className="size-4" strokeWidth={1.75} />
            {t("createCta")}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <HugeiconsIcon
            icon={Search01Icon}
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tCommon("search")}
            className="pl-10"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {(["all", "active", "expired"] as const).map((tab) => (
            <Button
              key={tab}
              type="button"
              size="sm"
              variant={filter === tab ? "secondary" : "ghost"}
              className="rounded-md"
              onClick={() => setFilter(tab)}
            >
              {tab === "all" ? tGov("filter.all") : tab === "active" ? t("active") : t("expired")}
            </Button>
          ))}
        </div>
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/bucket/pricing" />}>
          {t("pricingLink")}
        </Button>
      </div>

      {isLoading && buckets.length === 0 ? (
        <Card>
          <CardContent className="space-y-2 py-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-xl bg-muted">
              <HugeiconsIcon icon={CloudIcon} className="size-6 text-muted-foreground" strokeWidth={1.75} />
            </span>
            <p className="text-sm font-medium">{t("empty")}</p>
            <p className="text-sm text-muted-foreground">{t("emptyHint")}</p>
            <Button onClick={() => setCreateOpen(true)}>
              <HugeiconsIcon icon={Add01Icon} className="size-4" strokeWidth={1.75} />
              {t("createCta")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("name")}</TableHead>
                <TableHead>{t("visibility")}</TableHead>
                <TableHead>{t("usage")}</TableHead>
                <TableHead>{t("active")}</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((bucket) => (
                <BucketCard key={bucket.id} bucket={bucket} />
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("formTitle")}</DialogTitle>
            <DialogDescription>{t("formSubtitle")}</DialogDescription>
          </DialogHeader>
          <BucketCreateForm onCreate={handleCreate} />
        </DialogContent>
      </Dialog>
    </AppPage>
  )
}
