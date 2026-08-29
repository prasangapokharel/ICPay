"use client"

import Link from "next/link"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"

export function LandingCta() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <section className="bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
          <div className="h-24 animate-pulse rounded-2xl bg-muted" />
        </div>
      </section>
    )
  }

  if (isAuthenticated) {
    return (
      <section className="bg-muted/30">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-16 md:flex-row md:items-center md:px-6 md:py-20">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              You are signed in
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Open your wallet to send ICP, check balances, or explore channels and tokens.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="/home" />}
              className="h-11 rounded-full px-7"
            >
              Open wallet
            </Button>
            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              render={<Link href="/channels" />}
              className="h-11 rounded-full px-7"
            >
              Browse channels
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-muted/30">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-16 md:flex-row md:items-center md:px-6 md:py-20">
        <div className="space-y-3">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Ready to move ICP with a username?
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Sign in with Internet Identity, claim your handle, and start sending in seconds.
            No seed phrase. No browser extension required.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            size="lg"
            nativeButton={false}
            render={<Link href="/login" />}
            className="h-11 rounded-full px-7"
          >
            Sign in
          </Button>
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            render={<Link href="/channels" />}
            className="h-11 rounded-full px-7"
          >
            Browse channels
          </Button>
        </div>
      </div>
    </section>
  )
}
