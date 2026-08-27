"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AMBER_EMBED_BTN, BgImageCard } from "@/components/ui/bg-image-card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { BucketPriceLabel } from "@/components/bucket/bucket-price-label"
import { useBucketCycleStatus, useBucketPrice } from "@/hooks/bucket/useBucket"
import { useLiveBalance } from "@/hooks/wallet/useWalletData"
import { CAPACITY_TIERS_GB, mapBucketError, validateBucketName } from "@/lib/bucket/bucket"
import { calculateListPriceE8s } from "@/lib/bucket/pricing"
import { ICP_FEE } from "@/lib/wallet/utils"
import { cn } from "@/lib/ui/utils"
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
  const listPrice = calculateListPriceE8s(capacityGB)

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
    <div className="space-y-4">
      {!canCreate && (
        <Alert variant="destructive">
          <AlertDescription>{t("serviceUnavailable")}</AlertDescription>
        </Alert>
      )}

      <BgImageCard contentClassName="space-y-6 px-5 py-7">
      <div className="space-y-2">
        <Label htmlFor="bucket-name">{t("name")}</Label>
        <Input
          id="bucket-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="my-assets"
          autoComplete="off"
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
              size="xs"
              variant={capacityGB === gb ? "default" : "outline"}
              onClick={() => setCapacityGB(gb)}
            >
              {gb}G
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t("visibility")}</Label>
        <RadioGroup
          value={"Public" in visibility ? "public" : "private"}
          onValueChange={(value) => {
            if (value === "public") setVisibility({ Public: null })
            if (value === "private") setVisibility({ Private: null })
          }}
          className="grid gap-2 sm:grid-cols-2"
        >
          <FieldLabel htmlFor="bucket-visibility-public">
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>{t("public")}</FieldTitle>
                <FieldDescription>{t("publicHint")}</FieldDescription>
              </FieldContent>
              <RadioGroupItem value="public" id="bucket-visibility-public" />
            </Field>
          </FieldLabel>
          <FieldLabel htmlFor="bucket-visibility-private">
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>{t("private")}</FieldTitle>
                <FieldDescription>{t("privateHint")}</FieldDescription>
              </FieldContent>
              <RadioGroupItem value="private" id="bucket-visibility-private" />
            </Field>
          </FieldLabel>
        </RadioGroup>
      </div>

      <div className="rounded-2xl bg-muted/40 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{t("price")}</span>
          {priceLoading || price === null ? (
            <span className="font-semibold tabular-nums">…</span>
          ) : (
            <BucketPriceLabel
              priceE8s={price}
              listPriceE8s={listPrice}
              perMonth={t("perMonth")}
            />
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        size="lg"
        className={cn("h-12 w-full rounded-2xl text-base font-semibold", AMBER_EMBED_BTN)}
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
        {submitting ? t("creating") : insufficient ? t("insufficientBalance") : t("create")}
      </Button>
      </BgImageCard>
    </div>
  )
}
