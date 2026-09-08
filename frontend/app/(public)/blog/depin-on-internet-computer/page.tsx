import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "DePIN on Internet Computer: Decentralized Physical Infrastructure Networks Explained",
  description:
    "DePIN crypto on the Internet Computer — how decentralized physical infrastructure networks use ICP canisters for coordination, payments, and on-chain data without centralized servers.",
  alternates: { canonical: "/blog/depin-on-internet-computer" },
  openGraph: {
    title: "DePIN on Internet Computer — ICPay Blog",
    description: "How DePIN projects use ICP for decentralized infrastructure coordination and payments.",
    type: "article",
    publishedTime: "2026-08-28T00:00:00Z",
  },
}

export default function DepinOnIcpPage() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-medium text-primary uppercase tracking-widest">Ecosystem</p>
        <h1 className="text-2xl font-bold tracking-tight leading-snug">
          DePIN on Internet Computer: Decentralized Physical Infrastructure Networks Explained
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">DePIN</strong> (Decentralized Physical Infrastructure
          Networks) tokenizes real-world hardware — sensors, bandwidth, storage, compute — and
          coordinates it on-chain. The Internet Computer is a natural fit: canisters handle
          coordination logic, ICRC tokens handle payments, and{" "}
          <Link href="/blog/icp-https-outcalls" className="underline underline-offset-2 hover:text-foreground">
            HTTPS outcalls
          </Link>{" "}
          connect to physical devices.
        </p>
        <p className="text-[11px] text-muted-foreground">August 28, 2026 · 6 min read</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">What is DePIN?</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          DePIN projects incentivize people to deploy physical infrastructure — WiFi hotspots, GPS
          trackers, weather stations, storage nodes — and reward them in tokens. Helium did it for
          wireless. Filecoin did it for storage. The coordination layer — who contributed what, who
          gets paid how much — must be trustless. That is where blockchains come in.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Why DePIN builders choose ICP</h2>
        <ul className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-disc"><strong className="text-foreground">On-chain backend.</strong> Coordination logic in canisters — no AWS Lambda scheduling payouts.</li>
          <li className="list-disc"><strong className="text-foreground">ICRC token payments.</strong> Reward contributors in ICRC-1/ICRC-2 tokens with sub-second finality.</li>
          <li className="list-disc"><strong className="text-foreground">Reverse gas.</strong> Device operators interact without holding a gas token.</li>
          <li className="list-disc"><strong className="text-foreground">HTTPS outcalls.</strong> Canisters pull sensor data from IoT APIs on-chain.</li>
          <li className="list-disc"><strong className="text-foreground">Stable storage.</strong>{" "}
            <Link href="/blog/icp-stable-memory" className="underline underline-offset-2 hover:text-foreground">Stable memory</Link>{" "}
            persists device registry across canister upgrades.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">DePIN + payments: the ICPay angle</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          DePIN networks need a wallet layer for contributors to receive rewards and spend earnings.
          ICPay provides passkey login, username sends, and{" "}
          <Link href="/blog/gasless-crypto-transactions-icpay" className="underline underline-offset-2 hover:text-foreground">
            gasless queries
          </Link>{" "}
          — the user experience DePIN participants expect without seed phrases. The{" "}
          <Link href="/blog/best-icp-wallet" className="underline underline-offset-2 hover:text-foreground">
            best ICP wallet
          </Link>{" "}
          for DePIN contributors is one that feels like a normal app.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Frequently asked questions</h2>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-foreground">What DePIN projects run on ICP?</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              The IC ecosystem includes decentralized storage (ICPay Bucket), on-chain social, and
              infrastructure coordination canisters. DePIN is an emerging narrative as subnet
              capacity grows.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">How do DePIN tokens relate to ICP?</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              DePIN projects typically issue ICRC tokens for rewards while using ICP for governance
              and cycle payments. ICPay supports ICP and ICRC-1 token transfers.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Related</p>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link href="/blog/sovereign-cloud-vs-aws-web3" className="underline underline-offset-2 text-muted-foreground hover:text-foreground">Sovereign Cloud</Link>
          <span className="text-muted-foreground">·</span>
          <Link href="/blog/icp-cloud-storage" className="underline underline-offset-2 text-muted-foreground hover:text-foreground">ICP Cloud Storage</Link>
        </div>
      </section>
    </article>
  )
}
