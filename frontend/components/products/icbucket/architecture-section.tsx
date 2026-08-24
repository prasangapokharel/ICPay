"use client"

import { useEffect, useId, useRef, useState } from "react"
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

const UPLOAD_STEPS = [
  "Create a bucket once (pay ICP for capacity).",
  "beginFileUpload → send 2 MB chunks → completeFileUpload.",
  "Canister encrypts each file and writes to stable memory.",
]

const READ_STEPS = [
  "Private files: signed downloadFile query from your app.",
  "Public files: plain HTTPS GET on the canister gateway URL.",
  "No AWS bucket, no separate storage server — one on-chain canister.",
]

export function ArchitectureSection() {
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
    <section className="border-t bg-muted/30 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl space-y-10">
          <div className="space-y-3 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">How storage works</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Files live inside the ICPay wallet canister on Internet Computer — not on a
              traditional cloud VM. Your app talks to the canister; the subnet stores encrypted data.
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              Canister ID · {WALLET_CANISTER_ID}
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
                  aria-label="ICBucket architecture diagram"
                />
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card size="sm">
              <CardContent className="space-y-3 pt-6">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                  Write path
                </h3>
                <ol className="list-decimal space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
                  {UPLOAD_STEPS.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </CardContent>
            </Card>
            <Card size="sm">
              <CardContent className="space-y-3 pt-6">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                  Read path
                </h3>
                <ol className="list-decimal space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
                  {READ_STEPS.map((step) => (
                    <li key={step}>{step}</li>
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
