"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item"
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
    <div className="mx-auto flex w-full max-w-[440px] flex-col justify-center px-4 py-8 sm:py-12">
      <div className="rounded-3xl border border-border/70 bg-card/80 p-6 sm:p-8">
        <header className="flex flex-col">
          <div className="flex items-center gap-2.5">
            <Image
              src={APP_LOGO}
              alt=""
              aria-hidden
              width={32}
              height={32}
              priority
              loading="eager"
              fetchPriority="high"
              sizes="2rem"
              className="size-8 shrink-0 object-contain"
            />
            <span className="text-xl font-bold tracking-tight text-foreground">
              {t("heading")}
            </span>
          </div>

          <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t("connect")}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {t("tagline")}
          </p>
        </header>

        {error ? (
          <Alert variant="destructive" className="mt-5">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="mt-6 flex flex-col gap-3">
          <Button
            size="lg"
            className="h-12 w-full rounded-2xl text-base font-semibold  hover:opacity-90"
            onClick={() => startLogin()}
            disabled={connecting}
          >
            {connecting ? <Spinner className="size-4" /> : null}
            {connecting ? t("connecting") : t("connect")}
          </Button>

          <div className="relative my-3 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/60" />
            </div>
            <span className="relative bg-card px-3 text-xs uppercase tracking-wider text-muted-foreground">
              or
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {openIdProviders.map(({ id, src, iconClassName }) => (
              <Item
                key={id}
                variant="outline"
                className="relative flex h-12 w-full cursor-pointer items-center justify-center rounded-2xl border-border/70 bg-card/40 px-4 transition-all hover:border-primary/40 hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50"
                render={
                  <button
                    type="button"
                    onClick={() => startLogin({ openIdProvider: id })}
                    disabled={connecting}
                    aria-label={t(`openId.${id}`)}
                  />
                }
              >
                <ItemMedia className="absolute left-4">
                  <Image
                    src={src}
                    alt=""
                    aria-hidden
                    width={20}
                    height={20}
                    unoptimized
                    className={cn("size-5 object-contain", iconClassName)}
                  />
                </ItemMedia>
                <ItemContent className="items-center justify-center">
                  <ItemTitle className="text-sm font-medium text-foreground">
                    {t(`openId.${id}`)}
                  </ItemTitle>
                </ItemContent>
              </Item>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
          {t("legalPrefix")}{" "}
          <Link href="/terms" className="text-foreground underline underline-offset-2 hover:text-primary">
            {t("legalTerms")}
          </Link>{" "}
          {t("legalAnd")}{" "}
          <Link href="/privacy" className="text-foreground underline underline-offset-2 hover:text-primary">
            {t("legalPrivacy")}
          </Link>
          .
        </p>
      </div>
    </div>
  )
}

