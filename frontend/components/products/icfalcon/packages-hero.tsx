"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

export function PackagesHero() {
  const [copied, setCopied] = useState(false)
  const command = "falcon add pkg <slug>"

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="border-b px-4 py-16 text-center">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link
          href="/products/icFalcon"
          className="mx-auto flex w-fit items-center gap-3 transition-opacity hover:opacity-80"
        >
          <Image
            src="/images/product/icfalcon/icfalcon.png"
            alt="ICFalcon"
            width={64}
            height={64}
            className="h-16 w-16 rounded-xl"
          />
          <div className="text-left">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Falcon Packages
            </h1>
            <p className="text-sm text-muted-foreground">ICP-Hub Registry</p>
          </div>
        </Link>

        <p className="text-base text-muted-foreground">
          Production-ready Motoko packages for ICFalcon. Install with one
          command.
        </p>

        <Card className="mx-auto max-w-xl">
          <CardContent className="space-y-3 pt-6">
            <p className="text-sm font-semibold">Install any package</p>
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
              Replace <code className="rounded bg-muted px-1 py-0.5 font-mono">&lt;slug&gt;</code> with package name below
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-wrap justify-center gap-3 pt-4">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/products/icFalcon" />}
          >
            ICFalcon
          </Button>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/products/icFalcon/commands" />}
          >
            Commands
          </Button>
        </div>
      </div>
    </section>
  )
}
