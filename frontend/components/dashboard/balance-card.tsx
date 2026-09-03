"use client"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { AppIcon } from "@/components/ui/app-icon"
import { PremiumBadge } from "@/components/verifed/premium-badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { avatarUriFor } from "@/lib/profile/avatar"
import { cn } from "@/lib/ui/utils"
import type { IcpPrice } from "@/lib/market/icpPrice"
import { useFiatValue } from "@/hooks/fiat/useFiatValue"
import { ICP_LOGO } from "@/lib/token/icon"

type BalanceCardProps = {
  balance: string
  balanceE8s: bigint
  price: IcpPrice | null
  hidden: boolean
  onToggleHidden: () => void
  username?: string
}

const E8S = 100_000_000

export function BalanceCard({
  balance,
  balanceE8s,
  price,
  hidden,
  onToggleHidden,
  username,
}: BalanceCardProps) {
  const t = useTranslations("dashboard")
  const usdValue = price ? (Number(balanceE8s) / E8S) * price.usd : null
  const fiat = useFiatValue(usdValue)

  return (
    <div className="rounded-3xl bg-blue-200/80 pt-3 shadow-accent-foreground">
      <div className="relative mt-2 rounded-3xl bg-primary p-3 text-primary-foreground shadow-lg">
      {/* Top row: metallic EMV-style chip + glass network pill */}
      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
        <span className="relative flex h-6 w-8 shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-amber-200 via-yellow-300 to-amber-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),inset_0_-1px_2px_rgba(120,80,10,0.4),0_1px_2px_rgba(0,0,0,0.25)]">
          {/* Contact-pad grid lines, like a real EMV chip */}
          <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-amber-800/30" />
          <span className="absolute inset-y-0 left-1/3 w-px bg-amber-800/30" />
          <span className="absolute inset-y-0 left-2/3 w-px bg-amber-800/30" />
          <span className="absolute left-0 top-1/2 h-2.5 w-full -translate-y-1/2 rounded-[2px] border border-amber-800/25" />
        </span>

        {username && (
          <span className="flex min-w-0 items-center gap-2 font-mono text-sm font-medium tracking-tight text-primary-foreground/80">
            <Avatar className="size-7 ring-1 ring-primary-foreground/20">
              <AvatarImage src={avatarUriFor(username)} alt="" />
              <AvatarFallback className="bg-primary-foreground/10 text-[10px] uppercase">
                {username.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">{username}</span>
            <PremiumBadge name={username} className="size-3.5" />
          </span>
        )}
        </div>

        <span className="liquid-glass-primary flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5">
          <Image src={ICP_LOGO} alt="ICP" width={16} height={16} className="size-4" />
          <span className="text-[11px] font-semibold tracking-wide">ICP</span>
        </span>
      </div>

      {/* Balance */}
      <div className="relative z-10 mt-8 flex items-baseline gap-2">
        <span className="text-[clamp(1.75rem,9vw,2.75rem)] font-semibold leading-tight tracking-tight tabular-nums">
          {hidden ? "•• •••• ••••" : balance}
        </span>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={hidden ? t("showBalance") : t("hideBalance")}
          onClick={onToggleHidden}
          className="text-primary-foreground/60 hover:bg-primary-foreground/15 hover:text-primary-foreground"
        >
          <AppIcon
            name="hide"
            size={22}
            className={cn(hidden && "opacity-70")}
          />
        </Button>
      </div>

      {/* Footer row */}
      <div className="relative z-10 mt-6 flex items-end justify-between">
        <span className="liquid-glass-primary rounded-full px-2.5 py-1 text-sm font-medium tabular-nums">
          {hidden || !fiat.formatted ? "••••" : `≈ ${fiat.symbol} ${fiat.formatted}`}
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-primary-foreground/40">
          Internet Computer
        </span>
      </div>
      </div>
    </div>
  )
}