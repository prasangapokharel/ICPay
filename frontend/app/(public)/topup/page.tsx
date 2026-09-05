import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { CyclesTopUpCard } from "@/components/cycles/cycles-topup-card"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://icpay.app"

export const metadata: Metadata = {
  title: "Top Up ICP Cycles — Canister Cycles via CMC | ICPay",
  description:
    "Top up Internet Computer canister cycles with ICP. Convert ICP to cycles at the official CMC rate, paste any canister ID, and mint cycles from your ICPay wallet.",
  keywords: [
    "top up ICP cycles",
    "top up canister cycles",
    "ICP cycles top up",
    "Internet Computer cycles",
    "canister cycles",
    "CMC cycles",
    "Cycles Minting Canister",
    "convert ICP to cycles",
    "mint cycles ICP",
    "ICPay cycles",
    "ICP reverse gas",
    "canister fuel",
    "dfinity cycles top up",
    "NNS cycles",
    "IC dashboard cycles",
  ],
  alternates: { canonical: `${siteUrl}/topup` },
  openGraph: {
    title: "Top Up ICP Cycles — ICPay",
    description:
      "Paste a canister ID, pay with ICP from your ICPay wallet, and mint cycles via the official Cycles Minting Canister.",
    url: `${siteUrl}/topup`,
    siteName: "ICPay",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Top Up ICP Cycles — ICPay",
    description:
      "Convert ICP to canister cycles at the CMC rate. Top up any Internet Computer canister from ICPay.",
    creator: "@IcpayOfficial",
  },
}

export default function PublicTopUpPage() {
  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 md:px-6 md:py-14">
        <Suspense fallback={null}>
          <CyclesTopUpCard />
        </Suspense>

        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Top up canister cycles on the Internet Computer
          </h2>
          <p>
            Every canister on ICP burns cycles for compute and storage. When the balance hits
            zero, the canister freezes. ICPay converts ICP to cycles through the official{" "}
            <strong className="font-medium text-foreground">Cycles Minting Canister (CMC)</strong>{" "}
            and credits any canister ID you paste — paid from your ICPay wallet with Internet
            Identity.
          </p>
          <p>
            New to cycles? Read our guide:{" "}
            <Link
              href="/blog/how-to-top-up-icp-cycles"
              className="font-medium text-foreground underline underline-offset-2 hover:text-primary"
            >
              How to top up ICP cycles
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  )
}
