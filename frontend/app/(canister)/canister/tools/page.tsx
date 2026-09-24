import type { Metadata } from "next"
import { CanisterHub } from "@/components/canister/canister-hub"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://icpay.app"

export const metadata: Metadata = {
  title: "Canisters — Create, Manage, Cycles & Snapshots | ICPay",
  description:
    "Create Internet Computer canisters, manage status, mint cycles to the ledger, top up, and snapshot — from your ICPay wallet via official IC APIs. No dfx required.",
  keywords: [
    "create ICP canister",
    "manage canister ICP",
    "cycles ledger",
    "canister snapshot",
    "top up cycles",
    "ICPay canisters",
  ],
  alternates: { canonical: `${siteUrl}/canister/tools` },
  openGraph: {
    title: "Canister Tools — ICPay",
    description: "Create, manage, mint cycles, top up, and snapshot on the Internet Computer.",
    url: `${siteUrl}/canister/tools`,
    siteName: "ICPay",
    type: "website",
  },
}

export default function CanisterHubPage() {
  return <CanisterHub />
}
