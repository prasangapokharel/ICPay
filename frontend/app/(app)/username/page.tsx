"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Tick02Icon, Cancel01Icon, ShoppingBag01Icon } from "@hugeicons/core-free-icons"
import { purchaseUsername } from "@/services/buy/buy"
import type { Purchase } from "@/services/types"
import { useAuth } from "@/components/auth/auth-provider"
import { useRefreshWallet } from "@/hooks/use-wallet-data"
import { formatAmount, ICP_FEE } from "@/lib/wallet-utils"
import { priceFor, tierFor, validateUsername, TIERS, USERNAME_MAX_LENGTH, USERNAME_FREE_MIN_LENGTH } from "@/lib/username"
import { useUsernameAvailability, useLiveBalance } from "@/hooks/use-wallet-data"
import { SendSuccess } from "@/components/wallet/send-success"
import { primeSuccessChime } from "@/lib/success-chime"
import { cn } from "@/lib/utils"

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
  const insufficient = balance !== undefined && trimmed !== "" && total > balance
  const canBuy =
    trimmed !== "" && !shapeError && available === true && !insufficient && !buying

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
    <div className="space-y-6 pt-2">
      <div>
        <h1 className="text-xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="buy-username">{t("label")}</Label>
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base text-muted-foreground">
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
            className="h-12 rounded-2xl pl-9 pr-10 text-base"
          />
          {trimmed !== "" && !shapeError && !checking && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2">
              <HugeiconsIcon
                icon={available ? Tick02Icon : Cancel01Icon}
                className={cn("size-5", available ? "text-success" : "text-destructive")}
              />
            </span>
          )}
          {checking && (
            <Spinner className="absolute right-4 top-1/2 size-4 -translate-y-1/2" />
          )}
        </div>
        {shapeError && (
          <p className="text-xs text-destructive">
            {t(`errors.${shapeError}`, { max: USERNAME_MAX_LENGTH, min: USERNAME_FREE_MIN_LENGTH })}
          </p>
        )}
        {!shapeError && available === false && (
          <p className="text-xs text-destructive">{t("taken", { name: trimmed })}</p>
        )}
        {!shapeError && available === true && (
          <p className="text-xs text-success">{t("availableName", { name: trimmed })}</p>
        )}
      </div>

      {trimmed !== "" && !shapeError && tier && (
        <div className="space-y-3 rounded-2xl bg-muted/40 p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">{t(`tiers.${tier.labelKey}`)}</span>
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
        </div>
      )}

      {insufficient && (
        <Alert variant="destructive">
          <AlertDescription>
            {t("insufficient", { total: formatAmount(total) })}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button className="h-12 w-full text-base" disabled={!canBuy} onClick={handleBuy}>
        {buying ? (
          <Spinner className="size-4" />
        ) : (
          <HugeiconsIcon icon={ShoppingBag01Icon} className="size-4" />
        )}
        {buying ? t("buying") : t("buy")}
      </Button>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">{t("pricing")}</p>
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
                <p className="text-xs text-muted-foreground">{t(`tiers.${tier.rangeKey}`)}</p>
              </div>
              <span className="tabular-nums font-semibold">{formatAmount(tier.price)} ICP</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{t("note")}</p>
      </div>
    </div>
  )
}
