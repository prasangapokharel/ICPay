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
import { ShineBorder } from "@/components/ui/shine-border"
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text"

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

      <header className="flex flex-col gap-5 text-center lg:text-left">
        <div className="flex flex-wrap items-center justify-center gap-2.5 lg:justify-start">
          <div className="inline-flex items-center justify-center rounded-full border border-primary/30 bg-primary/5 px-3.5 py-1 backdrop-blur-xs">
            <AnimatedShinyText className="inline-flex items-center justify-center text-xs font-semibold text-primary">
              <span className="flex items-center gap-1.5">
                <HugeiconsIcon icon={SparklesIcon} className="size-3.5 text-primary" />
                {t("title")}
              </span>
            </AnimatedShinyText>
          </div>
          <Badge variant="secondary" className="gap-1.5 rounded-full px-3 py-1 text-xs border border-border/60 bg-muted/60">
            <HugeiconsIcon icon={Coins01Icon} className="size-3.5 text-primary" />
            ICRC-1 Standard
          </Badge>
        </div>

        <div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl bg-linear-to-b from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-transparent">
            {t("createCta")}
          </h1>
          <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t("formSubtitle")}
          </p>
        </div>

        {/* 3 Pillar Guarantee Cards — Clean icon with text-primary, NO icon background box */}
        <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/60 p-3.5 text-left backdrop-blur-md transition-all hover:border-primary/40">
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

          <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/60 p-3.5 text-left backdrop-blur-md transition-all hover:border-primary/40">
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

          <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/60 p-3.5 text-left backdrop-blur-md transition-all hover:border-primary/40">
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

      {/* Main Creation Card with Animated Shine Border */}
      <div className="relative flex flex-col overflow-hidden rounded-3xl border border-border/70 bg-card/75 p-5 sm:p-8 shadow-xl backdrop-blur-xl">
        <ShineBorder
          shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
          borderWidth={1.2}
          duration={12}
        />
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
