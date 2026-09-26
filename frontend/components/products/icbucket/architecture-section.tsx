"use client"

import { useRef } from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import {
  Globe,
  Terminal,
  Lock,
  Database,
  Cloud,
} from "lucide-react"
import { Nodejs, Python, Go } from "@dev.icons/react"
import { Card, CardContent } from "@/components/ui/card"
import { AnimatedBeam } from "@/components/ui/animated-beam"
import { APP_LOGO } from "@/lib/ui/brand-images"

const UPLOAD_STEP_IDS = ["0", "1", "2"] as const
const READ_STEP_IDS = ["0", "1", "2"] as const

export function ArchitectureSection() {
  const t = useTranslations("publicSite.icbucket.architecture")

  // Container & node refs for AnimatedBeam
  const containerRef = useRef<HTMLDivElement>(null)
  const browserRef = useRef<HTMLDivElement>(null)
  const sdkRef = useRef<HTMLDivElement>(null)
  const ciRef = useRef<HTMLDivElement>(null)
  const canisterRef = useRef<HTMLDivElement>(null)
  const uploadRef = useRef<HTMLDivElement>(null)
  const memoryRef = useRef<HTMLDivElement>(null)
  const httpRef = useRef<HTMLDivElement>(null)

  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20 space-y-10">
        <div className="space-y-3 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl bg-linear-to-b from-foreground via-foreground/90 to-foreground/45 bg-clip-text text-transparent md:text-5xl">
            {t("title")}
          </h2>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            {t("subtitle")}
          </p>
        </div>

        {/* Animated Architecture Topology Card */}
        <Card className="relative overflow-hidden rounded-2xl  bg-background">
          {/* Card Top Status Bar */}


          <CardContent className="p-0">
            {/* Scrollable Canvas Container */}
            <div className="w-full overflow-x-auto">
              <div
                ref={containerRef}
                className="relative mx-auto flex min-w-[700px] max-w-4xl items-center justify-between gap-6 px-8 py-14 md:py-20"
              >
                {/* Background Ambient Radial Glow */}
                <div className="pointer-events-none absolute inset-0 -z-10 bg-radial from-primary/5 via-transparent to-transparent opacity-70" />

                {/* Animated Beams: Client Inputs → Canister Hub */}
                <AnimatedBeam
                  containerRef={containerRef}
                  fromRef={browserRef}
                  toRef={canisterRef}
                  curvature={-32}
                  duration={4}
                  delay={0}
                  gradientStartColor="#ec4899"
                  gradientStopColor="#a855f7"
                  pathColor="#52525b"
                  pathOpacity={0.25}
                  pathWidth={2}
                />
                <AnimatedBeam
                  containerRef={containerRef}
                  fromRef={sdkRef}
                  toRef={canisterRef}
                  curvature={0}
                  duration={4}
                  delay={0.8}
                  gradientStartColor="#ec4899"
                  gradientStopColor="#a855f7"
                  pathColor="#52525b"
                  pathOpacity={0.25}
                  pathWidth={2}
                />
                <AnimatedBeam
                  containerRef={containerRef}
                  fromRef={ciRef}
                  toRef={canisterRef}
                  curvature={32}
                  duration={4}
                  delay={1.6}
                  gradientStartColor="#ec4899"
                  gradientStopColor="#a855f7"
                  pathColor="#52525b"
                  pathOpacity={0.25}
                  pathWidth={2}
                />

                {/* Animated Beams: Canister Hub → Storage & CDN */}
                <AnimatedBeam
                  containerRef={containerRef}
                  fromRef={canisterRef}
                  toRef={uploadRef}
                  curvature={-32}
                  duration={4}
                  delay={0.4}
                  gradientStartColor="#a855f7"
                  gradientStopColor="#06b6d4"
                  pathColor="#52525b"
                  pathOpacity={0.25}
                  pathWidth={2}
                />
                <AnimatedBeam
                  containerRef={containerRef}
                  fromRef={canisterRef}
                  toRef={memoryRef}
                  curvature={0}
                  duration={4}
                  delay={1.2}
                  gradientStartColor="#a855f7"
                  gradientStopColor="#06b6d4"
                  pathColor="#52525b"
                  pathOpacity={0.25}
                  pathWidth={2}
                />
                <AnimatedBeam
                  containerRef={containerRef}
                  fromRef={canisterRef}
                  toRef={httpRef}
                  curvature={32}
                  duration={4}
                  delay={2}
                  gradientStartColor="#a855f7"
                  gradientStopColor="#06b6d4"
                  pathColor="#52525b"
                  pathOpacity={0.25}
                  pathWidth={2}
                />

                {/* Column 1: Client Apps & Integrations */}
                <div className="flex flex-col items-center gap-8">
                  <span className="rounded-full border border-border/60 bg-muted/40 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Your Application
                  </span>

                  <div className="flex flex-col items-center gap-7">
                    {/* Node 1: Browser */}
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div
                        ref={browserRef}
                        className="z-10 flex size-12 items-center justify-center rounded-2xl border border-border/80 bg-card/95 shadow-md backdrop-blur-md transition-all duration-200 hover:border-primary/50 hover:shadow-primary/10"
                      >
                        <Globe className="size-5 text-primary" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-foreground">Browser App</p>
                        <span className="inline-block rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                          Internet Identity
                        </span>
                      </div>
                    </div>

                    {/* Node 2: SDKs */}
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div
                        ref={sdkRef}
                        className="z-10 flex size-12 items-center justify-center gap-1 rounded-2xl border border-border/80 bg-card/95 px-1.5 shadow-md backdrop-blur-md transition-all duration-200 hover:border-primary/50 hover:shadow-primary/10"
                      >
                        <Nodejs size={14} />
                        <Python size={14} />
                        <Go size={14} />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-foreground">Client SDKs</p>
                        <span className="inline-block rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                          Agent + API Key
                        </span>
                      </div>
                    </div>

                    {/* Node 3: CI / Automation */}
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div
                        ref={ciRef}
                        className="z-10 flex size-12 items-center justify-center rounded-2xl border border-border/80 bg-card/95 shadow-md backdrop-blur-md transition-all duration-200 hover:border-primary/50 hover:shadow-primary/10"
                      >
                        <Terminal className="size-5 text-foreground" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-foreground">CI & Automation</p>
                        <span className="inline-block rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                          Signed Updates
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2: On-Chain Core Canister Hub */}
                <div className="flex flex-col items-center gap-8">
                  <span className="rounded-full border border-border/60 bg-muted/40 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Internet Computer
                  </span>

                  <div className="relative flex flex-col items-center gap-3 text-center">
                    <div className="pointer-events-none absolute -inset-6 rounded-full bg-primary/15 blur-2xl" />
                    <div
                      ref={canisterRef}
                      className="z-10 flex size-24 items-center justify-center rounded-3xl border-2 border-primary/50 bg-card/95 p-3 shadow-2xl backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-primary"
                    >
                      <Image
                        src={APP_LOGO}
                        alt="ICPay Canister"
                        width={48}
                        height={48}
                        className="size-12 rounded-2xl object-contain drop-shadow"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="relative flex size-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                        </span>
                        <p className="text-xs font-bold text-foreground">
                          ICPay Bucket Canister
                        </p>
                      </div>
                      <p className="font-mono text-[11px] text-muted-foreground">
                        Motoko Bucket Engine
                      </p>
                      <span className="inline-block rounded-md border border-border/60 bg-muted/60 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                        Subaccount Isolated
                      </span>
                    </div>
                  </div>
                </div>

                {/* Column 3: Storage & Delivery */}
                <div className="flex flex-col items-center gap-8">
                  <span className="rounded-full border border-border/60 bg-muted/40 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Storage & Delivery
                  </span>

                  <div className="flex flex-col items-center gap-7">
                    {/* Node 4: Upload Session */}
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div
                        ref={uploadRef}
                        className="z-10 flex size-12 items-center justify-center rounded-2xl border border-border/80 bg-card/95 shadow-md backdrop-blur-md transition-all duration-200 hover:border-primary/50 hover:shadow-primary/10"
                      >
                        <Lock className="size-5 text-amber-500" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-foreground">Upload Session</p>
                        <span className="inline-block rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                          Chunk → Encrypt
                        </span>
                      </div>
                    </div>

                    {/* Node 5: Stable Memory */}
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div
                        ref={memoryRef}
                        className="z-10 flex size-12 items-center justify-center rounded-2xl border border-border/80 bg-card/95 shadow-md backdrop-blur-md transition-all duration-200 hover:border-primary/50 hover:shadow-primary/10"
                      >
                        <Database className="size-5 text-cyan-400" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-foreground">Stable Memory</p>
                        <span className="inline-block rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                          Encrypted Blobs
                        </span>
                      </div>
                    </div>

                    {/* Node 6: HTTPS CDN */}
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div
                        ref={httpRef}
                        className="z-10 flex size-12 items-center justify-center rounded-2xl border border-border/80 bg-card/95 shadow-md backdrop-blur-md transition-all duration-200 hover:border-primary/50 hover:shadow-primary/10"
                      >
                        <Cloud className="size-5 text-blue-400" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-foreground">HTTPS Gateway</p>
                        <span className="inline-block rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                          *.raw.icp0.io · CDN
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step-by-Step Technical Path Details */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card size="sm" className="rounded-2xl border-border/60 bg-card shadow-sm">
            <CardContent className="space-y-3 pt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                {t("writePath")}
              </h3>
              <ol className="list-decimal space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
                {UPLOAD_STEP_IDS.map((id) => (
                  <li key={id}>{t(`uploadSteps.${id}`)}</li>
                ))}
              </ol>
            </CardContent>
          </Card>
          <Card size="sm" className="rounded-2xl border-border/60 bg-card shadow-sm">
            <CardContent className="space-y-3 pt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                {t("readPath")}
              </h3>
              <ol className="list-decimal space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
                {READ_STEP_IDS.map((id) => (
                  <li key={id}>{t(`readSteps.${id}`)}</li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
