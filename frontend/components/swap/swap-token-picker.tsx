"use client"

import Image from "next/image"
import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { formatTokenAmount } from "@/lib/wallet/utils"
import { ICP_LEDGER_ID, type TokenHolding } from "@/services/tokens"

export function SwapTokenPicker({
  open,
  onOpenChange,
  tokens,
  selectedId,
  onSelect,
  title,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  tokens: TokenHolding[]
  selectedId: string | null
  onSelect: (token: TokenHolding) => void
  title: string
}) {
  const t = useTranslations("swap")
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return tokens
    return tokens.filter(
      (tok) =>
        tok.symbol.toLowerCase().includes(q) || tok.name.toLowerCase().includes(q)
    )
  }, [tokens, query])

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
        </DrawerHeader>
        <div className="space-y-3 overflow-y-auto px-4 pb-6">
          <div className="relative">
            <HugeiconsIcon
              icon={Search01Icon}
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchToken")}
              className="rounded-full bg-muted/60 pl-10"
            />
          </div>
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">{t("noTokens")}</p>
          ) : (
            <ul className="space-y-0.5">
              {filtered.map((token) => (
                <li key={token.ledgerId}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(token)
                      onOpenChange(false)
                      setQuery("")
                    }}
                    className={`flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left transition-colors hover:bg-muted/60 active:scale-[0.99] ${
                      token.ledgerId === selectedId ? "bg-muted/50" : ""
                    }`}
                  >
                    <TokenLogo token={token} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{token.symbol}</p>
                      <p className="truncate text-xs text-muted-foreground">{token.name}</p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold tabular-nums">
                      {formatTokenAmount(token.balance, token.decimals)}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function TokenLogo({ token }: { token: TokenHolding }) {
  const src = token.ledgerId === ICP_LEDGER_ID ? "/images/logo/logo.png" : token.logo
  if (!src) {
    return (
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold uppercase text-muted-foreground">
        {token.symbol.slice(0, 2)}
      </span>
    )
  }
  return (
    <Image
      src={src}
      alt=""
      width={36}
      height={36}
      unoptimized
      className="size-9 shrink-0 rounded-full object-contain"
    />
  )
}
