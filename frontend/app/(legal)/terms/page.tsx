import type { Metadata } from "next"
import Link from "next/link"
import { Section, Bullets } from "@/components/legal/prose"

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms of using ICPay: a custodial ICP wallet built on an Internet Computer canister. Fees, username rules, and the limits of what the software guarantees.",
  alternates: { canonical: "/terms" },
}

const FEES = [
  { handle: "1–3 characters", price: "10 ICP" },
  { handle: "4 characters", price: "5 ICP" },
  { handle: "5 characters", price: "2 ICP" },
  { handle: "6–8 characters", price: "1 ICP" },
]

export default function TermsPage() {
  return (
    <div className="space-y-7">
      <div className="space-y-1.5">
        <h1 className="text-xl font-bold tracking-tight">Terms of Service</h1>
        <p className="text-xs text-muted-foreground">Last updated 2 August 2026</p>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">
        Read this before you send money. ICPay moves real ICP on a public
        blockchain, and the parts that cannot be undone are marked as such.
      </p>

      <Section title="1. What ICPay is">
        <p>
          ICPay is an open-source interface to a smart contract (a{" "}
          <em>canister</em>) running on the Internet Computer. It is not operated
          by an incorporated company, and no ICPay employee, support desk or
          account manager exists. It is software, published as source, that you
          choose to use.
        </p>
        <p>
          Because there is no legal entity behind it, there is nobody to sue, no
          insurance, and no deposit protection scheme. If that is not acceptable
          for the amount you intend to hold, do not hold it here.
        </p>
      </Section>

      <Section title="2. ICPay is custodial">
        <p>
          Your ICP is not held at your own principal. It sits in a subaccount of
          the ICPay canister that is derived from your principal, which means the
          canister&apos;s code — not your signature alone — is what moves it.
        </p>
        <p>
          The practical consequence: you are trusting the canister&apos;s code and
          whoever can upgrade it. Section 7 says exactly who that is. A
          self-custody wallet does not ask this of you; ICPay does, in exchange
          for being able to pay a username instead of a 63-character address.
        </p>
      </Section>

      <Section title="3. Signing in">
        <p>
          Authentication is Internet Identity only. ICPay never asks for, never
          receives and cannot store a password, private key or seed phrase.
        </p>
        <p>
          Your Internet Identity is the only way into your funds. If you lose
          access to it, your ICPay balance is unreachable — permanently. No
          recovery phrase for ICPay exists, and none can be created: your
          identity is derived by Internet Identity, and ICPay never holds a key
          that could reconstruct it. Set up Internet Identity&apos;s own recovery
          methods before you deposit anything.
        </p>
      </Section>

      <Section title="4. Transfers are final">
        <p>
          A confirmed ledger transfer cannot be reversed, cancelled or refunded
          by anyone, including whoever controls the canister. There is no
          chargeback and no dispute process.
        </p>
        <p>
          Check the recipient before confirming. Sending to a wrong-but-valid
          address means the money now belongs to whoever holds that address.
        </p>
      </Section>

      <Section title="5. Fees">
        <p>
          Sending, receiving and withdrawing cost ICPay nothing. The Internet
          Computer ledger charges its own fee of 0.0001 ICP per transfer,
          deducted from the sender. That fee goes to the ledger, not to ICPay.
        </p>
        <p>
          Usernames of 5 characters or more are free to claim. Shorter handles
          are sold, because short handles are the scarce inventory:
        </p>
        <div className="rounded-xl border">
          {FEES.map((fee) => (
            <div
              key={fee.handle}
              className="flex items-center justify-between border-b px-3.5 py-2.5 text-sm last:border-0"
            >
              <span className="text-muted-foreground">{fee.handle}</span>
              <span className="font-semibold text-foreground">{fee.price}</span>
            </div>
          ))}
        </div>
        <p>
          Username payments go to a treasury account fixed in the canister&apos;s
          source. They are final and non-refundable. The address is published on
          the{" "}
          <Link href="/transparency" className="underline underline-offset-2">
            Transparency
          </Link>{" "}
          page so you can confirm where your money went.
        </p>
      </Section>

      <Section title="6. Usernames">
        <Bullets
          items={[
            "1 to 8 characters, letters, numbers and underscores only. Case-insensitive, so Alice and alice are the same handle.",
            "A claim is permanent. There is no release, expiry or reclaim, and handles cannot be sold or transferred between accounts.",
            "Buying a new handle does not free your old one. Every handle you have ever held keeps pointing at you, so that anyone who memorised an old handle as your payment address still reaches you rather than a stranger who claimed it.",
            "A handle is a payment address, not a verified identity. It does not prove who someone is. Confirm out-of-band before sending a meaningful amount.",
          ]}
        />
      </Section>

      <Section title="7. Who can change the canister">
        <p>
          One principal is the canister&apos;s controller and can upgrade or stop
          it. That principal is published on the{" "}
          <Link href="/transparency" className="underline underline-offset-2">
            Transparency
          </Link>{" "}
          page, along with what it can and cannot do.
        </p>
        <p>
          The interface exposes no function that lets anyone move another
          user&apos;s funds — every transfer and withdrawal draws from the
          caller&apos;s own subaccount, and that is verifiable in the source. But
          a controller can deploy different code. Upgrade power is the trust you
          are extending, and it is not eliminated by the current code being
          honest.
        </p>
      </Section>

      <Section title="8. Nothing here is guaranteed">
        <p>
          ICPay is provided as-is, without warranty of any kind. It may contain
          bugs. It may be unavailable. The Internet Computer itself may fail or
          change. To the fullest extent permitted by law, no contributor is
          liable for any loss arising from your use of it — including lost funds.
        </p>
        <p>
          Cryptocurrency prices move. Prices shown in ICPay are indicative,
          sourced from a third-party feed, and are not an offer or a valuation.
        </p>
      </Section>

      <Section title="9. Acceptable use">
        <p>
          Do not use ICPay for anything unlawful in your jurisdiction, and do not
          use it if you are barred from using cryptocurrency services where you
          live. You are responsible for your own tax and reporting obligations —
          ICPay issues no statements and withholds nothing.
        </p>
        <p>
          Display names and transfer memos are permanent public records. Do not
          put anything in them you would not publish.
        </p>
      </Section>

      <Section title="10. Changes and contact">
        <p>
          These terms may change as the software does. The date at the top marks
          the current version, and the full history is in the public repository.
        </p>
        <p>
          Questions, security reports and bugs go to{" "}
          <a
            href="https://github.com/prasangapokharel/ICPay/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            GitHub issues
          </a>
          . There is no support email and no private channel.
        </p>
      </Section>

      <p className="border-t pt-5 text-xs leading-relaxed text-muted-foreground">
        This page describes how the software behaves. It is not legal advice.
      </p>
    </div>
  )
}
