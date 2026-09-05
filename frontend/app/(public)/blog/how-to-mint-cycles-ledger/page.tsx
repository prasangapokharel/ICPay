import type { Metadata } from "next"
import Link from "next/link"
import { blogArticleJsonLd, blogCanonical } from "@/lib/blog/seo"

const SLUG = "how-to-mint-cycles-ledger"
const TITLE = "How to Mint Cycles to the Cycles Ledger | ICPay"
const DESCRIPTION =
  "Mint ICP into cycles on the cycles ledger with notify_mint_cycles, then withdraw to any canister. Browser flow with Internet Identity — ICPay cycles wallet guide."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "cycles ledger",
    "notify_mint_cycles",
    "mint cycles ICP",
    "withdraw cycles to canister",
    "CMC mint cycles",
    "um5iw cycles ledger",
    "ICPay cycles wallet",
    "hold cycles without canister",
  ],
  alternates: { canonical: blogCanonical(SLUG) },
  openGraph: {
    title: "How to Mint Cycles to the Cycles Ledger — ICPay Blog",
    description: DESCRIPTION,
    url: blogCanonical(SLUG),
    siteName: "ICPay",
    type: "article",
    publishedTime: "2026-09-05T00:00:00Z",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
}

const jsonLd = blogArticleJsonLd({
  slug: SLUG,
  title: TITLE,
  description: DESCRIPTION,
  publishedAt: "2026-09-05",
  readingMinutes: 8,
})

export default function HowToMintCyclesLedgerPage() {
  return (
    <article className="space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-widest text-primary">How-to</p>
        <h1 className="text-2xl font-bold leading-snug tracking-tight">
          How to Mint Cycles to the Cycles Ledger
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Top-up sends cycles straight into a canister. Minting deposits cycles onto the{" "}
          <strong className="text-foreground">cycles ledger</strong> under your principal — like a
          prepaid balance you can later withdraw into any canister ID.
        </p>
        <p className="text-[11px] text-muted-foreground">September 5, 2026 · 8 min read</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Mint vs top-up</h2>
        <ul className="space-y-1.5 pl-4 text-sm text-muted-foreground">
          <li className="list-disc">
            <strong className="text-foreground">Top up</strong> — ICP → CMC → cycles in a target
            canister (<code className="rounded bg-muted px-1 py-0.5 text-xs">notify_top_up</code>).
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Mint</strong> — ICP → CMC → cycles on the cycles
            ledger for you (
            <code className="rounded bg-muted px-1 py-0.5 text-xs">notify_mint_cycles</code>).
          </li>
        </ul>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Use mint when you want a reusable cycles balance; use{" "}
          <Link href="/topup" className="underline underline-offset-2 hover:text-foreground">
            top up
          </Link>{" "}
          when one canister needs fuel now.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Step-by-step on ICPay</h2>
        <ol className="list-decimal space-y-2 pl-4 text-sm text-muted-foreground">
          <li className="list-decimal">
            Open{" "}
            <Link href="/canister/cycles" className="underline underline-offset-2 hover:text-foreground">
              icpay.app/canister/cycles
            </Link>{" "}
            and sign in.
          </li>
          <li className="list-decimal">
            On <strong className="text-foreground">Mint</strong>, enter ICP. ICPay covers shortfall
            from your wallet, transfers with the MINT memo, then notifies the CMC.
          </li>
          <li className="list-decimal">
            Check the preview for your cycles ledger balance.
          </li>
          <li className="list-decimal">
            On <strong className="text-foreground">Withdraw</strong>, pick a canister (or{" "}
            <strong className="text-foreground">Mine</strong>) and an amount in T cycles to deposit.
          </li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Fees and rate</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Conversion follows the CMC ICP→XDR rate (same family as top-up). Ledger ICP transfer fees
          apply; ICPay shows a live estimate before you mint. Details in{" "}
          <Link href="/blog/icp-cycles-explained" className="underline underline-offset-2 hover:text-foreground">
            ICP cycles explained
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Related reading</h2>
        <ul className="space-y-1.5 pl-4 text-sm text-muted-foreground">
          <li className="list-disc">
            <Link href="/blog/how-to-top-up-icp-cycles" className="underline underline-offset-2 hover:text-foreground">
              How to top up ICP cycles
            </Link>
          </li>
          <li className="list-disc">
            <Link href="/blog/icp-reverse-gas-model" className="underline underline-offset-2 hover:text-foreground">
              ICP reverse gas model
            </Link>
          </li>
          <li className="list-disc">
            <Link href="/blog/how-to-create-icp-canister" className="underline underline-offset-2 hover:text-foreground">
              How to create an ICP canister
            </Link>
          </li>
        </ul>
      </section>
    </article>
  )
}
