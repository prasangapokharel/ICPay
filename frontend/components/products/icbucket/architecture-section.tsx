"use client"

import { useEffect, useId, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { WALLET_CANISTER_ID } from "@/services/icp"

const ARCHITECTURE_DIAGRAM = `flowchart TB
  subgraph clients["Your app"]
    web["Browser · icpay.app"]
    sdk["SDKs · Node / Python / Go"]
    script["CI · backend job"]
  end

  subgraph ic["Internet Computer"]
    canister["ICPay wallet canister\\nMotoko bucket API"]
    upload["Upload session\\nchunk → encrypt"]
    memory[("Stable memory\\nencrypted blobs")]
    http["HTTPS asset path\\n*.raw.icp0.io/cloud/…"]
  end

  users["Anyone with the link"]

  web -->|"Internet Identity"| canister
  sdk -->|"agent + API key"| canister
  script -->|"signed update calls"| canister
  canister --> upload
  upload --> memory
  memory --> canister
  canister --> http
  http --> users

  classDef client fill:#fdf2f8,stroke:#db2777,stroke-width:1px
  classDef core fill:#f0f9ff,stroke:#0284c7,stroke-width:1px
  classDef store fill:#f0fdf4,stroke:#16a34a,stroke-width:1px
  class web,sdk,script client
  class canister,upload,http core
  class memory store`

const UPLOAD_STEP_IDS = ["0", "1", "2"] as const
const READ_STEP_IDS = ["0", "1", "2"] as const

export function ArchitectureSection() {
  const t = useTranslations("publicSite.icbucket.architecture")
  const rootId = useId().replace(/:/g, "")
  const hostRef = useRef<HTMLDivElement>(null)
  const [renderError, setRenderError] = useState(false)

  useEffect(() => {
    let cancelled = false
    const host = hostRef.current
    if (!host) return

    void (async () => {
      try {
        const mermaid = (await import("mermaid")).default
        mermaid.initialize({
          startOnLoad: false,
          theme: "neutral",
          securityLevel: "loose",
          flowchart: { curve: "basis", padding: 16 },
        })
        const { svg } = await mermaid.render(`icbucket-arch-${rootId}`, ARCHITECTURE_DIAGRAM)
        if (!cancelled) {
          host.innerHTML = svg
          setRenderError(false)
        }
      } catch {
        if (!cancelled) setRenderError(true)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [rootId])

  return (
    <section className="border-b border-border/60 bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl space-y-10">
          <div className="space-y-3 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">{t("subtitle")}</p>
            <p className="font-mono text-xs text-muted-foreground">
              {t("canisterId", { canisterId: WALLET_CANISTER_ID })}
            </p>
          </div>

          <Card className="overflow-hidden">
            <CardContent className="p-4 md:p-6">
              {renderError ? (
                <pre className="overflow-x-auto rounded-lg bg-muted/50 p-4 text-xs leading-relaxed">
                  {ARCHITECTURE_DIAGRAM}
                </pre>
              ) : (
                <div
                  ref={hostRef}
                  className="flex justify-center overflow-x-auto [&_svg]:max-w-full [&_svg]:h-auto"
                  aria-label={t("diagramAriaLabel")}
                />
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card size="sm">
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
            <Card size="sm">
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
      </div>
    </section>
  )
}
