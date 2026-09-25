"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/ui/utils"
import { ShineBorder } from "@/components/ui/shine-border"
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text"
import { Nodejs, Python, Rust, Go } from "@dev.icons/react"

const COMMANDS = [
  { lang: "npm", cmd: "npm install icpay-bucket", tag: "Node.js", icon: Nodejs },
  { lang: "pip", cmd: "pip install icpay-bucket", tag: "Python", icon: Python },
  { lang: "cargo", cmd: "cargo add icpay-bucket", tag: "Rust", icon: Rust },
  { lang: "go", cmd: "go get github.com/icpay/icbucket-go", tag: "Go", icon: Go },
] as const

export function InstallSection() {
  const t = useTranslations("publicSite.icbucket.install")
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
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <div className="mb-10 flex flex-col items-center space-y-3 text-center md:mb-12">
          <div className="group rounded-full border border-border/60 bg-muted/40 px-3.5 py-1 backdrop-blur-xs transition-colors">
            <AnimatedShinyText className="inline-flex items-center justify-center text-xs font-medium">
              <span>SDKs & CLIs</span>
            </AnimatedShinyText>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl bg-linear-to-b from-foreground via-foreground/90 to-foreground/45 bg-clip-text text-transparent">
            {t("title")}
          </h2>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            {t("subtitle")}
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
          {COMMANDS.map((item) => (
            <div
              key={item.lang}
              className="group relative flex flex-col justify-between gap-3 rounded-2xl border border-border/60 bg-card/70 p-4 shadow-xs backdrop-blur-xs transition-all duration-200 hover:border-primary/40 hover:bg-card/95"
            >
              {item.lang === "npm" && (
                <ShineBorder
                  shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
                  borderWidth={1}
                  duration={12}
                />
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-7 items-center justify-center rounded-lg border border-border/50 bg-muted/50 p-1">
                    <item.icon size={18} />
                  </div>
                  <span className="rounded-md border border-border/60 bg-muted/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {t(`labels.${item.lang}`)}
                  </span>
                </div>
                <span className="text-[11px] font-medium text-muted-foreground">
                  {item.tag}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 rounded-xl border border-border/40 bg-muted/40 px-3 py-2.5">
                <code className="truncate font-mono text-xs sm:text-sm text-foreground select-all">
                  {item.cmd}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(item.cmd, item.lang)}
                  className="size-7 shrink-0 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer transition-colors"
                  aria-label={t("copyLabel")}
                >
                  <HugeiconsIcon
                    icon={copied === item.lang ? Tick02Icon : Copy01Icon}
                    className={cn(
                      "size-3.5 transition-colors",
                      copied === item.lang ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
