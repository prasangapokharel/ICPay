import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "How to Manage an ICP Canister: Status, Start & Stop | ICPay",
  description:
    "Manage Internet Computer canisters from the browser — live canister_status, start/stop, and logs when your Internet Identity is a controller. Step-by-step with ICPay.",
  keywords: [
    "manage ICP canister",
    "canister_status",
    "start canister ICP",
    "stop canister ICP",
    "canister controller",
    "fetch canister logs",
    "IC management canister",
    "ICPay manage canister",
  ],
  alternates: { canonical: "/blog/how-to-manage-icp-canister" },
  openGraph: {
    title: "How to Manage an ICP Canister — ICPay Blog",
    description:
      "Live status, start/stop, and logs for canisters you control — no backend, Internet Identity only.",
    type: "article",
    publishedTime: "2026-09-05T00:00:00Z",
  },
}

export default function HowToManageIcpCanisterPage() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-widest text-primary">How-to</p>
        <h1 className="text-2xl font-bold leading-snug tracking-tight">
          How to Manage an ICP Canister: Status, Start &amp; Stop
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Controllers can call the IC management canister (<code className="rounded bg-muted px-1 py-0.5 text-xs">aaaaa-aa</code>)
          to read status, start or stop execution, and fetch logs. ICPay exposes that flow in the
          browser with Internet Identity — no Motoko backend in the middle.
        </p>
        <p className="text-[11px] text-muted-foreground">September 5, 2026 · 7 min read</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Why “not a controller” appears</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">canister_status</code> rejects
          callers who are not controllers (reject code 4/5). Pasting ICPay&apos;s wallet canister or
          someone else&apos;s canister will fail. Use an ID you created, or one where your II was
          added as controller.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">What live status shows</h2>
        <ul className="space-y-1.5 pl-4 text-sm text-muted-foreground">
          <li className="list-disc">Run state — running, stopping, or stopped</li>
          <li className="list-disc">Cycles balance and idle burn per day</li>
          <li className="list-disc">Memory sizes, module hash, controllers</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Step-by-step on ICPay</h2>
        <ol className="list-decimal space-y-2 pl-4 text-sm text-muted-foreground">
          <li className="list-decimal">
            Open{" "}
            <Link href="/canister/manage" className="underline underline-offset-2 hover:text-foreground">
              icpay.app/canister/manage
            </Link>{" "}
            and sign in.
          </li>
          <li className="list-decimal">
            Paste a canister ID or pick one under <strong className="text-foreground">Mine</strong>.
          </li>
          <li className="list-decimal">
            When status loads, use Start, Stop, or Fetch logs. Stop asks for confirmation.
          </li>
          <li className="list-decimal">
            Low cycles? Jump to{" "}
            <Link href="/topup" className="underline underline-offset-2 hover:text-foreground">
              top up
            </Link>
            .
          </li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Related tools</h2>
        <ul className="space-y-1.5 pl-4 text-sm text-muted-foreground">
          <li className="list-disc">
            <Link href="/canister/create" className="underline underline-offset-2 hover:text-foreground">
              Create a canister
            </Link>
          </li>
          <li className="list-disc">
            <Link href="/canister/snapshots" className="underline underline-offset-2 hover:text-foreground">
              Snapshots
            </Link>
          </li>
          <li className="list-disc">
            <Link href="/canister/cycles" className="underline underline-offset-2 hover:text-foreground">
              Cycles wallet
            </Link>
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Related reading</h2>
        <ul className="space-y-1.5 pl-4 text-sm text-muted-foreground">
          <li className="list-disc">
            <Link href="/blog/how-to-create-icp-canister" className="underline underline-offset-2 hover:text-foreground">
              How to create an ICP canister
            </Link>
          </li>
          <li className="list-disc">
            <Link href="/blog/how-to-snapshot-icp-canister" className="underline underline-offset-2 hover:text-foreground">
              How to snapshot an ICP canister
            </Link>
          </li>
          <li className="list-disc">
            <Link href="/blog/how-icp-canisters-work" className="underline underline-offset-2 hover:text-foreground">
              How Internet Computer canisters work
            </Link>
          </li>
        </ul>
      </section>
    </article>
  )
}
