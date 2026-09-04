import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "How to Top Up ICP Cycles: Canister Cycles Guide (2026)",
  description:
    "How to top up ICP cycles on the Internet Computer — convert ICP to canister cycles via the CMC, why balances matter, step-by-step with ICPay, fees, and mistakes to avoid.",
  keywords: [
    "how to top up ICP cycles",
    "top up canister cycles",
    "ICP cycles top up",
    "convert ICP to cycles",
    "Cycles Minting Canister",
    "CMC top up",
    "Internet Computer cycles",
    "canister out of cycles",
    "mint cycles ICP",
    "ICPay top up",
  ],
  alternates: { canonical: "/blog/how-to-top-up-icp-cycles" },
  openGraph: {
    title: "How to Top Up ICP Cycles — ICPay Blog",
    description:
      "A practical guide to topping up Internet Computer canister cycles with ICP: CMC rate, wallet flow, and how to keep canisters alive.",
    type: "article",
    publishedTime: "2026-09-04T00:00:00Z",
  },
}

export default function HowToTopUpIcpCyclesPage() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-widest text-primary">How-to</p>
        <h1 className="text-2xl font-bold leading-snug tracking-tight">
          How to Top Up ICP Cycles: Keep Your Canisters Alive
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          On the Internet Computer, apps do not charge users gas. Canisters burn{" "}
          <strong className="text-foreground">cycles</strong> — prepaid fuel for compute and
          storage. When that balance hits zero, the canister freezes. This guide explains what
          cycles are, how ICP converts into them, and how to top up any canister ID from ICPay.
        </p>
        <p className="text-[11px] text-muted-foreground">September 4, 2026 · 12 min read</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Why you need to top up cycles</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Every update call, every byte of storage, and many network operations consume cycles.
          Queries are free, but anything that changes state costs fuel. Popular canisters burn
          faster. Empty balance means the canister stops accepting updates — and if it stays empty
          long enough, the network can reclaim it.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Topping up is the Internet Computer equivalent of paying a cloud bill before the server
          shuts down. Developers, bucket owners, and anyone running a canister should treat cycle
          balance as an ops metric, not an afterthought.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">
          What cycles are (and how they differ from ICP)
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          <strong className="text-foreground">ICP</strong> is the governance and utility token.
          <strong className="text-foreground"> Cycles</strong> are the stable unit of computation.
          They are pegged to the IMF&apos;s Special Drawing Right (XDR):
        </p>
        <p className="rounded-xl bg-muted/40 px-4 py-3 text-sm leading-relaxed text-foreground">
          1 trillion cycles ≈ 1 XDR (roughly $1.30–$1.40 USD, depending on XDR/USD).
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          That peg keeps infrastructure costs predictable even when ICP&apos;s market price moves.
          Converting ICP into cycles also{" "}
          <strong className="text-foreground">burns the ICP</strong> — tokens leave circulating
          supply. For a deeper primer, see{" "}
          <Link
            href="/blog/icp-cycles-explained"
            className="underline underline-offset-2 hover:text-foreground"
          >
            ICP cycles explained
          </Link>{" "}
          and the{" "}
          <Link
            href="/blog/icp-reverse-gas-model"
            className="underline underline-offset-2 hover:text-foreground"
          >
            reverse gas model
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">
          The Cycles Minting Canister (CMC)
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          ICP does not turn into cycles inside your wallet. Conversion happens on-chain through the{" "}
          <strong className="text-foreground">Cycles Minting Canister</strong> — the network&apos;s
          official minting endpoint. You transfer ICP to the CMC with a top-up memo that names the
          destination canister; the CMC then mints cycles into that canister&apos;s balance at the
          live ICP/XDR rate.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Tools like the NNS frontend,{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">dfx</code>, the
          IC dashboard, and ICPay all talk to the same CMC. The rate and burn semantics are
          protocol-level — not a third-party wrap.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">What you need before topping up</h2>
        <ul className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-disc">
            <strong className="text-foreground">A canister ID</strong> — the target that will
            receive cycles (for example{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
              aaaaa-aa
            </code>
            -style principal text). Confirm it exists before sending.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">ICP balance</strong> — enough to cover the amount
            you want to convert plus ledger transfer fees.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Internet Identity</strong> — ICPay signs in with II
            only. No seed phrases, no app passwords.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">
          How to top up cycles with ICPay (step by step)
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          ICPay&apos;s{" "}
          <Link href="/topup" className="underline underline-offset-2 hover:text-foreground">
            cycles top-up page
          </Link>{" "}
          pays from your ICPay wallet and mints through the official CMC:
        </p>
        <ol className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-decimal">
            Open{" "}
            <Link href="/topup" className="underline underline-offset-2 hover:text-foreground">
              icpay.app/topup
            </Link>{" "}
            and sign in with Internet Identity.
          </li>
          <li className="list-decimal">
            Paste the <strong className="text-foreground">canister ID</strong> you want to fund.
            ICPay checks that the canister exists before you pay.
          </li>
          <li className="list-decimal">
            Enter how much <strong className="text-foreground">ICP</strong> to convert. The UI
            estimates cycles using the live CMC rate.
          </li>
          <li className="list-decimal">
            Confirm. If your Internet Identity principal needs ICP for the CMC transfer, ICPay can
            withdraw from your wallet first, then complete the mint.
          </li>
          <li className="list-decimal">
            Wait for the CMC notify step. On success, cycles land in the canister — you can verify
            on the IC dashboard.
          </li>
        </ol>
        <p className="text-sm leading-relaxed text-muted-foreground">
          That is the whole path: wallet → (optional II top-up) → CMC transfer with top-up memo →
          notify → cycles credited. No exchange off-ramp, no credit card, no third-party cycles
          broker.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">How much ICP becomes how many cycles?</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The CMC publishes an ICP/XDR rate (often quoted in permyriad). Roughly:
        </p>
        <ul className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-disc">
            More expensive ICP → fewer cycles per ICP (you burn fewer tokens for the same XDR of
            fuel).
          </li>
          <li className="list-disc">
            Cheaper ICP → more cycles per ICP (you burn more tokens for the same XDR of fuel).
          </li>
        </ul>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Always trust the live estimate on the top-up form rather than a static calculator. The
          rate moves with markets; ICPay reads it from the CMC at top-up time.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Fees and minimums</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Ledger transfers charge a small fixed ICP fee (commonly{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">0.0001</code>{" "}
          ICP per ICRC-1 transfer). A full wallet-funded top-up may involve more than one transfer
          (wallet → II, then II → CMC), so budget for those fees on top of the ICP you intend to
          convert.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Very tiny amounts may be rejected by protocol minimums. Use the form&apos;s validation —
          if the button stays disabled, the amount or canister ID is not ready yet.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Signs your canister needs a top-up</h2>
        <ul className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-disc">Update calls start failing with out-of-cycles errors.</li>
          <li className="list-disc">
            The IC dashboard shows a low or falling cycle balance on the canister status page.
          </li>
          <li className="list-disc">
            Storage-heavy or chatty apps (file buckets, messaging, frequent HTTPS outcalls) drain
            faster than quiet ones.
          </li>
          <li className="list-disc">
            After a traffic spike or a large upgrade, burn rate jumps — top up before the cliff.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Common mistakes</h2>
        <ul className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-disc">
            <strong className="text-foreground">Wrong canister ID.</strong> Cycles go to the ID you
            paste. Double-check characters; ICPay verifies existence, but existence is not the same
            as “the canister you meant.”
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Confusing cycles with ICP balance.</strong> Wallet
            ICP is not canister fuel. You must convert via the CMC.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Ignoring fees.</strong> Leave a little ICP for
            transfer fees so the mint does not fail mid-flow.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Waiting until zero.</strong> Frozen canisters hurt
            users. Set a floor and top up early.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Other ways to top up (and when ICPay fits)</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          You can also top up from the NNS UI,{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">dfx ledger
          top-up</code>
          -style workflows, or the IC dashboard. Those paths are fine for operators who live in
          tooling. ICPay is built for people who already hold ICP in an ICPay wallet and want a
          single browser flow: paste ID, pick amount, confirm — same CMC, same burn, same result.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Top up now</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Ready to fund a canister? Use the{" "}
          <Link href="/topup" className="underline underline-offset-2 hover:text-foreground">
            ICPay cycles top-up tool
          </Link>
          . New to the network? Start with{" "}
          <Link
            href="/blog/what-is-icp"
            className="underline underline-offset-2 hover:text-foreground"
          >
            what is ICP
          </Link>
          , then{" "}
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
        <h2 className="text-base font-semibold tracking-tight">Useful links</h2>
        <ul className="space-y-1.5 pl-4 text-sm text-muted-foreground">
          {[
            {
              label: "Cycles — official docs",
              href: "https://docs.internetcomputer.org/concepts/cycles/",
            },
            {
              label: "Cycle costs reference",
              href: "https://docs.internetcomputer.org/references/cycle-costs/",
            },
            {
              label: "Tokens and cycles guide",
              href: "https://cli.internetcomputer.org/1.1/guides/tokens-and-cycles/",
            },
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
            <Link
              href="/blog/how-to-create-icp-canister"
              className="underline underline-offset-2 hover:text-foreground"
            >
              How to create an ICP canister
            </Link>
          </li>
          <li className="list-disc">
            <Link
              href="/blog/how-to-mint-cycles-ledger"
              className="underline underline-offset-2 hover:text-foreground"
            >
              How to mint cycles to the cycles ledger
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
              href="/blog/icp-reverse-gas-model"
              className="underline underline-offset-2 hover:text-foreground"
            >
              The reverse gas model explained
            </Link>
          </li>
          <li className="list-disc">
            <Link
              href="/blog/how-icp-canisters-work"
              className="underline underline-offset-2 hover:text-foreground"
            >
              How Internet Computer canisters work
            </Link>
          </li>
          <li className="list-disc">
            <Link
              href="/blog/how-to-send-icp"
              className="underline underline-offset-2 hover:text-foreground"
            >
              How to send ICP
            </Link>
          </li>
        </ul>
      </section>
    </article>
  )
}
