"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useBucketCycleStatus, useBucketPrice } from "@/hooks/use-bucket"
import { useLiveBalance } from "@/hooks/use-wallet-data"
import { CAPACITY_TIERS_GB, mapBucketError, validateBucketName } from "@/lib/bucket/bucket"
import { formatAmount, ICP_FEE } from "@/lib/wallet-utils"
import { cn } from "@/lib/utils"
import type { BucketVisibilityVariant } from "@/services/bucket/types"

export function BucketCreateForm({
  onCreate,
}: {
  onCreate: (
    name: string,
    capacityGB: number,
    visibility: BucketVisibilityVariant
  ) => Promise<string | null>
}) {
  const t = useTranslations("bucket")
  const { cycleStatus } = useBucketCycleStatus()
  const balance = useLiveBalance()

  const [name, setName] = useState("")
  const [capacityGB, setCapacityGB] = useState<number>(10)
  const [visibility, setVisibility] = useState<BucketVisibilityVariant>({ Public: null })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { price, isLoading: priceLoading } = useBucketPrice(capacityGB)

  const nameError = useMemo(() => validateBucketName(name), [name])
  const canCreate = cycleStatus?.canAcceptNewBuckets !== false
  const totalCost = price !== null ? price + ICP_FEE : null
  const insufficient =
    totalCost !== null && balance !== undefined && balance < totalCost

  const handleSubmit = async () => {
    if (nameError || !canCreate) return
    setSubmitting(true)
    setError(null)
    const err = await onCreate(name.trim().toLowerCase(), capacityGB, visibility)
    if (err) setError(mapBucketError(err, t))
    setSubmitting(false)
  }

  return (
    <div className="space-y-5">
      {!canCreate && (
        <Alert variant="destructive">
          <AlertDescription>{t("serviceUnavailable")}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="bucket-name">{t("name")}</Label>
        <Input
          id="bucket-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="my-assets"
          autoComplete="off"
          className="h-9"
        />
        <p className="text-xs text-muted-foreground">{t("nameHint")}</p>
        {nameError && name.length > 0 && (
          <p className="text-xs text-destructive">{nameError}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>{t("capacity")}</Label>
        <div className="flex flex-wrap gap-1.5">
          {CAPACITY_TIERS_GB.map((gb) => (
            <Button
              key={gb}
              type="button"
              size="sm"
              variant={capacityGB === gb ? "default" : "outline"}
              className="h-7 min-w-[2.5rem] px-2 text-xs"
              onClick={() => setCapacityGB(gb)}
            >
              {gb}G
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t("visibility")}</Label>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { key: "public" as const, value: { Public: null } as BucketVisibilityVariant },
              { key: "private" as const, value: { Private: null } as BucketVisibilityVariant },
            ] as const
          ).map(({ key, value }) => (
            <button
              key={key}
              type="button"
              onClick={() => setVisibility(value)}
              className={cn(
                "rounded-xl border px-3 py-2.5 text-left transition-colors",
                (key === "public" ? "Public" in visibility : "Private" in visibility)
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted/40"
              )}
            >
              <span className="block text-xs font-semibold">{t(key)}</span>
              <span className="block text-[10px] text-muted-foreground">
                {t(`${key}Hint`)}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border bg-muted/30 px-3 py-2.5 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{t("price")}</span>
          <span className="font-semibold tabular-nums">
            {priceLoading ? "…" : price !== null ? `${formatAmount(price)} ICP` : "—"}
            <span className="text-xs font-normal text-muted-foreground"> {t("perMonth")}</span>
          </span>
        </div>
        {insufficient && (
          <p className="mt-1 text-xs text-destructive">{t("insufficientBalance")}</p>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        size="sm"
        className="w-full"
        disabled={
          submitting ||
          !canCreate ||
          Boolean(nameError) ||
          name.trim().length === 0 ||
          priceLoading ||
          insufficient
        }
        onClick={handleSubmit}
      >
        {submitting ? t("creating") : t("create")}
      </Button>
    </div>
  )
}
