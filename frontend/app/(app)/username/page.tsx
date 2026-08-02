"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Tick02Icon, Cancel01Icon, ShoppingBag01Icon } from "@hugeicons/core-free-icons"
import { getWalletActor } from "@/services/wallet"
import { useAuth } from "@/components/auth/auth-provider"
import { useDashboard, useRefreshWallet } from "@/hooks/use-wallet-data"
import { formatAmount, ICP_FEE } from "@/lib/wallet-utils"
import { priceFor, tierFor, validateUsername, TIERS, USERNAME_MAX_LENGTH } from "@/lib/username"
import { useUsernameAvailability } from "@/hooks/use-wallet-data"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

export default function UsernamePage() {
  const router = useRouter()
  const { identity } = useAuth()
  const { data: dashboard } = useDashboard()
  const refreshWallet = useRefreshWallet()
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [buying, setBuying] = useState(false)

  const trimmed = name.trim()
  const shapeError = trimmed ? validateUsername(trimmed) : null
  const { available, isLoading: checking } = useUsernameAvailability(
    shapeError ? "" : trimmed
  )

  const price = trimmed ? priceFor(trimmed) : 0n
  const tier = trimmed ? tierFor(trimmed) : null
  const total = price + ICP_FEE
  const balance = dashboard?.icpBalance
  const insufficient = balance !== undefined && trimmed !== "" && total > balance
  const canBuy =
    trimmed !== "" && !shapeError && available === true && !insufficient && !buying

  const handleBuy = async () => {
    if (!identity || !canBuy) return
    setBuying(true)
    setError(null)
    try {
      const actor = await getWalletActor(identity)
      const result = await actor.purchaseUsername(trimmed)
      if ("err" in result) {
        setError(result.err)
        return
      }
      refreshWallet()
      toast.add({
        title: `@${result.ok.username} is yours`,
        description: `Paid ${formatAmount(result.ok.price)} ICP.`,
      })
      router.push("/profile")
    } catch (e) {
      console.error(e)
      setError("Purchase failed")
    } finally {
      setBuying(false)
    }
  }

  return (
    <div className="space-y-6 pt-2">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Buy a username</h1>
        <p className="text-sm text-muted-foreground">
          Short names are premium. The shorter it is, the more it costs.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="buy-username">Username</Label>
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
        {shapeError && <p className="text-xs text-destructive">{shapeError}</p>}
        {!shapeError && available === false && (
          <p className="text-xs text-destructive">@{trimmed} is already taken</p>
        )}
        {!shapeError && available === true && (
          <p className="text-xs text-success">@{trimmed} is available</p>
        )}
      </div>

      {trimmed !== "" && !shapeError && tier && (
        <div className="space-y-3 rounded-2xl bg-muted/40 p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">{tier.label}</span>
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
            <span>Network fee</span>
            <span className="tabular-nums">{formatAmount(ICP_FEE)} ICP</span>
          </div>
          <div className="flex items-baseline justify-between border-t pt-3 text-sm font-medium">
            <span>Total</span>
            <span className="tabular-nums">{formatAmount(total)} ICP</span>
          </div>
        </div>
      )}

      {insufficient && (
        <Alert variant="destructive">
          <AlertDescription>
            Not enough balance. This costs {formatAmount(total)} ICP with the fee.
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
        {buying ? "Buying…" : "Buy username"}
      </Button>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Pricing</p>
        <div className="overflow-hidden rounded-2xl border">
          {TIERS.map((t, i) => (
            <div
              key={t.label}
              className={cn(
                "flex items-baseline justify-between px-4 py-3 text-sm",
                i > 0 && "border-t"
              )}
            >
              <div>
                <p className="font-medium">{t.label}</p>
                <p className="text-xs text-muted-foreground">{t.range}</p>
              </div>
              <span className="tabular-nums font-semibold">{formatAmount(t.price)} ICP</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          A bought name becomes your primary handle. Any name you already hold
          keeps pointing at you, so older payment links never break.
        </p>
      </div>
    </div>
  )
}
