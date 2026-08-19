"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Copy01Icon,
  Tick02Icon,
  Github01Icon,
  FileAttachmentIcon,
  Package01Icon,
} from "@hugeicons/core-free-icons"

export function HeroSection() {
  const [copied, setCopied] = useState<string | null>(null)

  const commands = [
    { lang: "npm", cmd: "npm install icpay-bucket", label: "Node.js / TypeScript" },
    { lang: "pip", cmd: "pip install icpay-bucket", label: "Python" },
    { lang: "cargo", cmd: "cargo add icpay-bucket", label: "Rust" },
    { lang: "go", cmd: "go get github.com/icpay/icbucket-go", label: "Go" },
  ]

  const copyToClipboard = async (text: string, lang: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(lang)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                On-Chain Cloud Storage
              </div>
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                ICBucket
              </h1>
              <p className="text-xl text-muted-foreground md:text-2xl">
                Store files on-chain. No servers, no AWS bills. Pay once, store forever.
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-lg text-muted-foreground">
                Decentralized cloud storage built on Internet Computer with S3-compatible API.
                Perfect for dApps, NFT metadata, backups, and static hosting.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Installation
              </h3>
              <div className="space-y-3">
                {commands.map((item) => (
                  <div key={item.lang} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        {item.label}
                      </span>
                    </div>
                    <div className="relative">
                      <Input
                        value={item.cmd}
                        readOnly
                        className="h-11 pr-10 font-mono text-sm"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(item.cmd, item.lang)}
                        className="absolute right-1 top-1/2 size-9 -translate-y-1/2 p-0"
                        aria-label="Copy to clipboard"
                      >
                        <HugeiconsIcon
                          icon={copied === item.lang ? Tick02Icon : Copy01Icon}
                          className="size-4"
                        />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="https://icpay.app/bucket">
                <Button size="lg">
                  <HugeiconsIcon icon={FileAttachmentIcon} className="mr-2 size-4" />
                  Try ICBucket
                </Button>
              </Link>
              <Link
                href="https://github.com/prasangapokharel/ICPay"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" variant="outline">
                  <HugeiconsIcon icon={Github01Icon} className="mr-2 size-4" />
                  GitHub
                </Button>
              </Link>
              <Link href="/products/icBucket/packages">
                <Button size="lg" variant="outline">
                  <HugeiconsIcon icon={Package01Icon} className="mr-2 size-4" />
                  Packages
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-md">
              <Image
                src="/images/product/icbuckets/hero.png"
                alt="ICBucket - On-Chain Cloud Storage"
                width={600}
                height={600}
                className="h-auto w-full rounded-lg drop-shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
