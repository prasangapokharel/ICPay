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
import { Wallet01Icon, ShieldKeyIcon, FlashIcon, Key01Icon } from "@hugeicons/core-free-icons"
import { useAuth } from "@/components/auth/auth-provider"
import { Typewriter } from "@/components/shared/typewriter"
import { MarketStats } from "@/components/auth/market-stats"
import { NFID_PROVIDER } from "@/services/icp"

const features = [
  { icon: ShieldKeyIcon, key: "custodial" },
  { icon: Key01Icon, key: "passwords" },
  { icon: FlashIcon, key: "instant" },
] as const

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const t = useTranslations("login")
  const tSettings = useTranslations("settings")

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

  const handleLogin = async (provider?: string) => {
    setError(null)
    setConnecting(true)
    try {
      await login(provider)
    } catch (e) {
      setError(e instanceof Error ? e.message : t("genericError"))
    } finally {
      setConnecting(false)
    }
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
          className="-z-10 object-cover object-center"
        />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-background/50" />
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
          <Button className="h-12 w-full text-base" onClick={() => handleLogin()} disabled={connecting}>
            {connecting ? <Spinner className="size-4" /> : <HugeiconsIcon icon={Wallet01Icon} className="size-5" />}
            {connecting ? t("connecting") : t("connect")}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            {t("redirectNote")}
          </p>

          {/* NFID authorizes through the same delegation flow auth-client
              speaks, so it is a drop-in provider. Signers like Oisy and Plug
              approve one call at a time and never issue a delegation, so they
              can fund the wallet but cannot open a session. */}
          <div className="flex flex-col items-center gap-2 pt-1">
            <p className="text-xs text-muted-foreground">{t("orContinue")}</p>
            <ButtonGroup>
              <Button
                variant="outline"
                className="h-9 px-5 text-xs"
                onClick={() => handleLogin(NFID_PROVIDER)}
                disabled={connecting}
              >
                NFID
              </Button>
            </ButtonGroup>
            {/* NFID is a separate identity system, so it derives a different
                principal -- a different wallet. Without this line an existing
                user signing in through it sees an empty balance. */}
            <p className="text-center text-xs text-muted-foreground">
              {t("nfidNote")}
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

          {/* The only crawlable entry point, so it is where /about and /faq get
              their inbound links -- every other route redirects a signed-out
              visitor before a crawler sees anything. */}
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

