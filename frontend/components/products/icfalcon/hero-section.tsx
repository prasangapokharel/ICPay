"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, Tick02Icon, Github01Icon } from "@hugeicons/core-free-icons"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function HeroSection() {
  const [copied, setCopied] = useState(false)
  const command = "npm create icfalcon@latest my-app"

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex justify-center">
          <Image
            src="/images/product/icfalcon/icfalcon.png"
            alt="ICFalcon Framework"
            width={280}
            height={280}
            priority
            className="h-auto w-[280px] rounded-2xl"
          />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            ICFalcon
          </h1>
          <p className="text-xl text-muted-foreground sm:text-2xl">
            Production-Ready Motoko Framework for Internet Computer
          </p>
          <p className="text-base text-muted-foreground">
            Enforced layered architecture · Next.js frontend · Global CLI ·
            Internet Identity auth
          </p>
        </div>

        <div className="mx-auto max-w-2xl space-y-3">
          <p className="text-sm font-semibold">Install with one command</p>
          <div className="relative">
            <Input
              value={command}
              readOnly
              size="lg"
              className="px-3 pr-11 font-mono text-center text-sm sm:text-base"
            />
            <button
              onClick={handleCopy}
              className="absolute right-2 top-1/2 -translate-y-1/2 transition-colors hover:text-foreground"
              aria-label="Copy command"
            >
              <HugeiconsIcon
                icon={copied ? Tick02Icon : Copy01Icon}
                className="size-5"
              />
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Installs dependencies, deploys locally, and starts dev server at
            localhost:3000
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 pt-6 sm:flex-row sm:justify-center">
          <Button
            size="lg"
            nativeButton={false}
            render={
              <Link
                href="https://www.npmjs.com/package/create-icfalcon"
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            npm
          </Button>
          <Button
            variant="outline"
            size="lg"
            nativeButton={false}
            render={
              <Link
                href="https://github.com/prasangapokharel/IcFalcon"
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <HugeiconsIcon icon={Github01Icon} className="mr-2 size-5" />
            GitHub
          </Button>
          <Button
            variant="outline"
            size="lg"
            nativeButton={false}
            render={<Link href="/products/icFalcon/packages" />}
          >
            Packages
          </Button>
        </div>
      </div>
    </section>
  )
}
