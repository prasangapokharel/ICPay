"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import Image from "next/image"
import { PAGE_IMAGES } from "@/lib/public/page-images"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function HeroSection() {
  const t = useTranslations("publicSite.icfalcon.hero")
  const [copied, setCopied] = useState(false)
  const command = "npm create icfalcon@latest my-app"

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="flex min-h-[80vh] flex-col items-center justify-center border-b border-border/60 bg-background px-4 py-16 text-center">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex justify-center">
          <Image
            src={PAGE_IMAGES.icfalcon.hero}
            alt={t("imageAlt")}
            title={t("imageAlt")}
            width={280}
            height={280}
            priority
            className="w-[280px] rounded-2xl"
            style={{ height: "auto" }}
          />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            {t("title")}
          </h1>
          <p className="text-xl text-muted-foreground sm:text-2xl">{t("subtitle")}</p>
          <p className="text-base text-muted-foreground">{t("features")}</p>
        </div>

        <div className="mx-auto max-w-2xl space-y-3">
          <p className="text-sm font-semibold">{t("installLabel")}</p>
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
              aria-label={t("copyCommand")}
            >
              <HugeiconsIcon
                icon={copied ? Tick02Icon : Copy01Icon}
                className={`size-5 ${copied ? "text-primary" : "text-muted-foreground"}`}
              />
            </button>
          </div>
          <p className="text-xs text-muted-foreground">{t("installHint")}</p>
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
            {t("npm")}
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
            {t("github")}
          </Button>
          <Button
            variant="outline"
            size="lg"
            nativeButton={false}
            render={<Link href="/products/icFalcon/packages" />}
          >
            {t("packages")}
          </Button>
        </div>
      </div>
    </section>
  )
}
