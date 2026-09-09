"use client"

import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Calendar01Icon,
  Database01Icon,
  Folder02Icon,
  Globe02Icon,
  LockIcon,
  RefreshIcon,
  Alert02Icon,
} from "@hugeicons/core-free-icons"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  formatBytes,
  isBucketActive,
  isPublicVisibility,
  expiresAtToMs,
} from "@/lib/bucket/bucket"
import type { BucketStats } from "@/services/bucket/types"

export function BucketStatsHeader({
  stats,
  onRenew,
}: {
  stats: BucketStats
  onRenew: () => void
}) {
  const t = useTranslations("bucket")
  const active = isBucketActive(stats.status)
  const isPublic = isPublicVisibility(stats.visibility)

  const usedBytes = stats.storageUsed
  const capacityBytes = stats.capacity
  const usagePct =
    capacityBytes > 0n ? Math.min(100, Number((usedBytes * 100n) / capacityBytes)) : 0

  const periodDays = Math.max(1, Number(stats.periodDays || 30n))
  const daysRemaining = Math.max(0, Number(stats.daysRemaining))
  const expiryPct = Math.min(100, Math.max(0, Math.round((daysRemaining / periodDays) * 100)))

  const expiryDate = new Date(expiresAtToMs(stats.expiresAt))
  const formattedExpiry = expiryDate.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  return (
    <Card className="overflow-hidden border border-border/70 bg-gradient-to-b from-card/80 to-card/40 shadow-xs">
      <CardContent className="space-y-4 p-4 sm:p-5">
        {/* Top bar: Name, Badges & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <HugeiconsIcon icon={Database01Icon} className="size-4.5" strokeWidth={1.75} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tracking-tight text-foreground">
                  {stats.name}
                </span>
                <Badge
                  variant={active ? "outline" : "destructive"}
                  className="h-4.5 px-1.5 text-[10px] font-medium"
                >
                  {active ? (stats.isExpiringSoon ? t("expiringSoon") : t("active")) : t("expired")}
                </Badge>
                <Badge
                  variant="secondary"
                  className="h-4.5 gap-1 px-1.5 text-[10px] font-medium text-muted-foreground"
                >
                  <HugeiconsIcon icon={isPublic ? Globe02Icon : LockIcon} className="size-2.5" />
                  <span>{isPublic ? t("public") : t("private")}</span>
                </Badge>
              </div>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {Number(stats.fileCount)} {t("files").toLowerCase()} · ID:{" "}
                <span className="font-mono">{stats.id}</span>
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant={stats.isExpiringSoon || !active ? "default" : "outline"}
            size="sm"
            onClick={onRenew}
            className="h-8 shrink-0 gap-1.5 text-xs"
          >
            <HugeiconsIcon icon={RefreshIcon} className="size-3.5" strokeWidth={1.75} />
            <span>{t("renew")}</span>
          </Button>
        </div>

        {/* Dual Progress Bars Grid */}
        <div className="grid grid-cols-1 gap-4 border-t border-border/50 pt-3 sm:grid-cols-2 sm:gap-6">
          {/* Storage Usage Progress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-medium text-muted-foreground">
                <HugeiconsIcon icon={Folder02Icon} className="size-3.5 text-primary" />
                <span>{t("usage")}</span>
              </div>
              <span className="font-medium text-foreground tabular-nums">
                {formatBytes(usedBytes)}{" "}
                <span className="font-normal text-muted-foreground">
                  / {formatBytes(capacityBytes)} ({usagePct}%)
                </span>
              </span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${Math.max(2, usagePct)}%` }}
              />
            </div>
          </div>

          {/* Expiry / Days Remaining Progress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-medium text-muted-foreground">
                <HugeiconsIcon
                  icon={stats.isExpiringSoon || !active ? Alert02Icon : Calendar01Icon}
                  className={
                    stats.isExpiringSoon || !active
                      ? "size-3.5 text-amber-500"
                      : "size-3.5 text-primary"
                  }
                />
                <span>Plan Duration</span>
              </div>
              <span className="font-medium text-foreground tabular-nums">
                {active ? (
                  <>
                    <span
                      className={
                        stats.isExpiringSoon ? "font-semibold text-amber-500" : "text-foreground"
                      }
                    >
                      {t("daysLeft", { days: daysRemaining })}
                    </span>
                    <span className="font-normal text-muted-foreground"> ({formattedExpiry})</span>
                  </>
                ) : (
                  <span className="font-semibold text-destructive">{t("expired")}</span>
                )}
              </span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={
                  !active
                    ? "h-full bg-destructive transition-all duration-300"
                    : stats.isExpiringSoon
                      ? "h-full bg-amber-500 transition-all duration-300"
                      : "h-full bg-emerald-500 transition-all duration-300"
                }
                style={{ width: `${Math.max(active ? 2 : 0, expiryPct)}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
