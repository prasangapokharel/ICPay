import type { Metadata } from "next"
import Link from "next/link"
import { Section } from "@/components/legal/prose"

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to common questions about ICPay: how to send ICP by username, what a custodial wallet means, username prices, fees, recovery, and what happens if you lose your Internet Identity.",
  alternates: { canonical: "/faq" },
}

// Plain strings rather than JSX because the same answers are emitted as
// FAQPage structured data below, and Google reads the text, not the markup.
const FAQS = [
  {
    q: "What is ICPay?",
    a: "ICPay is an open-source wallet for the Internet Computer that lets you send and receive ICP using a username instead of a 63-character principal address. The balances are held by a canister — a smart contract — running on the Internet Computer itself.",
  },
  {
    q: "Do I need a seed phrase?",
    a: "No. You sign in with Internet Identity, using a passkey on your device or your Google account. ICPay never asks for, receives or stores a password, private key or seed phrase, so there is nothing to write down and nothing that can be phished from you.",
  },
  {
    q: "Is ICPay free?",
    a: "Sending, receiving and withdrawing cost ICPay nothing. The Internet Computer ledger charges its own fee of 0.0001 ICP per transfer, deducted from the sender; that goes to the ledger, not to ICPay. Usernames of five characters or more are free to claim.",
  },
  {
    q: "How much does a username cost?",
    a: "Five characters or more are free. Shorter handles are sold because they are the scarce inventory: 1 to 3 characters cost 10 ICP, 4 characters cost 5 ICP, 5 characters cost 2 ICP, and 6 to 8 characters cost 1 ICP. Payments go to a treasury address fixed in the canister source and are final.",
  },
  {
    q: "Can I change my username later?",
    a: "You can claim a new one, but your old handle is not released. Every handle you have ever held keeps pointing at your account, so anyone who saved an old handle as your payment address still reaches you rather than a stranger who claimed it afterwards.",
  },
  {
    q: "Is ICPay custodial or self-custodial?",
    a: "It is custodial. Your ICP sits in a subaccount of the ICPay canister derived from your principal, not at your own principal, which is what makes paying a username possible. Nothing is pooled — your subaccount address is a deterministic function of your identity, so your balance is separately readable on the public ledger.",
  },
  {
    q: "Can anyone else move my funds?",
    a: "No call in the canister's interface can do it. Every transfer and withdrawal derives its source account from the caller's own principal, and there is no parameter for a source account, so no request can be constructed that spends from someone else's balance. The controller can upgrade the canister's code, which is the trust you are extending; that is stated on the Transparency page.",
  },
  {
    q: "What happens if I lose my Internet Identity?",
    a: "Your ICPay balance becomes unreachable, permanently. No ICPay recovery phrase exists and none can be created, because ICPay never holds a key that could reconstruct your identity. Set up Internet Identity's own recovery methods before you deposit anything.",
  },
  {
    q: "Can I send ICP to someone who does not use ICPay?",
    a: "Yes. Withdraw to any ICP address and it settles on the ledger like any other transfer. Equally, anyone can pay you at your public link without having an ICPay account.",
  },
  {
    q: "Can I deposit from an exchange?",
    a: "Yes. Your deposit account is shown in both formats: the ICRC-1 address that Internet Computer wallets use, and the legacy account identifier that most exchanges require. Both name the same account, so use whichever the sender accepts.",
  },
  {
    q: "Can a transfer be reversed?",
    a: "No. A confirmed ledger transfer cannot be reversed, cancelled or refunded by anyone, including whoever controls the canister. There is no chargeback and no dispute process, so check the recipient before confirming.",
  },
  {
    q: "Is my transaction history public?",
    a: "Yes. Transfers settle on the public ICP ledger, and usernames, display names and transfer memos are stored permanently on-chain where anyone can read them. There is no delete endpoint, for you or for the operator. Do not put anything in a memo you would not publish.",
  },
  {
    q: "Which wallets can I sign in with?",
    a: "Internet Identity is the primary method and also covers passkeys and Google sign-in. NFID is offered as an alternative, but it is a separate identity system: it creates a different principal and therefore a different ICPay wallet with its own balance.",
  },
  {
    q: "Is ICPay open source?",
    a: "Yes. The full source of both the canister and this interface is public on GitHub, and the canister's live module hash can be checked against it on the ICP Dashboard.",
  },
] as const

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
}

export default function FaqPage() {
  return (
    <div className="space-y-7">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="space-y-1.5">
        <h1 className="text-xl font-bold tracking-tight">
          Frequently asked questions
        </h1>
        <p className="text-xs text-muted-foreground">
          What people ask before their first deposit
        </p>
      </div>

      <div className="space-y-6">
        {FAQS.map((faq) => (
          <Section key={faq.q} title={faq.q}>
            <p>{faq.a}</p>
          </Section>
        ))}
      </div>

      <p className="border-t pt-5 text-xs leading-relaxed text-muted-foreground">
        Still stuck? Open an issue on{" "}
        <a
          href="https://github.com/prasangapokharel/ICPay/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2"
        >
          GitHub
        </a>
        , or read the{" "}
        <Link href="/transparency" className="underline underline-offset-2">
          Transparency
        </Link>{" "}
        page for the addresses behind every claim here.
      </p>
    </div>
  )
}
