import type { Metadata } from "next"
import Link from "next/link"
import { Section, Bullets } from "@/components/legal/prose"
import { Alert, AlertDescription } from "@/components/ui/alert"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What ICPay stores on the Internet Computer, what stays in your browser, and why on-chain records cannot be deleted.",
  alternates: { canonical: "/privacy" },
}

const ON_CHAIN = [
  {
    field: "Your principal",
    detail:
      "The identifier Internet Identity derives for you. It is how the canister knows which balance is yours.",
    source: "Derived",
  },
  {
    field: "Username",
    detail:
      "You choose it. Publicly searchable, and permanent — see below.",
    source: "You type it",
  },
  {
    field: "Display name",
    detail: "You choose it. Public. Changeable, but every past value stays in the chain's history.",
    source: "You type it",
  },
  {
    field: "Transaction records",
    detail:
      "Amount, fee, counterparty, block index and timestamp for every transfer, deposit and withdrawal.",
    source: "Derived",
  },
  {
    field: "Transfer memo",
    detail:
      "Optional free text you attach to a transfer, up to 32 bytes. Stored as written.",
    source: "You type it",
  },
  {
    field: "Account timestamps",
    detail: "When your account was created and last updated.",
    source: "Derived",
  },
]

export default function PrivacyPage() {
  return (
    <div className="space-y-7">
      <div className="space-y-1.5">
        <h1 className="text-xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-xs text-muted-foreground">Last updated 2 August 2026</p>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">
        ICPay collects no email, no phone number and no name. There is no
        account form. What it does store, it stores on a public blockchain, and
        that is a stronger commitment than most privacy policies describe —
        because it cannot be taken back.
      </p>

      <Alert>
        <AlertDescription className="text-sm leading-relaxed">
          Anything written to the Internet Computer is public and permanent.
          Your username, display name and transfer memos can be read by anyone
          and cannot be deleted by anyone — including whoever runs ICPay.
        </AlertDescription>
      </Alert>

      <Section title="What is stored on-chain">
        <div className="rounded-xl border">
          {ON_CHAIN.map((item) => (
            <div key={item.field} className="space-y-1 border-b px-3.5 py-3 last:border-0">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-medium text-foreground">{item.field}</p>
                <p className="shrink-0 text-[11px] text-muted-foreground">{item.source}</p>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">{item.detail}</p>
            </div>
          ))}
        </div>
        <p>
          Three of those are free text you type: username, display name and
          memo. Treat them as public writing. Do not put a real name, an email,
          a phone number or anything sensitive in a memo.
        </p>
      </Section>

      <Section title="Your profile is publicly queryable">
        <p>
          ICPay&apos;s user directory is readable without signing in. Anyone can
          call the canister to search usernames or resolve a username to a
          principal — that is what makes paying a handle work at all, and it
          also means your handle, display name and principal are discoverable by
          strangers.
        </p>
        <p>
          Balances are not listed in that directory, but ICP balances are
          readable from the public ledger by anyone who knows an address. This
          is a property of the blockchain, not a choice ICPay made.
        </p>
      </Section>

      <Section title="Deletion: what we cannot offer">
        <p>
          There is no delete button, and building one is not possible. The
          canister exposes no endpoint that erases a profile, a username or a
          transaction, and blockchain records are immutable by design. If a
          privacy law grants you a right to erasure, ICPay cannot honour it for
          on-chain data.
        </p>
        <p>
          Usernames in particular are permanent. A claimed handle maps to your
          principal forever, and buying a new one keeps the old one pointing at
          you as well. Stopping use of ICPay does not remove anything already
          written.
        </p>
        <p>
          The one thing you can change is your display name — but the previous
          value remains in the chain&apos;s history.
        </p>
      </Section>

      <Section title="What stays in your browser">
        <Bullets
          items={[
            "Your Internet Identity session, kept in IndexedDB by the Internet Identity library. This is what keeps you signed in. Signing out clears it.",
            "A theme preference in localStorage, so the app does not flash the wrong colour scheme on load.",
            "A small cache of account statistics under keys beginning icpay:stats:, so a profile shows real numbers instead of a skeleton while it reloads.",
          ]}
        />
        <p>
          Clearing your browser storage removes all of it. None of it is sent
          anywhere.
        </p>
      </Section>

      <Section title="No tracking">
        <p>
          ICPay runs no analytics, no advertising pixels, no session recording
          and no third-party trackers. It sets no cookies for its own purposes.
          Nobody is building a profile of your behaviour, because nothing is
          measuring it.
        </p>
      </Section>

      <Section title="Third parties your browser contacts">
        <Bullets
          items={[
            <>
              <span className="font-medium text-foreground">Internet Identity (id.ai)</span>{" "}
              — handles sign-in. It sees that you authenticated to ICPay. It is
              operated by the DFINITY Foundation under its own privacy terms.
            </>,
            <>
              <span className="font-medium text-foreground">Internet Computer (icp0.io)</span>{" "}
              — the network the canister runs on. Every action you take reaches
              it, along with your IP address, as with any website.
            </>,
            <>
              <span className="font-medium text-foreground">CoinGecko</span> —
              queried for the ICP price shown in the app. The request contains no
              identifier, no principal and no balance; it asks only what ICP is
              worth. Your IP address is visible to them, as with any request.
            </>,
          ]}
        />
        <p>
          The app also links out to the ICP Dashboard so you can inspect a
          transaction. Following such a link is a normal visit to their site.
        </p>
      </Section>

      <Section title="Where this page is served from">
        <p>
          The ICPay backend is a canister on the Internet Computer, and this
          interface is published to an asset canister too — so it can be loaded
          entirely from the chain. Most visitors, however, reach a copy hosted on
          Vercel, which sees your IP address and browser details when the page
          loads. The{" "}
          <Link href="/transparency" className="underline underline-offset-2">
            Transparency
          </Link>{" "}
          page lists both addresses.
        </p>
      </Section>

      <Section title="Children">
        <p>
          ICPay is not directed at anyone under 18 and no account should be
          created by one.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Privacy questions and security reports go to{" "}
          <a
            href="https://github.com/prasangapokharel/ICPay/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            GitHub issues
          </a>
          . Note that an issue is public.
        </p>
      </Section>

      <p className="border-t pt-5 text-xs leading-relaxed text-muted-foreground">
        This page describes how the software behaves. It is not legal advice.
      </p>
    </div>
  )
}
