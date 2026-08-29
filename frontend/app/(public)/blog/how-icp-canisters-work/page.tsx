import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "How Internet Computer Canisters Work",
  description:
    "Canisters explained — the Wasm-based smart contracts that hold code and state on the Internet Computer. Subnets, stable memory, cycles, and how a call reaches a canister.",
  alternates: { canonical: "/blog/how-icp-canisters-work" },
  openGraph: {
    title: "How Internet Computer Canisters Work — ICPay Blog",
    description:
      "A deep look at canisters: WebAssembly execution, stable memory, cycles, subnets, and the path a request takes from browser to consensus.",
    type: "article",
    publishedTime: "2026-08-16T00:00:00Z",
  },
}

export default function HowCanistersWorkPage() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-medium text-primary uppercase tracking-widest">Technology</p>
        <h1 className="text-2xl font-bold tracking-tight leading-snug">
          How Internet Computer Canisters Work
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          A canister is the application unit of the Internet Computer — part smart contract, part
          backend server, part database. It holds both code and state, runs as WebAssembly, and is
          executed by a replicated group of nodes. This is the mental model you need to understand
          anything else on ICP.
        </p>
        <p className="text-[11px] text-muted-foreground">August 16, 2026 · 7 min read</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">A canister is more than a smart contract</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          On Ethereum, a smart contract is logic without a home: the logic lives in bytecode, but
          the data usually lives in some other storage system. A canister bundles both. It contains{" "}
          <strong className="text-foreground">WebAssembly code</strong>, its own{" "}
          <strong className="text-foreground">state</strong>, and{" "}
          <strong className="text-foreground">memory</strong> — all in one deployable unit.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Think of it as <em>backend + persistent state + execution environment</em>. A single
          canister can hold user records, file metadata, and application logic without ever reaching
          out to PostgreSQL, Redis, or S3.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">What is inside a canister</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Imagine an ICPay Cloud canister. It exposes methods like{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">upload()</code>,{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">download()</code>,{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">delete()</code>, and{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">createBucket()</code>. Beside the
          code, it keeps state: bucket metadata, file metadata, the file bytes, expiration dates,
          and the owner&apos;s principal.
        </p>
        <ul className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-disc">
            <strong className="text-foreground">Code</strong> — compiled WebAssembly.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">State</strong> — the current values of every
            variable the code manages.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Stable memory</strong> — persistent storage that
            survives canister upgrades.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">A balance of cycles</strong> — the fuel that pays
            for its own execution.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">How your code runs</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Canisters execute WebAssembly. You do not write Wasm by hand — you compile Motoko, Rust,
          or TypeScript (via Azle) down to Wasm, then deploy it. The path is:
        </p>
        <ul className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-disc">Source code in Motoko, Rust, or TypeScript.</li>
          <li className="list-disc">Compiled to WebAssembly.</li>
          <li className="list-disc">Deployed as a canister onto a subnet.</li>
          <li className="list-disc">Executed by every replica node of that subnet.</li>
        </ul>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Because execution is deterministic, every replica computes the same result — that is what
          lets the network reach consensus on state without trusting any single node.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Canisters live on subnets</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          A canister is not deployed to one machine. It is deployed to a{" "}
          <strong className="text-foreground">subnet</strong> — a group of independent nodes that
          collectively execute the canister. Each node runs the same computation; the subnet uses
          consensus to agree on the resulting state.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          This is the hierarchy that matters:
        </p>
        <ul className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-disc">The Internet Computer is made of subnets.</li>
          <li className="list-disc">Each subnet is a group of nodes.</li>
          <li className="list-disc">Each node runs replicas of the same canisters.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">The path of a single call</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          When your browser calls <code className="rounded bg-muted px-1 py-0.5 text-xs">upload()</code>,
          the request travels from the frontend to the canister on a subnet. Each replica executes
          the deterministic state transition. The subnet reaches consensus, and the agreed state
          becomes the new canister state. From the outside it looks like an ordinary API call that
          takes one to two seconds.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Read-only <strong className="text-foreground">queries</strong> skip consensus entirely and
          return in about 100 milliseconds — and they cost no cycles. Updates go through the full
          replicated path. This split is why an app can look up a balance or search usernames
          instantly while writes settle in about two seconds.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Canisters pay their own bills</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          A canister holds a balance of <strong className="text-foreground">cycles</strong> — the
          network&apos;s unit of computation. Every update call, byte of storage, and message burns a
          small amount. The developer tops the balance up, so users never pay gas. This is the
          reverse gas model, and it is why apps on ICP feel like ordinary websites.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Why this matters for wallets</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          For a custodial wallet like ICPay, the entire backend — users, balances, transfers, and
          cloud storage — runs inside canisters on a subnet. Sending ICP means the canister calls
          the ICP ledger directly in the same consensus round as your request. There is no separate
          server, database, or bridge to trust.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The same canister model powers ckBTC and ckETH through chain-key signatures, and it is the
          foundation of every other concept on this blog.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Useful links</h2>
        <ul className="space-y-1.5 pl-4 text-sm text-muted-foreground">
          {[
            { label: "Canisters — official docs", href: "https://docs.internetcomputer.org/concepts/canisters/" },
            { label: "Canister lifecycle and upgrades", href: "https://docs.internetcomputer.org/concepts/canisters-code" },
            { label: "Cycles and costing", href: "https://docs.internetcomputer.org/references/cycle-costs/" },
          ].map((l) => (
            <li key={l.href} className="list-disc">
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-foreground"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Related reading</h2>
        <ul className="space-y-1.5 pl-4 text-sm text-muted-foreground">
          <li className="list-disc">
            <Link href="/blog/what-is-icp" className="underline underline-offset-2 hover:text-foreground">
              What is ICP?
            </Link>
          </li>
          <li className="list-disc">
            <Link href="/blog/icp-subnets-explained" className="underline underline-offset-2 hover:text-foreground">
              ICP subnets, nodes, and consensus explained
            </Link>
          </li>
          <li className="list-disc">
            <Link href="/blog/icp-stable-memory" className="underline underline-offset-2 hover:text-foreground">
              ICP stable memory explained
            </Link>
          </li>
        </ul>
      </section>
    </article>
  )
}