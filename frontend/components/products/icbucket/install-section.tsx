"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons"

const COMMANDS = [
  { lang: "npm", cmd: "npm install icpay-bucket", label: "Node.js / TypeScript" },
  { lang: "pip", cmd: "pip install icpay-bucket", label: "Python" },
  { lang: "cargo", cmd: "cargo add icpay-bucket", label: "Rust" },
  { lang: "go", cmd: "go get github.com/icpay/icbucket-go", label: "Go" },
] as const

export function InstallSection() {
  const [copied, setCopied] = useState<string | null>(null)

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
    <section className="border-b border-border/60 bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 space-y-3 text-center md:mb-12">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Installation</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              SDKs for Node.js, Python, Rust, and Go. Install from npm, PyPI, crates.io, or Go
              modules.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {COMMANDS.map((item) => (
              <div key={item.lang} className="space-y-2">
                <span className="text-xs font-medium tracking-wide text-muted-foreground">
                  {item.label}
                </span>
                <div className="relative">
                  <Input
                    value={item.cmd}
                    readOnly
                    className="h-11 bg-background pr-10 font-mono text-sm"
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
      </div>
    </section>
  )
}
