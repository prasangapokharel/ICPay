import type { Metadata } from "next"
import Link from "next/link"
import { Section, Bullets } from "@/components/legal/prose"

export const metadata: Metadata = {
  title: "About",
  description:
    "ICPay is an open-source ICP wallet that lets you send Internet Computer tokens to a username instead of a 63-character principal. Built on a canister, signed in with Internet Identity, no seed phrase.",
  alternates: { canonical: "/about" },
}

const STEPS = [
  {
    title: "Sign in",
    body: "Internet Identity authenticates you with a passkey or your Google account. No password is created and no seed phrase is written down, because ICPay never holds a key that could need one.",
  },
  {
    title: "Claim a username",
    body: "Your handle becomes your payment address. Five characters or more are free; shorter ones are sold because they are the scarce inventory.",
  },
  {
    title: "Get paid",
    body: "Anyone can open icpay.app/yourname and send you ICP without an account, and without ever typing a principal.",
  },
]

export default function AboutPage() {
  return (
    <div className="space-y-7">
      <div className="space-y-1.5">
        <h1 className="text-xl font-bold tracking-tight">About ICPay</h1>
        <p className="text-xs text-muted-foreground">
          Send ICP to a username, not a 63-character address
        </p>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">
        An Internet Computer address looks like{" "}
        <span className="font-mono text-xs break-all">
          or2yr-zj6k5-5gi2u-qo3tj-5pyn6-lbgwr-gqgpq-ubmff-ih4t4-yopxz-lqe
        </span>
        . Nobody reads that aloud, nobody types it from memory, and one wrong
        character sends money somewhere unrecoverable. ICPay exists so you can
        send to <span className="font-medium text-foreground">@satoshi</span>{" "}
        instead.
      </p>

      <Section title="How it works">
        <ol className="space-y-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                {i + 1}
              </span>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">{step.title}</p>
                <p className="text-sm leading-relaxed">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="What you can do with it">
        <Bullets
          items={[
            "Send and receive ICP by username, or by address when you need to.",
            "Share a payment link that opens for anyone, including people who have never used the Internet Computer.",
            "Deposit from any wallet or exchange — your account works with both the ICRC-1 and the legacy account-identifier format.",
            "Withdraw to any ICP address at any time. Nothing locks your funds in.",
            "Read your full history, with every transaction linked to its block on the public ledger.",
          ]}
        />
      </Section>

      <Section title="What it is built on">
        <p>
          The backend is a canister — a smart contract — running on the Internet
          Computer. It holds the balances, resolves usernames and calls the ICP
          ledger directly. There is no database and no server holding your money.
        </p>
        <p>
          The interface is published to an asset canister so it can be loaded
          from the chain itself, and mirrored on a conventional host for speed.
          Both addresses are listed on the{" "}
          <Link href="/transparency" className="underline underline-offset-2">
            Transparency
          </Link>{" "}
          page, and the whole thing is open source.
        </p>
      </Section>

      <Section title="The trade-off, stated plainly">
        <p>
          ICPay is custodial. Your ICP sits in a subaccount of the ICPay canister
          rather than at your own principal, which is what makes paying a
          username possible — but it also means the canister&apos;s code is what
          authorises a spend.
        </p>
        <p>
          Nothing is pooled: your subaccount is a deterministic function of your
          identity, so your balance is separately addressable and readable on the
          public ledger without asking ICPay anything. The{" "}
          <Link href="/transparency" className="underline underline-offset-2">
            Transparency
          </Link>{" "}
          page lists what the operator can and cannot do, and why.
        </p>
      </Section>

      <Section title="Who builds it">
        <p>
          ICPay is not an incorporated company. It is open-source software with
          no support desk and no account managers — questions, bugs and security
          reports go to{" "}
          <a
            href="https://github.com/prasangapokharel/ICPay/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            GitHub issues
          </a>
          , in public.
        </p>
      </Section>

      <p className="border-t pt-5 text-xs leading-relaxed text-muted-foreground">
        New here? The{" "}
        <Link href="/faq" className="underline underline-offset-2">
          FAQ
        </Link>{" "}
        answers the questions people ask before their first deposit.
      </p>
    </div>
  )
}
