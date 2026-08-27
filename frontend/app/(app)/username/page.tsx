"use client"

import { useState } from "react"
import useSWRImmutable from "swr/immutable"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Tick02Icon,
  Cancel01Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { BadgeMark, PremiumBadge } from "@/components/verifed/premium-badge"
import {
  BADGE_RANGES,
  tierBadgeSpans,
  type BadgeSpan,
} from "@/lib/verified/premiumTick"
import { purchaseUsername, getUsernameTreasury } from "@/services/buy/buy"
import type { Purchase } from "@/services/types"
import { useAuth } from "@/components/auth/auth-provider"
import { useRefreshWallet } from "@/hooks/wallet/useWalletData"
import { formatAmount, ICP_FEE, shortPrincipal } from "@/lib/wallet/utils"
import {
  priceFor,
  tierFor,
  validateUsername,
  TIERS,
  USERNAME_MAX_LENGTH,
  USERNAME_FREE_MIN_LENGTH,
} from "@/lib/profile/username"
import {
  useUsernameAvailability,
  useLiveBalance,
} from "@/hooks/wallet/useWalletData"
import { SendSuccess } from "@/components/wallet/send-success"
import { AMBER_EMBED_BTN, BgImageCard } from "@/components/ui/bg-image-card"
import { primeSuccessChime } from "@/lib/ui/successChime"
import { cn } from "@/lib/ui/utils"

