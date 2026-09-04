import type { Metadata } from "next"
import Link from "next/link"
import { CreateCanisterCard } from "@/components/canister/create-canister-card"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://icpay.app"

export const metadata: Metadata = {
  title: "Create Canister — ICP via CMC | ICPay",
  description:
    "Create a new Internet Computer canister with ICP. Pay from your ICPay wallet, mint via the official CMC, pick a subnet, and set controllers.",
  keywords: [
    "create canister ICP",
    "notify_create_canister",
    "CMC create canister",
    "Internet Computer create canister",
    "ICPay create canister",
    "canister without dfx",
  ],
  alternates: { canonical: `${siteUrl}/canister/create` },
  openGraph: {
    title: "Create Canister — ICPay",
    description: "Create an ICP canister via the official Cycles Minting Canister.",
    url: `${siteUrl}/canister/create`,
    siteName: "ICPay",
    type: "website",
  },
}

export default function CreateCanisterPage() {
  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 md:px-6 md:py-14">
        <CreateCanisterCard />
        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Create a canister on the Internet Computer
          </h2>
          <p>
            ICPay calls the official Cycles Minting Canister (
            <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">
              notify_create_canister
            </code>
            ) from your browser. Your Internet Identity is the controller.
          </p>
          <p>
            Guide:{" "}
            <Link
              href="/blog/how-to-create-icp-canister"
              className="font-medium text-foreground underline underline-offset-2 hover:text-primary"
            >
              How to create an ICP canister
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  )
}
