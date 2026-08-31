"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { LaunchForm } from "@/components/launch/launch-form"
import { useAuth } from "@/components/auth/auth-provider"
import { useRefreshWallet } from "@/hooks/wallet/useWalletData"
import { launchToken, type LaunchInput } from "@/services/launch/launch"

export function PublicTokenCreate() {
  const t = useTranslations("launch")
  const router = useRouter()
  const { identity, isAuthenticated, isLoading, login } = useAuth()
  const refreshWallet = useRefreshWallet()
  const [connecting, setConnecting] = useState(false)

  const handleLaunch = async (input: LaunchInput): Promise<string | null> => {
    const result = await launchToken(identity, input)
    if ("err" in result) return result.err

    refreshWallet()
    router.push(`/launch/${result.ok.id}`)
    return null
  }

  const handleConnect = async () => {
    setConnecting(true)
    try {
      await login()
    } finally {
      setConnecting(false)
    }
  }

  return (
    <div className="flex w-full flex-col gap-8 lg:gap-10">
      <header className="flex flex-col gap-3 text-center lg:text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
          {t("title")}
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {t("createCta")}
        </h1>
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base lg:mx-0">
          {t("formSubtitle")}
        </p>
      </header>

      <div className="flex flex-col rounded-2xl border border-border/60 bg-card p-5 shadow-sm md:p-8">
        <LaunchForm
          onLaunch={handleLaunch}
          isAuthenticated={isAuthenticated}
          onConnect={handleConnect}
          authLoading={isLoading}
          connecting={connecting}
        />
      </div>
    </div>
  )
}
