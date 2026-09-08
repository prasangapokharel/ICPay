"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { OpenIdProvider } from "@icp-sdk/auth/client"
import { useAuth } from "@/components/auth/auth-provider"
import { createAuthClient, resumeRedirectSignIn } from "@/services/auth/auth"
import { primeLoginChime } from "@/lib/ui/successChime"
import { APP_LOGO } from "@/lib/ui/brand-images"
import { cn } from "@/lib/ui/utils"

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
      <div className="flex min-h-64 items-center justify-center">
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
    <div className="mx-auto flex w-full max-w-sm flex-col justify-center py-6 md:py-10">
      <header className="flex flex-col items-center text-center">
          <h1 className="inline-flex items-center justify-center gap-2.5 text-2xl font-semibold tracking-tight">
            <Image
              src={APP_LOGO}
              alt=""
              aria-hidden
              width={36}
              height={36}
              priority
              fetchPriority="high"
              sizes="2.25rem"
              className="h-9 w-9 shrink-0 object-contain"
            />
            {t("heading")}
          </h1>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">{t("tagline")}</p>
      </header>

      <p className="mt-8 text-center text-xs leading-relaxed text-muted-foreground">
          {t("legalPrefix")}{" "}
          <Link href="/terms" className="text-foreground underline underline-offset-2">
            {t("legalTerms")}
          </Link>{" "}
          {t("legalAnd")}{" "}
          <Link href="/privacy" className="text-foreground underline underline-offset-2">
            {t("legalPrivacy")}
          </Link>
          .
      </p>

      {error ? (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Button
          size="lg"
          className="mt-6 h-11 w-full rounded-full text-base font-medium"
          onClick={() => startLogin()}
          disabled={connecting}
        >
          {connecting ? <Spinner className="size-4" /> : null}
          {connecting ? t("connecting") : t("connect")}
      </Button>

      <div className="mt-6 flex items-center justify-center gap-3">
          {openIdProviders.map(({ id, src, iconClassName }) => (
            <Button
              key={id}
              type="button"
              variant="outline"
              size="icon"
              className="size-11 rounded-full"
              onClick={() => startLogin({ openIdProvider: id })}
              disabled={connecting}
              aria-label={t(`openId.${id}`)}
            >
              <Image
                src={src}
                alt=""
                aria-hidden
                width={20}
                height={20}
                unoptimized
                className={cn("size-5 object-contain", iconClassName)}
              />
            </Button>
          ))}
      </div>
    </div>
  )
}
