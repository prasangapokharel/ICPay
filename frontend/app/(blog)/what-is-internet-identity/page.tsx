import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "What is Internet Identity? Internet Computer Login Explained",
  description:
    "Internet Identity is the passkey-based login system of the Internet Computer. How it works, why there is no password or seed phrase, and why ICPay uses it.",
  alternates: { canonical: "/what-is-internet-identity" },
  openGraph: {
    title: "What is Internet Identity? — ICPay Blog",
    description:
      "The Internet Computer's passkey login, explained: no passwords, no seed phrases, anonymous by default.",
    type: "article",
    publishedTime: "2026-08-10T00:00:00Z",
  },
}

export default function WhatIsInternetIdentityPage() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-medium text-primary uppercase tracking-widest">Guide</p>
        <h1 className="text-2xl font-bold tracking-tight leading-snug">
          What is Internet Identity? The Internet Computer Login, Explained
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Internet Identity is how people sign in to apps on the Internet Computer — and it is
          unlike any login you have used before. No password to forget, no seed phrase to lose,
          and every app sees you as a different anonymous identity.
        </p>
        <p className="text-[11px] text-muted-foreground">August 10, 2026 · 5 min read</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">The problem with passwords and seed phrases</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Passwords are the weakest link in the web. People reuse them, phishing sites steal
          them, and a leaked database exposes accounts in bulk. Crypto tried to fix that with
          seed phrases — but a 12-word phrase is a different kind of burden: written down once,
          hidden forever, and impossible to recover if lost.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Internet Identity replaces both with a private key stored in your device&apos;s
          secure enclave, unlocked by Face ID, Touch ID, or a hardware key.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">How Internet Identity works</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          When you create an Internet Identity, your device generates a key pair. The private key
          never leaves the device — it is protected by your passkey and the Secure Enclave. The
          public part is registered on the Internet Computer as an anchor.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Each app gets a <strong className="text-foreground">different derived principal</strong>{" "}
          from the same anchor. Logging into two apps with one Internet Identity looks like two
          completely different users to those apps. That means apps cannot track you across
          services — and no app ever learns your real identity.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Why there is nothing to back up</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          With a seed phrase, losing the paper means losing the wallet. With Internet Identity,
          the key lives in the device you already carry. If you lose the device, you can recover
          the same anchor by using a pre-registered recovery device — a second phone, a laptop,
          or a hardware security key.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          There is no email, no password, and no seed phrase — nothing for a hacker to phish and
          nothing for a user to lose.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Internet Identity and ICPay</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          ICPay uses Internet Identity exclusively. The wallet account you see is derived from
          your principal, which is derived from your device credential. Your ICP lives in a
          subaccount only your principal can control — ICPay cannot move it without your passkey
          signing the call.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Custodial on the ledger, but unkillable by design: the canister follows the same
          consensus rules as the ICP ledger itself. You get the convenience of a hosted wallet
          with none of the password-recovery horror stories.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Getting started</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Signing in with Internet Identity takes seconds: visit the login page, follow the
          passkey prompt, and you are in. No form to fill, no phrase to save.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Curious about the platform behind it? Read{" "}
          <Link href="/what-is-icp" className="underline underline-offset-2 hover:text-foreground">
            what is ICP
          </Link>{" "}
          or see where the Internet Computer fits in our{" "}
          <Link href="/best-crypto-wallet" className="underline underline-offset-2 hover:text-foreground">
            crypto wallet guide
          </Link>.
        </p>
      </section>
    </article>
  )
}