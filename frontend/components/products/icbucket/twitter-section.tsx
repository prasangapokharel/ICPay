"use client"

import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"

export function TwitterSection() {
  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://platform.x.com/widgets.js"
    script.async = true
    script.charset = "utf-8"
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  return (
    <section className="border-t py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Latest from ICPay
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Follow our journey building on-chain storage for the Internet Computer
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <blockquote className="twitter-tweet" data-theme="light">
                  <p lang="en" dir="ltr">
                    Introducing ICPay Bucket
                    <br />
                    <br />
                    Fast, secure, and fully on-chain storage built directly on the Internet
                    Computer.
                    <br />
                    <br />
                    With ICPay Bucket, you can store your files on-chain and serve them through a
                    dedicated CDN — without relying on traditional centralized object storage.
                    <br />
                    <br />
                    ✨ What&apos;s…{" "}
                    <a href="https://t.co/b4qPAtQ4zg">pic.twitter.com/b4qPAtQ4zg</a>
                  </p>
                  &mdash; Icpay (@IcpayOfficial){" "}
                  <a href="https://x.com/IcpayOfficial/status/2087599956337262864?ref_src=twsrc%5Etfw">
                    August 12, 2026
                  </a>
                </blockquote>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <blockquote className="twitter-tweet" data-theme="light">
                  <p lang="en" dir="ltr">
                    ICPay Cloud API keys are live.
                    <br />
                    <br />
                    Automate uploads to the Internet Computer — no wallet session, no manual
                    clicks.
                    <br />
                    <br />
                    icp_cloud_* keys · scoped per bucket · Write / Delete permissions · revoke
                    anytime · secret shown once
                    <br />
                    <br />
                    Why it matters <br />
                    <br />→ CI/CD deploys assets straight to on-chain…{" "}
                    <a href="https://t.co/9sEXdOSeUe">pic.twitter.com/9sEXdOSeUe</a>
                  </p>
                  &mdash; Icpay (@IcpayOfficial){" "}
                  <a href="https://x.com/IcpayOfficial/status/2087727478622302477?ref_src=twsrc%5Etfw">
                    August 13, 2026
                  </a>
                </blockquote>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <blockquote className="twitter-tweet" data-theme="light">
                  <p lang="en" dir="ltr">
                    Centralized storage vs. on-chain storage.
                    <br />
                    <br />
                    ICPay Bucket brings file storage directly to the Internet Computer.
                    <br />
                    <br />
                    • Encrypted storage per bucket
                    <br />
                    • Public or private access
                    <br />
                    • Clean CDN links
                    <br />
                    • Pay in ICP with 30-day plans
                    <br />
                    • Scoped API keys for automation
                    <br />• Built on on-chain…{" "}
                    <a href="https://t.co/tkFsS458Ov">pic.twitter.com/tkFsS458Ov</a>
                  </p>
                  &mdash; Icpay (@IcpayOfficial){" "}
                  <a href="https://x.com/IcpayOfficial/status/2088088717445747033?ref_src=twsrc%5Etfw">
                    August 14, 2026
                  </a>
                </blockquote>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
