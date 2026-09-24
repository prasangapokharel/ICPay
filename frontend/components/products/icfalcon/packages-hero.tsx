"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useTheme } from "next-themes"
import { PAGE_IMAGES } from "@/lib/public/page-images"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Copy01Icon,
  Tick02Icon,
  Package01Icon,
  CommandLineIcon,
  CodeCircleIcon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Particles } from "@/components/ui/particles"
import { ShineBorder } from "@/components/ui/shine-border"
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text"

export function PackagesHero() {
  const { resolvedTheme } = useTheme()
  const [copied, setCopied] = useState(false)
  const color = resolvedTheme === "dark" ? "#ffffff" : "#000000"
  const command = "falcon add pkg <slug>"

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden border-b border-border/60 bg-background px-4 py-16 text-center">
      <Particles
        className="absolute inset-0 z-0"
        quantity={90}
        ease={80}
        color={color}
        refresh
      />

      <div className="relative z-10 mx-auto max-w-3xl space-y-6">
        <div className="flex justify-center">
          <Link
            href="/products/icFalcon"
            className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-card/60 p-2.5 shadow-sm backdrop-blur-xs transition-all hover:border-primary/40 hover:bg-card hover:shadow-md"
          >
            <div className="relative flex size-14 items-center justify-center overflow-hidden rounded-xl border border-border/40 bg-background/80 p-1 shadow-xs">
              <Image
                src={PAGE_IMAGES.icfalcon.hero}
                alt="ICFalcon"
                width={56}
                height={56}
                priority
                className="size-12 rounded-lg object-contain transition-transform duration-300 group-hover:scale-105"
                style={{ width: "auto", height: "auto" }}
              />
            </div>
            <div className="text-left pr-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground text-lg sm:text-xl">
                  Falcon Packages
                </span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  ICP-Hub
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Official Motoko Package Registry</p>
            </div>
          </Link>
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center justify-center">
            <div className="group rounded-full border border-border/60 bg-muted/40 px-3.5 py-1 backdrop-blur-xs transition-colors">
              <AnimatedShinyText className="inline-flex items-center justify-center text-xs font-medium">
                <span>⚡ Production-Ready Motoko Architecture</span>
              </AnimatedShinyText>
            </div>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl bg-linear-to-b from-foreground via-foreground/90 to-foreground/45 bg-clip-text text-transparent">
            Explore & Install Motoko Packages
          </h1>
          <p className="mx-auto max-w-xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            Modular, layered, and tested Motoko packages for your Internet Computer canisters. Install in seconds with the global Falcon CLI.
          </p>
        </div>

        <div className="mx-auto flex flex-col items-center space-y-3 pt-2">
          <div className="relative mx-auto flex w-full max-w-md items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/80 px-4 py-2.5 shadow-sm backdrop-blur-xs">
            <ShineBorder
              shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
              borderWidth={1.2}
              duration={10}
            />
            <span className="font-mono text-xs sm:text-sm text-foreground select-all tracking-tight font-medium">
              {command}
            </span>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={handleCopy}
              className="size-7 shrink-0 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer transition-colors"
              aria-label="Copy command"
            >
              <HugeiconsIcon
                icon={copied ? Tick02Icon : Copy01Icon}
                className={`size-4 transition-colors ${copied ? "text-primary" : "text-muted-foreground"}`}
              />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Replace <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground font-medium">&lt;slug&gt;</code> with any package name below
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-full px-4 text-xs hover:border-primary/40 hover:bg-primary/5 transition-all"
            nativeButton={false}
            render={
              <Link href="/products/icFalcon">
                <HugeiconsIcon icon={Package01Icon} className="size-3.5 text-primary" />
                <span>ICFalcon Framework</span>
              </Link>
            }
          />
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-full px-4 text-xs hover:border-primary/40 hover:bg-primary/5 transition-all"
            nativeButton={false}
            render={
              <Link href="/products/icFalcon/commands">
                <HugeiconsIcon icon={CommandLineIcon} className="size-3.5 text-primary" />
                <span>CLI Commands</span>
              </Link>
            }
          />
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-full px-4 text-xs hover:border-primary/40 hover:bg-primary/5 transition-all"
            nativeButton={false}
            render={
              <Link
                href="https://github.com/prasangapokharel/icp-hub"
                target="_blank"
                rel="noopener noreferrer"
              >
                <HugeiconsIcon icon={CodeCircleIcon} className="size-3.5 text-primary" />
                <span>icp-hub GitHub</span>
              </Link>
            }
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 max-w-2xl mx-auto w-full">
          <div className="rounded-xl border border-border/50 bg-card/40 p-3 text-center backdrop-blur-xs">
            <p className="text-xl font-extrabold text-foreground tracking-tight">62+</p>
            <p className="text-[11px] text-muted-foreground font-medium">Motoko Packages</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-card/40 p-3 text-center backdrop-blur-xs">
            <p className="text-xl font-extrabold text-foreground tracking-tight">100%</p>
            <p className="text-[11px] text-muted-foreground font-medium">Tested & Typed</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-card/40 p-3 text-center backdrop-blur-xs">
            <p className="text-xl font-extrabold text-foreground tracking-tight">Zero</p>
            <p className="text-[11px] text-muted-foreground font-medium">Config Overhead</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-card/40 p-3 text-center backdrop-blur-xs">
            <p className="text-xl font-extrabold text-foreground tracking-tight">MIT / Apache</p>
            <p className="text-[11px] text-muted-foreground font-medium">Open Registry</p>
          </div>
        </div>
      </div>
    </section>
  )
}