export default function UsernamePage() {
  const t = useTranslations("buyUsername")
  const router = useRouter()
  const { identity } = useAuth()
  const refreshWallet = useRefreshWallet()
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [buying, setBuying] = useState(false)
  const [bought, setBought] = useState<Purchase | null>(null)

  const trimmed = name.trim()
  const shapeError = trimmed ? validateUsername(trimmed) : null
  const { available, isLoading: checking } = useUsernameAvailability(
    shapeError ? "" : trimmed
  )

  const price = trimmed ? priceFor(trimmed) : 0n
  const tier = trimmed ? tierFor(trimmed) : null
  const total = price + ICP_FEE
  const balance = useLiveBalance()
  const insufficient =
    balance !== undefined && trimmed !== "" && total > balance

  // A query, and the treasury never moves, so it is read once per session and
  // never revalidated.
  const { data: treasury } = useSWRImmutable(
    identity ? (["username-treasury"] as const) : null,
    () => getUsernameTreasury(identity)
  )
  const canBuy =
    trimmed !== "" &&
    !shapeError &&
    available === true &&
    !insufficient &&
    !buying

  const handleBuy = async () => {
    if (!identity || !canBuy) return
    primeSuccessChime()
    setBuying(true)
    setError(null)
    const result = await purchaseUsername(identity, trimmed)
    setBuying(false)
    if ("err" in result) {
      setError(result.err)
      return
    }
    refreshWallet()
    setBought(result.ok)
  }

  if (bought) {
    return (
      <SendSuccess
        amount={bought.price}
        recipient={`@${bought.username}`}
        blockIndex={bought.blockIndex}
        kind="purchase"
        onDone={() => router.push("/profile")}
      />
    )
  }

  return (
    <div className="space-y-4 pt-2">
      <div>
        <h1 className="text-xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <BgImageCard contentClassName="space-y-6 px-5 py-7">
      <div className="space-y-2">
        <Label htmlFor="buy-username">{t("label")}</Label>
        <div className="relative">
          <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-base text-muted-foreground">
            @
          </span>
          <Input
            id="buy-username"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError(null)
            }}
            placeholder="btc"
            maxLength={USERNAME_MAX_LENGTH}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className="pr-10 pl-9"
          />
          {trimmed !== "" && !shapeError && !checking && (
            <span className="absolute top-1/2 right-4 -translate-y-1/2">
              <HugeiconsIcon
                icon={available ? Tick02Icon : Cancel01Icon}
                className={cn(
                  "size-5",
                  available ? "text-success" : "text-destructive"
                )}
              />
            </span>
          )}
          {checking && (
            <Spinner className="absolute top-1/2 right-4 size-4 -translate-y-1/2" />
          )}
        </div>
        {shapeError && (
          <p className="text-xs text-destructive">
            {t(`errors.${shapeError}`, {
              max: USERNAME_MAX_LENGTH,
              min: USERNAME_FREE_MIN_LENGTH,
            })}
          </p>
        )}
        {!shapeError && available === false && (
          <p className="text-xs text-destructive">
            {t("taken", { name: trimmed })}
          </p>
        )}
        {!shapeError && available === true && (
          <p className="text-xs text-success">
            {t("availableName", { name: trimmed })}
          </p>
        )}
      </div>

      {trimmed !== "" && !shapeError && tier && (
        <div className="space-y-3 rounded-2xl bg-muted/40 p-4">
          <div className="flex items-baseline justify-between">
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              {t(`tiers.${tier.labelKey}`)}
              {/* Asked of the typed name, not the tier: ultra spans both marks,
                  so this is the only place the exact badge is knowable. */}
              <PremiumBadge name={trimmed} className="size-3.5" />
            </span>
            <span className="flex items-center gap-1.5 text-lg font-bold tabular-nums">
              <Image
                src="/images/logo/logo.png"
                alt=""
                width={40}
                height={40}
                className="size-5 object-contain"
              />
              {formatAmount(price)}
            </span>
          </div>
          <div className="flex items-baseline justify-between text-xs text-muted-foreground">
            <span>{t("networkFee")}</span>
            <span className="tabular-nums">{formatAmount(ICP_FEE)} ICP</span>
          </div>
          <div className="flex items-baseline justify-between border-t pt-3 text-sm font-medium">
            <span>{t("total")}</span>
            <span className="tabular-nums">{formatAmount(total)} ICP</span>
          </div>
          {treasury && (
            <p className="text-xs text-muted-foreground">
              {t("treasuryNote", { principal: shortPrincipal(treasury) })}
            </p>
          )}
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        size="lg"
        className={cn("h-12 w-full rounded-2xl text-base font-semibold", AMBER_EMBED_BTN)}
        disabled={!canBuy}
        onClick={handleBuy}
      >
        {buying ? <Spinner className="size-4" /> : null}
        {buying ? t("buying") : insufficient ? t("insufficient") : t("buy")}
      </Button>

      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            {t("pricing")}
          </p>
          {/* A popover, not a tooltip: the badge rule is the reason to pick one
              tier over another, and on a phone there is no hover to reveal it. */}
          <Popover>
            <PopoverTrigger
              aria-label={t("badgeInfoTitle")}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <HugeiconsIcon icon={InformationCircleIcon} className="size-4" />
            </PopoverTrigger>
            <PopoverContent align="start" className="gap-3">
              <PopoverHeader>
                <PopoverTitle className="text-sm">
                  {t("badgeInfoTitle")}
                </PopoverTitle>
                <PopoverDescription className="text-xs">
                  {t("badgeInfo", { min: USERNAME_FREE_MIN_LENGTH })}
                </PopoverDescription>
              </PopoverHeader>
              {/* Listed as two rows rather than two ticks in the heading: side
                  by side they read as a pair a buyer gets together. */}
              <div className="flex flex-col gap-2 text-xs">
                {(["gold", "blue"] as const).map((badge) => (
                  <div key={badge} className="flex items-start gap-2">
                    <BadgeMark tier={badge} className="mt-px size-3.5" />
                    <span>
                      <span className="font-medium text-foreground">
                        {t(
                          badge === "gold" ? "goldBadgeTitle" : "blueBadgeTitle"
                        )}
                      </span>{" "}
                      <span className="text-muted-foreground">
                        {t(
                          badge === "gold" ? "goldBadgeInfo" : "blueBadgeInfo",
                          {
                            lengths: `${BADGE_RANGES[badge].min}-${BADGE_RANGES[badge].max}`,
                          }
                        )}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="overflow-hidden rounded-2xl border">
          {TIERS.map((tier, i) => (
            <div
              key={tier.labelKey}
              className={cn(
                "flex items-baseline justify-between px-4 py-3 text-sm",
                i > 0 && "border-t"
              )}
            >
              <div>
                <p className="font-medium">{t(`tiers.${tier.labelKey}`)}</p>
                <p className="text-xs text-muted-foreground">
                  {t(`tiers.${tier.rangeKey}`)}
                </p>
                {/* Marked per row rather than described in the note, so the
                    badge reads as part of what the price buys. Each mark is
                    labelled with the lengths it covers: ultra spans both, and
                    two bare ticks read as though the row granted them both. */}
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {tierBadgeSpans(tier).map((span) => (
                    <BadgeChip key={span.badge} span={span} />
                  ))}
                </div>
              </div>
              <span className="font-semibold tabular-nums">
                {formatAmount(tier.price)} ICP
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{t("note")}</p>
        <Link
          href="/brand-protection"
          className="inline-block text-xs font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary"
        >
          {t("brandProtectionLink")}
        </Link>
      </div>
      </BgImageCard>
    </div>
  )
}

// The mark plus the lengths it covers, tappable for the reason it matters. The
// label is what stops the ultra row -- which carries both marks -- from reading
// as though every ultra name were gold.
function BadgeChip({ span }: { span: BadgeSpan }) {
  const t = useTranslations("buyUsername")
  const lengths =
    span.min === span.max ? `${span.min}` : `${span.min}-${span.max}`

  return (
    <Popover>
      <PopoverTrigger className="flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:text-foreground">
        <BadgeMark tier={span.badge} className="size-3" />
        {t("badgeChip", { lengths })}
      </PopoverTrigger>
      <PopoverContent align="start" className="gap-2">
        <PopoverHeader>
          <PopoverTitle className="flex items-center gap-1.5 text-sm">
            <BadgeMark tier={span.badge} />
            {t(span.badge === "gold" ? "goldBadgeTitle" : "blueBadgeTitle")}
          </PopoverTitle>
        </PopoverHeader>
        <PopoverDescription className="text-xs">
          {t(span.badge === "gold" ? "goldBadgeInfo" : "blueBadgeInfo", {
            lengths,
          })}
        </PopoverDescription>
      </PopoverContent>
    </Popover>
  )
}
