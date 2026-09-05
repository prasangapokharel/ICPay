import type { Metadata } from "next"
import Link from "next/link"
import { blogArticleJsonLd, blogCanonical } from "@/lib/blog/seo"

const SLUG = "canister-out-of-cycles-fix"
const TITLE = "Canister Out of Cycles: What Happens & How to Fix It | ICPay"
const DESCRIPTION =
  "What happens when an ICP canister runs out of cycles, how to top up via CMC, freeze vs reclaim risk, and how to keep canisters alive with ICPay."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "canister out of cycles",
    "ICP canister frozen",
    "canister cycles empty",
    "top up canister cycles",
    "canister stopped cycles",
    "fix out of cycles ICP",
    "ICPay top up",
  ],
  alternates: { canonical: blogCanonical(SLUG) },
  openGraph: {
    title: "Canister Out of Cycles — Fix Guide | ICPay Blog",
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
  readingMinutes: 8,
})

export default function CanisterOutOfCyclesFixPage() {
  return (
    <article className="space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-widest text-primary">How-to</p>
        <h1 className="text-2xl font-bold leading-snug tracking-tight">
          Canister Out of Cycles: What Happens and How to Fix It
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Cycles are prepaid fuel. When the balance hits zero, updates stop and the canister can
          freeze. Topping up with ICP through the CMC restores fuel — you do not need to be a
          controller to top up.
        </p>
        <p className="text-[11px] text-muted-foreground">September 5, 2026 · 8 min read</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">What “out of cycles” means</h2>
        <ul className="space-y-1.5 pl-4 text-sm text-muted-foreground">
          <li className="list-disc">Update calls fail or the canister stops accepting state changes</li>
          <li className="list-disc">Idle burn still applies while memory is reserved</li>
          <li className="list-disc">
            Prolonged emptiness risks reclaim — treat empty balance as an incident, not a warning
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">How to fix it (ICPay)</h2>
        <ol className="list-decimal space-y-2 pl-4 text-sm text-muted-foreground">
          <li className="list-decimal">
            Open{" "}
            <Link href="/topup" className="underline underline-offset-2 hover:text-foreground">
              icpay.app/topup
            </Link>{" "}
            (or Top up from{" "}
            <Link href="/canister" className="underline underline-offset-2 hover:text-foreground">
              My canisters
            </Link>
            ).
          </li>
          <li className="list-decimal">Paste the canister ID and an ICP amount.</li>
          <li className="list-decimal">
            Confirm — ICPay sends ICP to CMC with the top-up memo and notifies{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">notify_top_up</code>.
          </li>
          <li className="list-decimal">
            Controllers can verify the new balance under{" "}
            <Link
              href="/canister/manage"
              className="underline underline-offset-2 hover:text-foreground"
            >
              Manage
            </Link>
            .
          </li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">How much ICP to send</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Top-up has a low minimum (far below create). Size deposits to days or weeks of idle burn
          plus expected traffic. Busy canisters burn faster. Preview estimated cycles before you
          confirm.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Prevent it next time</h2>
        <ul className="space-y-1.5 pl-4 text-sm text-muted-foreground">
          <li className="list-disc">Check cycles regularly if you are a controller</li>
          <li className="list-disc">
            Keep a buffer on the{" "}
            <Link
              href="/canister/cycles"
              className="underline underline-offset-2 hover:text-foreground"
            >
              cycles ledger
            </Link>{" "}
            to withdraw quickly
          </li>
          <li className="list-disc">Top up after big upgrades or traffic spikes</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Related reading</h2>
        <ul className="space-y-1.5 pl-4 text-sm text-muted-foreground">
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
          <li className="list-disc">
            <Link
              href="/blog/what-is-cycles-minting-canister"
              className="underline underline-offset-2 hover:text-foreground"
            >
              What is the Cycles Minting Canister
            </Link>
          </li>
        </ul>
      </section>
    </article>
  )
}
