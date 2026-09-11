import type { Metadata } from "next"
import Link from "next/link"
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
  return (
    <>
      <CanisterHub />
      <section className="border-b border-border/60 bg-background">
        <div className="mx-auto max-w-4xl space-y-3 px-4 pb-10 text-sm leading-relaxed text-muted-foreground md:px-6">
          <h2 className="text-base font-semibold tracking-tight text-foreground">Guides</h2>
          <ul className="space-y-1.5 pl-4">
            <li className="list-disc">
              <Link
                href="/blog/how-to-create-icp-canister"
                className="font-medium text-foreground underline underline-offset-2 hover:text-primary"
              >
                How to create an ICP canister
              </Link>
            </li>
            <li className="list-disc">
              <Link
                href="/blog/how-to-top-up-icp-cycles"
                className="font-medium text-foreground underline underline-offset-2 hover:text-primary"
              >
                How to top up ICP cycles
              </Link>
            </li>
            <li className="list-disc">
              <Link
                href="/blog/how-to-manage-icp-canister"
                className="font-medium text-foreground underline underline-offset-2 hover:text-primary"
              >
                How to manage an ICP canister
              </Link>
            </li>
            <li className="list-disc">
              <Link
                href="/blog/how-to-mint-cycles-ledger"
                className="font-medium text-foreground underline underline-offset-2 hover:text-primary"
              >
                How to mint cycles to the ledger
              </Link>
            </li>
            <li className="list-disc">
              <Link
                href="/blog/how-to-snapshot-icp-canister"
                className="font-medium text-foreground underline underline-offset-2 hover:text-primary"
              >
                How to snapshot an ICP canister
              </Link>
            </li>
            <li className="list-disc">
              <Link
                href="/blog/what-is-cycles-minting-canister"
                className="font-medium text-foreground underline underline-offset-2 hover:text-primary"
              >
                What is the Cycles Minting Canister
              </Link>
            </li>
            <li className="list-disc">
              <Link
                href="/blog/icp-canister-controllers-explained"
                className="font-medium text-foreground underline underline-offset-2 hover:text-primary"
              >
                Canister controllers explained
              </Link>
            </li>
            <li className="list-disc">
              <Link
                href="/blog/canister-out-of-cycles-fix"
                className="font-medium text-foreground underline underline-offset-2 hover:text-primary"
              >
                Canister out of cycles — how to fix
              </Link>
            </li>
          </ul>
        </div>
      </section>
    </>
  )
}
