import type { Metadata } from "next"
import Link from "next/link"
import { blogArticleJsonLd, blogCanonical } from "@/lib/blog/seo"

const SLUG = "what-is-cycles-minting-canister"
const TITLE = "What Is the Cycles Minting Canister (CMC)? | ICPay"
const DESCRIPTION =
  "The Cycles Minting Canister converts ICP into cycles, creates canisters, and tops them up. How CMC works, notify_create_canister, notify_top_up, and using it from ICPay."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "Cycles Minting Canister",
    "CMC ICP",
    "what is CMC",
    "notify_create_canister",
    "notify_top_up",
    "ICP to cycles",
    "rkp4c CMC",
    "ICPay CMC",
  ],
  alternates: { canonical: blogCanonical(SLUG) },
  openGraph: {
    title: "What Is the Cycles Minting Canister — ICPay Blog",
    description: DESCRIPTION,
    url: blogCanonical(SLUG),
    siteName: "ICPay",
    type: "article",
    publishedTime: "2026-09-05T12:00:00Z",
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
  readingMinutes: 9,
})

export default function WhatIsCmcPage() {
  return (
    <article className="space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-widest text-primary">Explainers</p>
        <h1 className="text-2xl font-bold leading-snug tracking-tight">
          What Is the Cycles Minting Canister (CMC)?
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The Cycles Minting Canister is the official Internet Computer service that turns ICP into
          cycles and allocates canisters. ICPay talks to CMC from your browser — create, top up, and
          mint — with no custom mint backend.
        </p>
        <p className="text-[11px] text-muted-foreground">September 5, 2026 · 9 min read</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">What CMC does</h2>
        <ul className="space-y-1.5 pl-4 text-sm text-muted-foreground">
          <li className="list-disc">
            <strong className="text-foreground">Create canisters</strong> via{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">notify_create_canister</code>
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Top up canisters</strong> via{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">notify_top_up</code>
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Mint cycles</strong> onto the cycles ledger via{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">notify_mint_cycles</code>
          </li>
          <li className="list-disc">
            Publish the live <strong className="text-foreground">ICP → XDR</strong> rate used for
            conversion
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">How a CMC call works</h2>
        <ol className="list-decimal space-y-2 pl-4 text-sm text-muted-foreground">
          <li className="list-decimal">
            Transfer ICP on the official ledger to CMC with the correct memo (create, top-up, or
            mint).
          </li>
          <li className="list-decimal">
            Call the matching notify method so CMC burns ICP and credits cycles / creates the
            canister.
          </li>
          <li className="list-decimal">
            Leftover value after fees becomes cycles (or a new canister ID for create).
          </li>
        </ol>
        <p className="rounded-xl bg-muted/40 px-4 py-3 text-sm leading-relaxed text-foreground">
          Create deducts a fixed <strong>500 billion cycle</strong> network fee. ICPay requires at
          least <strong>0.5 ICP</strong> so the estimate clears that fee at typical CMC rates.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">CMC vs ICPay wallet</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          ICPay holds your ICP custodially for everyday sends. Canister tools still settle through
          CMC and the ICP ledger from your Internet Identity when needed — same official path as
          NNS / dfx, just in the browser.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Use CMC on ICPay</h2>
        <ul className="space-y-1.5 pl-4 text-sm text-muted-foreground">
          <li className="list-disc">
            <Link href="/canister/create" className="underline underline-offset-2 hover:text-foreground">
              Create a canister
            </Link>
          </li>
          <li className="list-disc">
            <Link href="/topup" className="underline underline-offset-2 hover:text-foreground">
              Top up cycles
            </Link>
          </li>
          <li className="list-disc">
            <Link href="/canister/cycles" className="underline underline-offset-2 hover:text-foreground">
              Mint to the cycles ledger
            </Link>
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Related reading</h2>
        <ul className="space-y-1.5 pl-4 text-sm text-muted-foreground">
          <li className="list-disc">
            <Link
              href="/blog/how-to-create-icp-canister"
              className="underline underline-offset-2 hover:text-foreground"
            >
              How to create an ICP canister
            </Link>
          </li>
          <li className="list-disc">
            <Link
              href="/blog/how-to-top-up-icp-cycles"
              className="underline underline-offset-2 hover:text-foreground"
            >
              How to top up ICP cycles
            </Link>
          </li>
          <li className="list-disc">
            <Link
              href="/blog/icp-cycles-explained"
              className="underline underline-offset-2 hover:text-foreground"
            >
              ICP cycles explained
            </Link>
          </li>
        </ul>
      </section>
    </article>
  )
}
