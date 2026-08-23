"use client"

import { useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { AppIcon } from "@/components/ui/app-icon"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import {
  COMMUNITY_MAX_ICP,
  COMMUNITY_MIN_ICP,
  parseCommunityPriceIcp,
} from "@/lib/community/format"
import type { CommunityAccess, CommunityVisibility } from "@/services/community/community"

type CreatePayload = {
  name: string
  slug: string
  bio: string
  visibility: CommunityVisibility
  access: CommunityAccess
  priceE8s: bigint
}

export function CommunityCreateForm({
  onCreate,
}: {
  onCreate: (payload: CreatePayload) => Promise<string | null>
}) {
  const t = useTranslations("community")
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [bio, setBio] = useState("")
  const [visibility, setVisibility] = useState<"public" | "private">("public")
  const [access, setAccess] = useState<"free" | "paid">("free")
  const [price, setPrice] = useState("0.5")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    setError(null)
    const trimmedSlug = slug.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_")
    if (!name.trim() || trimmedSlug.length < 3) {
      setError(t("slugInvalid"))
      return
    }
    let priceE8s = 0n
    if (access === "paid") {
      const parsed = parseCommunityPriceIcp(price)
      if (parsed === null) {
        setError(t("priceInvalid", { min: COMMUNITY_MIN_ICP, max: COMMUNITY_MAX_ICP }))
        return
      }
      priceE8s = parsed
    }
    setBusy(true)
    const err = await onCreate({
      name: name.trim(),
      slug: trimmedSlug,
      bio: bio.trim(),
      visibility: visibility === "public" ? { open: null } : { inviteOnly: null },
      access: access === "paid" ? { paid: null } : { free: null },
      priceE8s,
    })
    setBusy(false)
    if (err) setError(err)
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void submit()
      }}
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <div className="z-20 flex shrink-0 items-center gap-2 border-b border-border/40 bg-background/95 px-3 py-2.5 backdrop-blur-md supports-[backdrop-filter]:bg-background/85 md:px-4">
        <Button
          variant="ghost"
          size="icon"
          nativeButton={false}
          render={<Link href="/channels" />}
          aria-label={t("backAria")}
          className="shrink-0 md:hidden"
        >
          <AppIcon name="chatBack" size={18} mono />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold leading-tight">{t("createTitle")}</p>
          <p className="truncate text-xs text-muted-foreground">{t("createSubtitle")}</p>
        </div>
        <Button
          type="submit"
          size="sm"
          disabled={busy}
          className="h-9 shrink-0 rounded-full px-4"
        >
          {busy ? (
            <>
              <Spinner className="size-3.5" />
              {t("creating")}
            </>
          ) : (
            t("create")
          )}
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 pb-28 md:pb-6">
        <Card className="border-muted/60 bg-card shadow-sm">
          <CardContent className="space-y-5 pt-6">
            <div className="space-y-2">
              <Label htmlFor="ch-name">{t("name")}</Label>
              <Input
                id="ch-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (!slug) setSlug(e.target.value.toLowerCase().replace(/\s+/g, "_").slice(0, 32))
                }}
                maxLength={80}
                placeholder={t("namePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ch-slug">{t("slug")}</Label>
              <Input
                id="ch-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                maxLength={32}
                placeholder="alpha_calls"
              />
              <p className="text-xs text-muted-foreground">{t("slugHint")}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ch-bio">{t("bio")}</Label>
              <Textarea
                id="ch-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={280}
                rows={3}
                placeholder={t("bioPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("visibility")}</Label>
              <RadioGroup
                value={visibility}
                onValueChange={(value) => {
                  if (value === "public" || value === "private") setVisibility(value)
                }}
                className="grid grid-cols-2 gap-2"
              >
                <Choice id="ch-public" value="public" label={t("public")} />
                <Choice id="ch-private" value="private" label={t("private")} />
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label>{t("access")}</Label>
              <RadioGroup
                value={access}
                onValueChange={(value) => {
                  if (value === "free" || value === "paid") setAccess(value)
                }}
                className="grid grid-cols-2 gap-2"
              >
                <Choice id="ch-free" value="free" label={t("free")} />
                <Choice id="ch-paid" value="paid" label={t("paid")} />
              </RadioGroup>
            </div>
            {access === "paid" && (
              <div className="space-y-2">
                <Label htmlFor="ch-price">{t("price")}</Label>
                <Input
                  id="ch-price"
                  inputMode="decimal"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.5"
                />
                <p className="text-xs text-muted-foreground">{t("priceHint")}</p>
              </div>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>
      </div>
    </form>
  )
}

function Choice({ id, value, label }: { id: string; value: string; label: string }) {
  return (
    <FieldLabel htmlFor={id}>
      <Field orientation="horizontal">
        <FieldContent>
          <FieldTitle>{label}</FieldTitle>
        </FieldContent>
        <RadioGroupItem value={value} id={id} />
      </Field>
    </FieldLabel>
  )
}
