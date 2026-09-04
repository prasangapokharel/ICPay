import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "How to Snapshot an ICP Canister: Take, Load & Delete | ICPay",
  description:
    "Take, list, load, and delete Internet Computer canister snapshots when your Internet Identity is a controller. Browser guide with ICPay — no dfx required.",
  keywords: [
    "canister snapshot",
    "take_canister_snapshot",
    "load_canister_snapshot",
    "ICP canister backup",
    "restore canister snapshot",
    "ICPay snapshots",
    "canister controller snapshot",
  ],
  alternates: { canonical: "/blog/how-to-snapshot-icp-canister" },
  openGraph: {
    title: "How to Snapshot an ICP Canister — ICPay Blog",
    description:
      "Controller-only snapshots: take, list, load, and delete from the browser with Internet Identity.",
    type: "article",
    publishedTime: "2026-09-05T00:00:00Z",
  },
}

export default function HowToSnapshotIcpCanisterPage() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-widest text-primary">How-to</p>
        <h1 className="text-2xl font-bold leading-snug tracking-tight">
          How to Snapshot an ICP Canister
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          A snapshot captures Wasm memory, stable memory, certified data, chunk store, and the
          module — a point-in-time backup you can load later. Only controllers can take or restore
          snapshots.
        </p>
        <p className="text-[11px] text-muted-foreground">September 5, 2026 · 7 min read</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">When to snapshot</h2>
        <ul className="space-y-1.5 pl-4 text-sm text-muted-foreground">
          <li className="list-disc">Before a risky upgrade or reinstall</li>
          <li className="list-disc">Before large data migrations</li>
          <li className="list-disc">As a recoverable checkpoint for production canisters</li>
        </ul>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Loading a snapshot{" "}
          <strong className="text-foreground">replaces current state</strong>. Confirm carefully.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Step-by-step on ICPay</h2>
        <ol className="list-decimal space-y-2 pl-4 text-sm text-muted-foreground">
          <li className="list-decimal">
            Open{" "}
            <Link href="/canister/snapshots" className="underline underline-offset-2 hover:text-foreground">
              icpay.app/canister/snapshots
            </Link>{" "}
            and sign in as a controller.
          </li>
          <li className="list-decimal">
            Enter or pick a canister under <strong className="text-foreground">Mine</strong>. Live
            status confirms access.
          </li>
          <li className="list-decimal">
            <strong className="text-foreground">List</strong> existing snapshots or{" "}
            <strong className="text-foreground">Take</strong> a new one.
          </li>
          <li className="list-decimal">
            Use <strong className="text-foreground">Load</strong> or{" "}
            <strong className="text-foreground">Delete</strong> with the confirmation dialog.
          </li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Cost and limits</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Snapshots consume cycles and storage on the canister. Large canisters take longer and cost
          more. Keep only the checkpoints you need. Pair with{" "}
          <Link href="/blog/icp-stable-memory" className="underline underline-offset-2 hover:text-foreground">
            stable memory
          </Link>{" "}
          practices for upgrade-safe state.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Related tools</h2>
        <ul className="space-y-1.5 pl-4 text-sm text-muted-foreground">
          <li className="list-disc">
            <Link href="/canister/manage" className="underline underline-offset-2 hover:text-foreground">
              Manage canister
            </Link>
          </li>
          <li className="list-disc">
            <Link href="/topup" className="underline underline-offset-2 hover:text-foreground">
              Top up cycles
            </Link>
          </li>
          <li className="list-disc">
            <Link href="/canister" className="underline underline-offset-2 hover:text-foreground">
              Canister hub
            </Link>
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Related reading</h2>
        <ul className="space-y-1.5 pl-4 text-sm text-muted-foreground">
          <li className="list-disc">
            <Link href="/blog/how-to-manage-icp-canister" className="underline underline-offset-2 hover:text-foreground">
              How to manage an ICP canister
            </Link>
          </li>
          <li className="list-disc">
            <Link href="/blog/how-icp-canisters-work" className="underline underline-offset-2 hover:text-foreground">
              How Internet Computer canisters work
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
