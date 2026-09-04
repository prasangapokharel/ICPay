import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "How to Create an ICP Canister with CMC (No dfx) | ICPay",
  description:
    "Create an Internet Computer canister with ICP via the Cycles Minting Canister — controllers, subnets, wallet flow, and step-by-step with ICPay. No dfx required.",
  keywords: [
    "create ICP canister",
    "how to create canister ICP",
    "notify_create_canister",
    "CMC create canister",
    "Internet Computer create canister",
    "canister without dfx",
    "ICPay create canister",
    "subnet picker ICP",
    "canister controller Internet Identity",
  ],
  alternates: { canonical: "/blog/how-to-create-icp-canister" },
  openGraph: {
    title: "How to Create an ICP Canister — ICPay Blog",
    description:
      "Spin up a new Internet Computer canister from your browser: pay ICP, pick a subnet, set controllers via CMC.",
    type: "article",
    publishedTime: "2026-09-05T00:00:00Z",
  },
}

export default function HowToCreateIcpCanisterPage() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-widest text-primary">How-to</p>
        <h1 className="text-2xl font-bold leading-snug tracking-tight">
          How to Create an ICP Canister (Without dfx)
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          A canister is the app unit of the Internet Computer — code plus state. You can create one
          from ICPay by paying ICP through the official Cycles Minting Canister (CMC). Your Internet
          Identity becomes the controller. No terminal, no local replica.
        </p>
        <p className="text-[11px] text-muted-foreground">September 5, 2026 · 8 min read</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">What you get when you create</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          CMC <code className="rounded bg-muted px-1.5 py-0.5 text-xs">notify_create_canister</code>{" "}
          burns ICP and returns a new canister ID. Leftover value after the creation fee becomes
          initial cycles on that canister. You (and any extra controllers you add) can install Wasm,
          top up cycles, and manage settings later.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Step-by-step on ICPay</h2>
        <ol className="list-decimal space-y-2 pl-4 text-sm text-muted-foreground">
          <li className="list-decimal">
            Open{" "}
            <Link href="/canister/create" className="underline underline-offset-2 hover:text-foreground">
              icpay.app/canister/create
            </Link>{" "}
            and sign in with Internet Identity.
          </li>
          <li className="list-decimal">
            Choose a <strong className="text-foreground">subnet</strong> (or leave default so CMC
            picks). Optionally add extra controller principals.
          </li>
          <li className="list-decimal">
            Enter an ICP amount (minimum 0.1 ICP). ICPay funds your II from the wallet if needed,
            then transfers to the CMC with the create memo.
          </li>
          <li className="list-decimal">
            After notify succeeds, copy the new canister ID — it is saved under{" "}
            <strong className="text-foreground">Mine</strong> for top-up and manage later.
          </li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Controllers and subnets</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The caller must be a controller. Extra principals are optional. Subnet choice affects
          geography and capacity; default is fine for most apps. For deeper context see{" "}
          <Link
            href="/blog/icp-subnets-explained"
            className="underline underline-offset-2 hover:text-foreground"
          >
            ICP subnets explained
          </Link>{" "}
          and{" "}
          <Link
            href="/blog/how-icp-canisters-work"
            className="underline underline-offset-2 hover:text-foreground"
          >
            how canisters work
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">After create</h2>
        <ul className="space-y-1.5 pl-4 text-sm text-muted-foreground">
          <li className="list-disc">
            <Link href="/topup" className="underline underline-offset-2 hover:text-foreground">
              Top up cycles
            </Link>{" "}
            when the balance runs low.
          </li>
          <li className="list-disc">
            <Link href="/canister/manage" className="underline underline-offset-2 hover:text-foreground">
              Manage
            </Link>{" "}
            status, start/stop, and logs (controller only).
          </li>
          <li className="list-disc">Install Wasm with dfx or your deploy pipeline when ready.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Create now</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Use the{" "}
          <Link href="/canister/create" className="underline underline-offset-2 hover:text-foreground">
            ICPay create canister tool
          </Link>
          , or browse all tools on the{" "}
          <Link href="/canister" className="underline underline-offset-2 hover:text-foreground">
            canister hub
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
            <Link href="/blog/how-to-manage-icp-canister" className="underline underline-offset-2 hover:text-foreground">
              How to manage an ICP canister
            </Link>
          </li>
          <li className="list-disc">
            <Link href="/blog/icp-cycles-explained" className="underline underline-offset-2 hover:text-foreground">
              ICP cycles explained
            </Link>
          </li>
        </ul>
      </section>
    </article>
  )
}
