import type { Metadata } from "next"
import { PublicTokenCreate } from "@/components/launch/public-token-create"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://icpay.app"

export const metadata: Metadata = {
  title: "Create Token",
  description:
    "Launch an ICRC-1 token on the Internet Computer with ICPay. Set name, symbol, supply, and logo — no presale, no team allocation.",
  keywords: [
    "create ICP token",
    "launch ICRC-1 token",
    "Internet Computer token",
    "ICP token launch",
    "create crypto token",
    "ICPay launch",
  ],
  alternates: { canonical: "/token/create" },
  openGraph: {
    title: "Create Token — ICPay",
    description:
      "Launch an ICRC-1 token on the Internet Computer. Name it, fund it, and hand it over in one step.",
    url: `${siteUrl}/token/create`,
    siteName: "ICPay",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Create Token — ICPay",
    description:
      "Launch an ICRC-1 token on the Internet Computer with ICPay.",
  },
}

export default function PublicTokenCreatePage() {
  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto flex w-full max-w-3xl flex-col px-4 py-10 md:px-6 md:py-14">
        <PublicTokenCreate />
      </div>
    </section>
  )
}
