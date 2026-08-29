import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "ICP Subnets and Nodes Explained: How the Network Replicates State",
  description:
    "Subnets and nodes explained — how the Internet Computer organizes independent machines into subnets, runs consensus, and replicates canister state without trusting any single node.",
  alternates: { canonical: "/blog/icp-subnets-explained" },
  openGraph: {
    title: "ICP Subnets and Nodes Explained — ICPay Blog",
    description:
      "Nodes, subnets, replicas, and consensus — the physical layer that makes the Internet Computer tamper-proof.",
    type: "article",
    publishedTime: "2026-08-16T00:00:00Z",
  },
}

export default function IcpSubnetsPage() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-medium text-primary uppercase tracking-widest">Technology</p>
        <h1 className="text-2xl font-bold tracking-tight leading-snug">
          ICP Subnets and Nodes Explained
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Behind every canister is a subnet — a group of independent machines that all run the same
          code and agree on the same state. Understanding nodes, subnets, and consensus explains how
          the Internet Computer stays tamper-proof without you trusting anyone. Here is the physical
          layer of the network.
        </p>
        <p className="text-[11px] text-muted-foreground">August 16, 2026 · 6 min read</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">The hierarchy</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The Internet Computer has four layers, and it helps to hold them in order:
        </p>
        <ul className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-disc">
            <strong className="text-foreground">The Internet Computer</strong> — the whole network.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Subnets</strong> — groups of nodes that execute
            canisters.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Nodes</strong> — physical machines run by independent
            node providers.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Canisters</strong> — the applications living on a
            subnet.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Nodes are not your servers</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          A node is a physical machine participating in the network. Crucially, the nodes are not
          owned by you or by one company — they are operated by independent node providers across
          multiple data centres and countries. That distribution is what makes the network
          censorship-resistant: no single operator, government, or cloud provider controls it.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Subnets: groups of nodes that act as one</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          A subnet is a set of nodes that collectively execute a group of canisters. Think of it as a
          single fault-tolerant computer made of many machines. When a canister is deployed, it runs
          on every node of its subnet; every node maintains the full canister state.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          If one node fails or goes offline, the subnet continues — the other nodes still hold the
          complete state. There is no single point of failure, and no backup service to configure,
          because the replication is built into the network.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Consensus: agreeing on the truth</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Multiple machines running the same code still need a way to agree on the order and outcome
          of calls. That is the job of consensus: each subnet runs a Byzantine-fault-tolerant protocol
          so that the nodes reach agreement on the next state even if some nodes are faulty or
          malicious.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Because the computation is deterministic, every honest replica computes the same result; the
          consensus layer then commits that result as the new canister state. The outcome is a
          tamper-proof record: to change state, you would have to corrupt a majority of a subnet&apos;s
          nodes, which are operated by different providers in different places.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Why subnets make ICP fast</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Subnets do not just add redundancy — they add parallelism. Different subnets process
          different canisters at the same time, which is how the network scales beyond the limits of a
          single chain. This design is what allows the theoretical throughput of thousands of
          transactions per second and finality in about one to two seconds.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Different subnets can also have different trust and performance profiles — some are
          high-throughput, others are purpose-built for fiduciary applications like Bitcoin custody.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">The hierarchy in practice</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          When you open ICPay, the wallet canister you are talking to runs on a specific subnet, and
          every call you make is executed and agreed on by that subnet&apos;s nodes. Your balances,
          transfers, and cloud buckets are all records in replicated canister state — verified by
          consensus, not by a single server you have to trust.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Useful links</h2>
        <ul className="space-y-1.5 pl-4 text-sm text-muted-foreground">
          {[
            { label: "The Internet Computer — network overview", href: "https://internetcomputer.org/how-it-works" },
            { label: "Subnets — official docs", href: "https://docs.internetcomputer.org/concepts/subnets" },
            { label: "ICP Dashboard — live network view", href: "https://dashboard.internetcomputer.org/" },
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
            <Link href="/blog/what-is-icp" className="underline underline-offset-2 hover:text-foreground">
              What is ICP?
            </Link>
          </li>
        </ul>
      </section>
    </article>
  )
}