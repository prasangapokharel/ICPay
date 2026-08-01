"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { HugeiconsIcon } from "@hugeicons/react"
import { Wallet01Icon, ShieldKeyIcon, FlashIcon, Key01Icon } from "@hugeicons/core-free-icons"
import { useAuth } from "@/components/auth/auth-provider"
import { Typewriter } from "@/components/shared/typewriter"
import { MarketStats } from "@/components/auth/market-stats"

const features = [
  { icon: ShieldKeyIcon, title: "Self-custodial", body: "Only you can authorize transfers." },
  { icon: Key01Icon, title: "No passwords", body: "Internet Identity signs you in." },
  { icon: FlashIcon, title: "Instant settlement", body: "ICP transfers confirm in seconds." },
]

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const handleLogin = async () => {
    setError(null)
    setConnecting(true)
    try {
      await login()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not connect. Please try again.")
    } finally {
      setConnecting(false)
    }
  }

  return (
    <div className="flex h-svh overflow-hidden justify-center">
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
        <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto text-center">
            <MarketStats />
            <Image
              src="/images/logo/logo.png"
              alt="ICP Wallet"
              width={96}
              height={96}
              priority
              className="mt-6 size-24 object-contain"
            />
            <h1 className="mt-6 text-2xl font-bold tracking-tight">ICP Wallet</h1>
            <p className="mt-2 h-10 text-balance text-sm text-muted-foreground">
              <Typewriter text="Send, receive and hold ICP with a wallet secured by your Internet Identity." />
            </p>

            <ul className="mt-10 w-full space-y-4 text-left">
              {features.map(({ icon, title, body }) => (
                <li key={title} className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                    <HugeiconsIcon icon={icon} className="size-4 text-primary" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">{title}</p>
                    <p className="text-xs text-muted-foreground">{body}</p>
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
            <Button className="h-12 w-full text-base" onClick={handleLogin} disabled={connecting}>
              {connecting ? <Spinner className="size-4" /> : <HugeiconsIcon icon={Wallet01Icon} className="size-5" />}
              {connecting ? "Connecting…" : "Connect Wallet"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              You&apos;ll be redirected to Internet Identity to approve access.
            </p>
          </div>
        </div>
      </div>
  )
}

