import type { Metadata } from "next"
import Link from "next/link"
import { SnapshotsCard } from "@/components/canister/snapshots-card"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://icpay.app"

export const metadata: Metadata = {
  title: "Canister Snapshots — Take, Load & Delete | ICPay",
  description:
    "List, take, load, and delete canister snapshots when your Internet Identity is a controller.",
  keywords: [
    "canister snapshot",
    "take_canister_snapshot",
    "load_canister_snapshot",
    "ICPay snapshots",
  ],
  alternates: { canonical: `${siteUrl}/canister/snapshots` },
  openGraph: {
    title: "Canister Snapshots — ICPay",
    description: "Controller-only snapshot tools for Internet Computer canisters.",
    url: `${siteUrl}/canister/snapshots`,
    siteName: "ICPay",
    type: "website",
  },
}

export default function SnapshotsPage() {
  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 md:px-6 md:py-14">
        <SnapshotsCard />
        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Canister snapshots
          </h2>
          <p>
            Snapshots back up Wasm and state. Loading replaces the current canister state — confirm
            before you restore.
          </p>
          <p>
            Guide:{" "}
            <Link
              href="/blog/how-to-snapshot-icp-canister"
              className="font-medium text-foreground underline underline-offset-2 hover:text-primary"
            >
              How to snapshot an ICP canister
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  )
}
