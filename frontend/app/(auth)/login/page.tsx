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
  Wallet01Icon,
  ShieldKeyIcon,
  FlashIcon,
  Key01Icon,
  GoogleIcon,
  AppleIcon,
  MicrosoftIcon,
} from "@hugeicons/core-free-icons"
import type { OpenIdProvider } from "@icp-sdk/auth/client"
import { useAuth } from "@/components/auth/auth-provider"
import { Typewriter } from "@/components/shared/typewriter"
import { MarketStats } from "@/components/auth/market-stats"
import { createAuthClient, resumeRedirectSignIn } from "@/services/auth/auth"
import { primeLoginChime } from "@/lib/ui/successChime"

const features = [
  { icon: ShieldKeyIcon, key: "custodial" },
  { icon: Key01Icon, key: "passwords" },
  { icon: FlashIcon, key: "instant" },
] as const

const openIdProviders = [
  { id: "google" as const, icon: GoogleIcon },
  { id: "apple" as const, icon: AppleIcon },
  { id: "microsoft" as const, icon: MicrosoftIcon },
] satisfies { id: OpenIdProvider; icon: typeof GoogleIcon }[]

export default function LoginPage() {
  const { login, acceptIdentity, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const t = useTranslations("login")
  const tSettings = useTranslations("settings")

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
    if (!isLoading && isAuthenticated) router.replace("/")
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
      <div className="relative flex w-full max-w-md flex-col overflow-hidden px-6 pb-10 pt-16 shadow-xl sm:my-8 sm:max-h-[calc(100svh-4rem)] sm:rounded-3xl sm:border sm:border-border/50">
        <Image
          src="/images/connectbg/1.png"
          alt=""
          fill
          priority
          sizes="(max-width: 640px) 100vw, 28rem"
          className="-z-10 object-cover object-center dark:opacity-35"
        />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-background/50 dark:bg-background/75" />
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <MarketStats />
          <Image
            src="/images/logo/logo.png"
            alt="ICP Wallet"
            width={96}
            height={96}
            priority
            className="mt-6 size-24 object-contain"
          />
          <h1 className="mt-6 text-2xl font-bold tracking-tight">{t("heading")}</h1>
          <p className="mt-2 h-10 text-balance text-sm text-muted-foreground">
            <Typewriter text={t("tagline")} />
          </p>

          <ul className="mt-10 w-full space-y-4 text-left">
            {features.map(({ icon, key }) => (
              <li key={key} className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                  <HugeiconsIcon icon={icon} className="size-4 text-primary" />
                </span>
                <div>
                  <p className="text-sm font-medium">{t(`features.${key}Title`)}</p>
                  <p className="text-xs text-muted-foreground">{t(`features.${key}Body`)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 space-y-3">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button size="lg" className="w-full" onClick={() => startLogin()} disabled={connecting}>
            {connecting ? <Spinner className="size-4" /> : <HugeiconsIcon icon={Wallet01Icon} className="size-5" />}
            {connecting ? t("connecting") : t("connect")}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            {t("redirectNote")}
          </p>

          <div className="flex flex-col items-center gap-2 pt-1">
            <p className="text-xs text-muted-foreground">{t("orContinue")}</p>
            <ButtonGroup>
              {openIdProviders.map(({ id, icon }) => (
                <Button
                  key={id}
                  variant="outline"
                  size="icon"
                  className="size-10"
                  onClick={() => startLogin({ openIdProvider: id })}
                  disabled={connecting}
                  aria-label={t(`openId.${id}`)}
                >
                  <HugeiconsIcon icon={icon} className="size-4" />
                </Button>
              ))}
            </ButtonGroup>
            <p className="text-center text-xs text-muted-foreground">
              {t("openIdNote")}
            </p>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            {t("legalPrefix")}{" "}
            <Link href="/terms" className="underline underline-offset-2">
              {t("legalTerms")}
            </Link>{" "}
            {t("legalAnd")}{" "}
            <Link href="/privacy" className="underline underline-offset-2">
              {t("legalPrivacy")}
            </Link>
            .
          </p>

          <nav className="flex justify-center gap-4 text-xs text-muted-foreground">
            <Link href="/about" className="underline underline-offset-2">
              {tSettings("items.about")}
            </Link>
            <Link href="/faq" className="underline underline-offset-2">
              {tSettings("items.faq")}
            </Link>
            <Link href="/roadmap" className="underline underline-offset-2">
              {tSettings("items.roadmap")}
            </Link>
            <Link href="/transparency" className="underline underline-offset-2">
              {tSettings("items.transparency")}
            </Link>
          </nav>
        </div>
      </div>
    </div>
  )
}
