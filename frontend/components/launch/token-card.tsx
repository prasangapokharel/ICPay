"use client"

import Link from "next/link"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { Coins01Icon } from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { statusOf } from "@/services/launch/launch"
import type { TokenPublic } from "@/services/types"
import { formatTokenAmount } from "@/lib/wallet/utils"
import { cn } from "@/lib/ui/utils"

const STATUS_VARIANT = {
  active: "secondary",
  pending: "outline",
  failed: "destructive",
} as const

export function TokenCard({ token }: { token: TokenPublic }) {
  const t = useTranslations("launch")
  const status = statusOf(token)
  const [logo] = token.logo

  return (
    // Keyed by the internal id, not the canister id: a launch that failed before
    // creation has no canister id, and those are exactly the rows worth opening.
    <Link
      href={`/launch/${token.id}`}
      prefetch
      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
    >
      <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
        {logo ? (
          <Image src={logo} alt="" width={40} height={40} className="size-full object-cover" unoptimized />
        ) : (
          <HugeiconsIcon icon={Coins01Icon} className="size-5 text-muted-foreground" />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{token.name}</span>
          <span className="shrink-0 font-mono text-xs text-muted-foreground">{token.symbol}</span>
        </span>
        <span className="mt-0.5 block truncate text-xs tabular-nums text-muted-foreground">
          {formatTokenAmount(token.totalSupply, token.decimals, 0)} {token.symbol}
        </span>
      </span>

      <Badge variant={STATUS_VARIANT[status]} className={cn("shrink-0", status === "pending" && "animate-pulse")}>
        {t(`status.${status}`)}
      </Badge>
    </Link>
  )
}
