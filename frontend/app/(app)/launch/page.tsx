"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Skeleton } from "@/components/ui/skeleton"
import { LaunchForm } from "@/components/launch/launch-form"
import { TokenCard } from "@/components/launch/token-card"
import { useMyTokens } from "@/hooks/token/useLaunchData"
import { useAuth } from "@/components/auth/auth-provider"
import { useRefreshWallet } from "@/hooks/wallet/useWalletData"
import { launchToken, type LaunchInput } from "@/services/launch/launch"

export default function LaunchPage() {
  const t = useTranslations("launch")
  const router = useRouter()
  const { identity } = useAuth()
  const refreshWallet = useRefreshWallet()
  const { tokens, isLoading, refresh } = useMyTokens()
  const [showForm, setShowForm] = useState(false)

  const handleLaunch = async (input: LaunchInput): Promise<string | null> => {
    const result = await launchToken(identity, input)
    if ("err" in result) return result.err

    // The fee has left the wallet and the row exists whatever happened after,
    // so both are refreshed before the detail page reads them.
    refreshWallet()
    await refresh()
    router.push(`/launch/${result.ok.id}`)
    return null
  }

  if (showForm) {
    return (
      <div className="space-y-6 pt-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{t("formTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("formSubtitle")}</p>
        </div>
        <LaunchForm onLaunch={handleLaunch} />
      </div>
    )
  }

  return (
    <div className="space-y-6 pt-2">
      <div>
        <h1 className="text-xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="flex w-full items-center gap-3 rounded-2xl border border-dashed bg-gradient-to-br from-amber-200 via-yellow-300 to-amber-500 p-4 text-left transition-colors hover:bg-muted/40"
      >
        <span className="min-w-0">
          <span className="block text-sm font-bold text-amber-950">{t("createCta")}</span>
          <span className="block text-xs font-medium text-amber-900/70">{t("createCtaBody")}</span>
        </span>
      </button>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">{t("myTokens")}</p>
        {isLoading && tokens.length === 0 ? (
          <div className="space-y-2 rounded-2xl border p-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : tokens.length === 0 ? (
          <p className="rounded-2xl border border-dashed px-4 py-8 text-center text-xs text-muted-foreground">
            {t("empty")}
          </p>
        ) : (
          <div className="divide-y overflow-hidden rounded-2xl border">
            {tokens.map((token) => (
              <TokenCard key={token.id} token={token} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
