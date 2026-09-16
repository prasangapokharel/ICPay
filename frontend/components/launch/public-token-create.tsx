"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AiSecurity01Icon,
  Coins01Icon,
  ZapIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { LaunchForm } from "@/components/launch/launch-form"
import { useAuth } from "@/components/auth/auth-provider"
import { useRefreshWallet } from "@/hooks/wallet/useWalletData"
import { launchToken, type LaunchInput } from "@/services/launch/launch"

export function PublicTokenCreate() {
  const t = useTranslations("launch")
  const router = useRouter()
  const { identity, isAuthenticated, login } = useAuth()
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
      <header className="flex flex-col gap-4 text-center lg:text-left">
        <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
          <Badge
            variant="outline"
            className="gap-1.5 rounded-full border-primary/30 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary"
          >
            <HugeiconsIcon icon={SparklesIcon} className="size-3.5" />
            {t("title")}
          </Badge>
          <Badge variant="secondary" className="gap-1.5 rounded-full px-3 py-1 text-xs">
            <HugeiconsIcon icon={Coins01Icon} className="size-3.5 text-muted-foreground" />
            ICRC-1 Standard
          </Badge>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("createCta")}
          </h1>
          <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t("formSubtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2.5 pt-1 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card/60 p-3.5 text-left">
            <HugeiconsIcon
              icon={AiSecurity01Icon}
              className="size-5 shrink-0 text-primary"
              strokeWidth={1.75}
            />
            <div>
              <p className="text-xs font-semibold text-foreground">{t("immutableTitle")}</p>
              <p className="text-[11px] text-muted-foreground">Fixed supply & code</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card/60 p-3.5 text-left">
            <HugeiconsIcon
              icon={Coins01Icon}
              className="size-5 shrink-0 text-primary"
              strokeWidth={1.75}
            />
            <div>
              <p className="text-xs font-semibold text-foreground">Zero Presale</p>
              <p className="text-[11px] text-muted-foreground">100% creator minted</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card/60 p-3.5 text-left">
            <HugeiconsIcon
              icon={ZapIcon}
              className="size-5 shrink-0 text-primary"
              strokeWidth={1.75}
            />
            <div>
              <p className="text-xs font-semibold text-foreground">Instant Ledger</p>
              <p className="text-[11px] text-muted-foreground">On-chain in seconds</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col rounded-2xl border border-border/60 bg-card p-5 sm:p-8">
        <LaunchForm
          onLaunch={handleLaunch}
          isAuthenticated={isAuthenticated}
          onConnect={handleConnect}
          connecting={connecting}
        />
      </div>
    </div>
  )
}

