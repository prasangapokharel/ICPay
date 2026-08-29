"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ShieldKeyIcon,
  FlashIcon,
  Key01Icon,
} from "@hugeicons/core-free-icons"
import type { OpenIdProvider } from "@icp-sdk/auth/client"
import { useAuth } from "@/components/auth/auth-provider"
import { Typewriter } from "@/components/shared/typewriter"
import { MarketStats } from "@/components/auth/market-stats"
import { LanguageSwitch } from "@/components/i18n/language-switch"
import { useAutoLocale } from "@/hooks/i18n/use-auto-locale"
import { createAuthClient, resumeRedirectSignIn } from "@/services/auth/auth"
import { primeLoginChime } from "@/lib/ui/successChime"
import { APP_LOGO, LOGIN_BG } from "@/lib/ui/brand-images"
import { cn } from "@/lib/ui/utils"

const features = [
  { icon: ShieldKeyIcon, key: "custodial" },
  { icon: Key01Icon, key: "passwords" },
  { icon: FlashIcon, key: "instant" },
] as const

const openIdProviders = [
  { id: "google" as const, src: "/images/auth/google-icon.svg" },
  { id: "apple" as const, src: "/images/auth/apple.svg", iconClassName: "dark:invert" },
  { id: "microsoft" as const, src: "/images/auth/microsoft-icon.svg" },
] satisfies { id: OpenIdProvider; src: string; iconClassName?: string }[]

export default function LoginPage() {
  const { login, acceptIdentity, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const t = useTranslations("login")
  useAutoLocale()

  useEffect(() => {
    void createAuthClient()
  }, [])

  useEffect(() => {
    void (async () => {
      const id = await resumeRedirectSignIn()
      if (!id) return
      primeLoginChime()
      setConnecting(true)
      try {
        await acceptIdentity(id)
      } catch (e) {
        setError(e instanceof Error ? e.message : t("genericError"))
      } finally {
        setConnecting(false)
      }
    })()
  }, [acceptIdentity, t])

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace("/home")
  }, [isLoading, isAuthenticated, router])

  if (isLoading || isAuthenticated) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-muted/40">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    )
  }

  const startLogin = (options?: { openIdProvider?: OpenIdProvider }) => {
    primeLoginChime()
    setError(null)
    setConnecting(true)
    login(options)
      .catch((e) => setError(e instanceof Error ? e.message : t("genericError")))
      .finally(() => setConnecting(false))
  }

  return (
    <div className="flex min-h-svh justify-center">
      <div className="relative flex min-h-svh w-full max-w-md flex-col overflow-hidden px-5 pb-[max(1rem,env(safe-area-inset-bottom)+0.5rem)] pt-[max(3.5rem,env(safe-area-inset-top)+2.5rem)] shadow-xl sm:my-8 sm:min-h-0 sm:max-h-[calc(100svh-4rem)] sm:rounded-3xl sm:border sm:border-border/50 sm:px-6 sm:pb-[max(1.5rem,env(safe-area-inset-bottom)+1rem)] sm:pt-16">
        <div className="absolute right-4 top-[max(1rem,env(safe-area-inset-top)+0.5rem)] z-10 sm:right-6">
          <LanguageSwitch />
        </div>
        <Image
          src={LOGIN_BG}
          alt=""
          fill
          priority
          fetchPriority="high"
          sizes="(max-width: 640px) 100vw, 28rem"
          className="-z-10 object-cover object-center dark:opacity-35"
        />
        <div className="pointer-events-none absolute inset-0 -z-10 " />
        <div className="flex flex-1 flex-col items-center pt-1 text-center">
          <MarketStats />
          <Image
            src={APP_LOGO}
            alt="ICP Wallet"
            width={128}
            height={128}
            priority
            fetchPriority="high"
            sizes="(max-width: 640px) 6rem, 8rem"
            className="mt-2 h-24 w-24 object-contain sm:mt-3 sm:h-32 sm:w-32"
          />
          <h1 className="mt-2 text-xl font-bold tracking-tight sm:mt-3 sm:text-2xl">{t("heading")}</h1>
          <p className="mt-1.5 min-h-9 text-balance text-sm leading-snug text-muted-foreground sm:mt-2 sm:min-h-10">
            <Typewriter text={t("tagline")} />
          </p>

          <ul className="mt-8 w-full space-y-3 text-left sm:mt-6 sm:space-y-3.5">
            {features.map(({ icon, key }) => (
              <li key={key} className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary">
                  <HugeiconsIcon icon={icon} className="size-4 text-primary-foreground" strokeWidth={1.75} />
                </span>
                <div>
                  <p className="text-sm font-sm">{t(`features.${key}Title`)}</p>
                  <p className="text-xs text-muted-foreground">{t(`features.${key}Body`)}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8 w-full space-y-2.5 sm:mt-6 sm:space-y-3">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button size="lg" className="w-full" onClick={() => startLogin()} disabled={connecting}>
              {connecting ? <Spinner className="size-4" /> : null}
              {connecting ? t("connecting") : t("connect")}
            </Button>

            <div className="flex flex-col items-center gap-2 pt-1">
              <p className="text-xs text-muted-foreground">{t("orContinue")}</p>
              <ButtonGroup>
                {openIdProviders.map(({ id, src, iconClassName }) => (
                  <Button
                    key={id}
                    variant="outline"
                    size="icon"
                    className="size-11 rounded-xl"
                    onClick={() => startLogin({ openIdProvider: id })}
                    disabled={connecting}
                    aria-label={t(`openId.${id}`)}
                  >
                    <Image
                      src={src}
                      alt=""
                      width={24}
                      height={24}
                      unoptimized
                      className={cn("size-6 object-contain", iconClassName)}
                    />
                  </Button>
                ))}
              </ButtonGroup>
              <p className="text-center text-xs text-muted-foreground">
                {t("openIdNote")}
              </p>
            </div>
          </div>
        </div>

        <footer className="mt-auto w-full px-2 pt-4 text-center text-xs leading-relaxed text-muted-foreground">
          {t("legalPrefix")}{" "}
          <Link href="/terms" className="underline underline-offset-2">
            {t("legalTerms")}
          </Link>{" "}
          {t("legalAnd")}{" "}
          <Link href="/privacy" className="underline underline-offset-2">
            {t("legalPrivacy")}
          </Link>
          .
        </footer>
      </div>
    </div>
  )
}
