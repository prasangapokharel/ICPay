import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "How to Send ICP: The Complete 2026 Guide",
  description:
    "How to send ICP step by step — by account ID or by username, transfer fees, the ICRC-1 standard, and common mistakes that lose funds.",
  alternates: { canonical: "/blog/how-to-send-icp" },
  openGraph: {
    title: "How to Send ICP — ICPay Blog",
    description:
      "The complete guide to sending Internet Computer (ICP): addresses, fees, ICRC-1, and how to avoid losing funds.",
    type: "article",
    publishedTime: "2026-08-10T00:00:00Z",
  },
}

export default function HowToSendIcpPage() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-medium text-primary uppercase tracking-widest">How-to</p>
        <h1 className="text-2xl font-bold tracking-tight leading-snug">
          How to Send ICP: Step by Step
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Sending ICP is a single ledger transaction — fast, final, and impossible to reverse.
          The only real risk is sending to the wrong address. This guide covers the basics and
          the mistakes worth avoiding.
        </p>
        <p className="text-[11px] text-muted-foreground">August 10, 2026 · 5 min read</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">What you need before sending</h2>
        <ul className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-disc">
            An ICP wallet — self-custody, exchange account, or custodial wallet like ICPay.
          </li>
          <li className="list-disc">
            A small balance for the transfer fee (currently {`0.0001`} ICP per ICRC-1 transfer).
          </li>
          <li className="list-disc">
            The recipient&apos;s account ID (64 hex characters) or their ICP username.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">ICP account IDs and principals</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          On the ICP ledger, the destination of a transfer is an <strong className="text-foreground">account ID</strong> —
          64 hexadecimal characters that encode a principal plus an optional subaccount. Every
          wallet derives one for you, usually shown as a long string or QR code.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Accounts can also carry a <strong className="text-foreground">subaccount</strong>, so
          one principal can host many accounts — which is exactly how a custodial wallet like
          ICPay keeps each user&apos;s balance in a separate subaccount of one canister.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Send by account ID</h2>
        <ol className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-decimal">Open your ICP wallet and choose Send.</li>
          <li className="list-decimal">Paste the recipient&apos;s 64-character account ID.</li>
          <li className="list-decimal">Enter the amount in ICP.</li>
          <li className="list-decimal">Double-check every character before confirming.</li>
        </ol>
        <p className="text-sm leading-relaxed text-muted-foreground">
          ICP transfers are final in about a second. There are no chargebacks and no support
          tickets to undo a mistake — so the character-by-character check matters.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Send by username</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Long account IDs are the number one source of lost funds. ICPay removes that failure
          mode with <strong className="text-foreground">username transfers</strong>: register a
          public username, then anyone can send you ICP to that name. The canister resolves the
          username to your account at transfer time — still one ICRC-1 ledger transaction, still
          final — but you no longer have to copy 64 characters by hand.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Transfer fees and minimums</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          ICRC-1 transfers cost a small fixed fee in ICP, paid by the sender on top of the amount
          sent. It is tiny, flat, and does not scale with the size of the transfer. On the
          Internet Computer, querying balances and looking up usernames is free — only update
          calls that change state consume cycles, and cycles are derived from a stable unit, not
          from ICP&apos;s price.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Common mistakes and how to avoid them</h2>
        <ul className="space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
          <li className="list-disc">
            <strong className="text-foreground">Sending to the wrong network.</strong> ICP has no
            wrapped cross-chain variants to confuse, but always confirm the destination is an ICP
            account ID, not an Ethereum address.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Copy-paste typos.</strong> Use a QR code, a saved
            contact, or a username instead of typing addresses by hand.
          </li>
          <li className="list-disc">
            <strong className="text-foreground">Sending more than you intended.</strong> Enter the
            amount, review the full summary, then confirm.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Start sending</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          ICPay turns the whole flow into a few taps: sign in with Internet Identity, pick a
          username, and send ICP by name. New to the ecosystem? Read{" "}
          <Link href="/blog/what-is-icp" className="underline underline-offset-2 hover:text-foreground">
            what is ICP
          </Link>{" "}
          and our picks for the{" "}
          <Link href="/blog/best-icp-wallet" className="underline underline-offset-2 hover:text-foreground">
            best ICP wallet
          </Link>.
        </p>
      </section>
    </article>
  )
}