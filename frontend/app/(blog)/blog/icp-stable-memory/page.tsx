import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "ICP Stable Memory Explained: How Canisters Persist State",
  description:
    "Stable memory explained — how Internet Computer canisters persist application state across upgrades, why it matters, and how it differs from ordinary program memory.",
  alternates: { canonical: "/blog/icp-stable-memory" },
  openGraph: {
    title: "ICP Stable Memory Explained — ICPay Blog",
    description:
      "The storage layer of a canister: what stable memory is, how upgrades survive, and why state on ICP is different from a managed database.",
    type: "article",
    publishedTime: "2026-08-16T00:00:00Z",
  },
}

export default function IcpStableMemoryPage() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-medium text-primary uppercase tracking-widest">Technology</p>
        <h1 className="text-2xl font-bold tracking-tight leading-snug">ICP Stable Memory Explained</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          When a canister is upgraded — new code, a bug fix, a feature — its state must survive.
          Ordinary program variables do not. The Internet Computer solves this with stable memory: a
          persistent storage layer inside the canister that lives across upgrades. Here is how it
          works and why it is the foundation of every on-chain app.
        </p>
        <p className="text-[11px] text-muted-foreground">August 16, 2026 · 6 min read</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Two kinds of canister memory</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          A canister has two memory regions:
        </p>
        <ul className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-disc">
            <strong className="text-foreground">Wasm heap</strong> — ordinary memory used while code
            runs. Fast, but wiped when the canister is upgraded.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Stable memory</strong> — a persistent region that
            survives upgrades and can grow to many gigabytes.
          </li>
        </ul>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The rule of thumb: if a value must still exist after the next deploy, it belongs in stable
          memory — or in a framework that moves it there automatically.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Why upgrades survive</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Deploying a new canister version replaces the WebAssembly code. Without stable memory, every
          upgrade would erase the user data, balances, and state the canister spent months building.
          With stable memory, the new code starts by reading the persistent region and resumes exactly
          where the old code left off.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          In Motoko the mechanism is the <code className="rounded bg-muted px-1 py-0.5 text-xs">stable</code>{" "}
          attribute plus <code className="rounded bg-muted px-1 py-0.5 text-xs">stable memory</code>{" "}
          and <code className="rounded bg-muted px-1 py-0.5 text-xs">preupgrade</code> hooks; in Rust
          you manage it explicitly. Projects also run migrations — code that reshapes stored data as
          the schema evolves between versions.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Stable memory is your database</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          This is the conceptual shift: on the Internet Computer you do not reach for PostgreSQL. The
          canister&apos;s stable memory <em>is</em> the persistent store. Bucket metadata, file
          records, user profiles, transfer history — all of it lives in stable memory, replicated
          across the subnet and served by the same canister that runs the logic.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          For an ICPay Cloud canister, that means:
        </p>
        <ul className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-disc">Bucket metadata — names, capacity, visibility, expiry.</li>
          <li className="list-disc">File metadata and the file bytes themselves.</li>
          <li className="list-disc">Owner principals and permission records.</li>
          <li className="list-disc">API keys and billing state.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Capacity and cost</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Stable memory scales far beyond the Wasm heap — canisters can hold gigabytes of data, which
          is what makes file storage inside a canister practical. The cost follows the cycle model:
          storage burns cycles per month, pegged to XDR, with storage-only rates quoted around a few
          dollars per gigabyte per year depending on the subnet.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The trade-off against a managed database is real: you get atomic, replicated persistence
          with no external service, but you are responsible for migration discipline as your schema
          grows.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Migrations: the discipline that makes it safe</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Because state is permanent, changing your data model requires a migration — code that runs on
          upgrade to reshape stored records. ICPay&apos;s backend, for example, carries migrations for
          every schema change, so a version bump reshapes old records in place rather than losing them.
          This is why &quot;upgrade the canister without losing users&quot; is a solved problem on ICP,
          and why stable memory is the backbone of custodial and storage apps.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Useful links</h2>
        <ul className="space-y-1.5 pl-4 text-sm text-muted-foreground">
          {[
            { label: "Canister upgrades — official docs", href: "https://docs.internetcomputer.org/concepts/canisters-code" },
            { label: "Stable memory reference", href: "https://docs.internetcomputer.org/current/developer-docs/smart-contracts/advanced-concepts/stable_memory" },
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
            <Link href="/blog/how-icp-canisters-work" className="underline underline-offset-2 hover:text-foreground">
              How Internet Computer canisters work
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