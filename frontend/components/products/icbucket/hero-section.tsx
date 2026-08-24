"use client"

import { useState } from "react"
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
    <section className="flex min-h-[min(88vh,860px)] flex-col border-b bg-muted/30">
      <div className="container mx-auto flex flex-1 flex-col px-4 py-16 md:py-20">
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center">
          <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
            <div className="flex flex-1 flex-col gap-6 lg:max-w-lg">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                On-Chain Cloud Storage
              </span>
              <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                ICBucket
              </h1>
              <p className="text-lg leading-relaxed tracking-wide text-foreground/85 md:text-xl">
                Store files on-chain. No servers, no AWS bills. Pay once, store forever.
              </p>
            </div>

            <div className="flex flex-1 flex-col gap-5 lg:max-w-xl">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Installation
              </h2>
              <div className="flex flex-col gap-3">
                {commands.map((item) => (
                  <div key={item.lang} className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium tracking-wide text-muted-foreground">
                      {item.label}
                    </span>
                    <div className="relative">
                      <Input
                        value={item.cmd}
                        readOnly
                        className="h-11 bg-background pr-10 font-mono text-sm tracking-wide"
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

              <div className="flex flex-wrap gap-3 pt-2">
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
          </div>
        </div>
      </div>

      <div className="w-full border-t bg-background px-6 py-5 md:px-10 md:py-6">
        <p className="mx-auto max-w-5xl text-center text-sm leading-relaxed tracking-[0.04em] text-muted-foreground md:text-base">
          Decentralized cloud storage on Internet Computer with an S3-compatible API — built for
          dApps, NFT metadata, backups, and static hosting.
        </p>
      </div>
    </section>
  )
}
