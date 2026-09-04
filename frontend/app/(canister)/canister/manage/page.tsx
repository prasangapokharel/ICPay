import type { Metadata } from "next"
import Link from "next/link"
import { ManageCanisterCard } from "@/components/canister/manage-canister-card"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://icpay.app"

export const metadata: Metadata = {
  title: "Manage Canister — Status, Start & Stop | ICPay",
  description:
    "Live canister status, start/stop, and logs when your Internet Identity is a controller. Frontend-only via the IC management canister.",
  keywords: [
    "canister status",
    "start canister",
    "stop canister",
    "IC management canister",
    "ICPay manage canister",
    "canister_status",
  ],
  alternates: { canonical: `${siteUrl}/canister/manage` },
  openGraph: {
    title: "Manage Canister — ICPay",
    description: "Live status and controller actions for your ICP canister.",
    url: `${siteUrl}/canister/manage`,
    siteName: "ICPay",
    type: "website",
  },
}

export default function ManageCanisterPage() {
  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 md:px-6 md:py-14">
        <ManageCanisterCard />
        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Manage canisters you control
          </h2>
          <p>
            Status, start/stop, and logs require your Internet Identity to be a controller of the
            canister ID you paste.
          </p>
          <p>
            Guide:{" "}
            <Link
              href="/blog/how-to-manage-icp-canister"
              className="font-medium text-foreground underline underline-offset-2 hover:text-primary"
            >
              How to manage an ICP canister
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  )
}
