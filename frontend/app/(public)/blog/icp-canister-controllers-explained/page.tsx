import type { Metadata } from "next"
import Link from "next/link"
import { blogArticleJsonLd, blogCanonical } from "@/lib/blog/seo"

const SLUG = "icp-canister-controllers-explained"
const TITLE = "ICP Canister Controllers Explained | ICPay"
const DESCRIPTION =
  "What canister controllers are on the Internet Computer, who can call canister_status, start/stop, snapshots, and how Internet Identity becomes controller when you create on ICPay."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "canister controller",
    "ICP controller principal",
    "who can manage canister",
    "canister_status controller",
    "add controller ICP",
    "Internet Identity controller",
    "ICPay canister controller",
  ],
  alternates: { canonical: blogCanonical(SLUG) },
  openGraph: {
    title: "ICP Canister Controllers Explained — ICPay Blog",
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

export default function CanisterControllersExplainedPage() {
  return (
    <article className="space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-widest text-primary">Explainers</p>
        <h1 className="text-2xl font-bold leading-snug tracking-tight">
          ICP Canister Controllers Explained
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Controllers are principals allowed to administer a canister: install Wasm, change
          settings, start/stop, take snapshots, and read full status including cycles. Anyone can
          top up cycles; only controllers can manage.
        </p>
        <p className="text-[11px] text-muted-foreground">September 5, 2026 · 8 min read</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">What a controller can do</h2>
        <ul className="space-y-1.5 pl-4 text-sm text-muted-foreground">
          <li className="list-disc">
            Call <code className="rounded bg-muted px-1.5 py-0.5 text-xs">canister_status</code>{" "}
            (cycles, memory, module hash, controller list)
          </li>
          <li className="list-disc">Start and stop the canister</li>
          <li className="list-disc">Take, load, and delete snapshots</li>
          <li className="list-disc">Install or upgrade Wasm and update settings</li>
          <li className="list-disc">Add or remove other controllers</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">What anyone can do</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Topping up cycles</strong> does not require
          controller rights. That is intentional — friends, ops, or users can keep a canister alive
          without gaining admin power. See{" "}
          <Link
            href="/blog/how-to-top-up-icp-cycles"
            className="underline underline-offset-2 hover:text-foreground"
          >
            how to top up ICP cycles
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">How you become a controller</h2>
        <ul className="space-y-1.5 pl-4 text-sm text-muted-foreground">
          <li className="list-disc">
            <strong className="text-foreground">Create on ICPay</strong> — your Internet Identity is
            set as the primary controller; you can add extras at create time.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">dfx / NNS</strong> — whoever created the canister (or
            was added later) holds control.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Link on ICPay</strong> — linking saves an ID locally
            for Mine; it does not grant controller rights on-chain.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">“Not a controller” errors</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Manage and Snapshots fail if your II is not on the controller list. Confirm you signed in
          with the same identity that created the canister, or ask an existing controller to add
          your principal.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Tools</h2>
        <ul className="space-y-1.5 pl-4 text-sm text-muted-foreground">
          <li className="list-disc">
            <Link href="/canister/create" className="underline underline-offset-2 hover:text-foreground">
              Create (set controllers)
            </Link>
          </li>
          <li className="list-disc">
            <Link href="/canister/manage" className="underline underline-offset-2 hover:text-foreground">
              Manage status / start / stop
            </Link>
          </li>
          <li className="list-disc">
            <Link href="/canister" className="underline underline-offset-2 hover:text-foreground">
              My canisters
            </Link>
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Related reading</h2>
        <ul className="space-y-1.5 pl-4 text-sm text-muted-foreground">
          <li className="list-disc">
            <Link
              href="/blog/how-to-manage-icp-canister"
              className="underline underline-offset-2 hover:text-foreground"
            >
              How to manage an ICP canister
            </Link>
          </li>
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
              href="/blog/how-icp-canisters-work"
              className="underline underline-offset-2 hover:text-foreground"
            >
              How ICP canisters work
            </Link>
          </li>
        </ul>
      </section>
    </article>
  )
}
