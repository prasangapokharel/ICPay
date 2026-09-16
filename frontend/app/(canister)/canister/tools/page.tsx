import type { Metadata } from "next"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Book02Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
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

const guides = [
  {
    href: "/blog/how-to-create-icp-canister",
    label: "How to create an ICP canister",
  },
  {
    href: "/blog/how-to-top-up-icp-cycles",
    label: "How to top up ICP cycles",
  },
  {
    href: "/blog/how-to-manage-icp-canister",
    label: "How to manage an ICP canister",
  },
  {
    href: "/blog/how-to-mint-cycles-ledger",
    label: "How to mint cycles to the ledger",
  },
  {
    href: "/blog/how-to-snapshot-icp-canister",
    label: "How to snapshot an ICP canister",
  },
  {
    href: "/blog/what-is-cycles-minting-canister",
    label: "What is the Cycles Minting Canister",
  },
  {
    href: "/blog/icp-canister-controllers-explained",
    label: "Canister controllers explained",
  },
  {
    href: "/blog/canister-out-of-cycles-fix",
    label: "Canister out of cycles — how to fix",
  },
] as const

export default function CanisterHubPage() {
  return (
    <>
      <CanisterHub />
      <section className="border-b border-border/60 bg-background">
        <div className="mx-auto max-w-4xl px-4 py-10 md:px-6 md:py-14">
          <div className="mb-6 flex flex-col gap-1">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Developer Guides
            </h2>
            <p className="text-sm text-muted-foreground">
              Step-by-step guides for canister creation, cycle management, and controller operations.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {guides.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/60 p-3.5 text-sm transition-all hover:border-primary/40 hover:bg-card"
              >
                <div className="flex items-center gap-2.5">
                  <HugeiconsIcon
                    icon={Book02Icon}
                    className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                  />
                  <span className="font-medium text-foreground">{label}</span>
                </div>
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  className="size-4 shrink-0 text-muted-foreground opacity-60 transition-all group-hover:translate-x-0.5 group-hover:text-primary group-hover:opacity-100"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

