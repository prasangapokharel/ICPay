import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Internet Identity vs. Seed Phrases: Why Passkeys Are the Future of Crypto Security",
  description:
    "Internet Identity vs seed phrases — passkey crypto wallet security with Face ID and fingerprint. Why ICPay uses Internet Identity as the seed phrase alternative for safer crypto.",
  alternates: { canonical: "/blog/internet-identity-vs-seed-phrases" },
  openGraph: {
    title: "Internet Identity vs Seed Phrases — ICPay Blog",
    description: "Passkey crypto wallets replace seed phrases with biometric security on the Internet Computer.",
    type: "article",
    publishedTime: "2026-08-28T00:00:00Z",
  },
}

export default function InternetIdentityVsSeedPhrasesPage() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-medium text-primary uppercase tracking-widest">Security</p>
        <h1 className="text-2xl font-bold tracking-tight leading-snug">
          Internet Identity vs. Seed Phrases: Why Passkeys Are the Future of Crypto Security
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Seed phrases were designed for developers, not billions of users.{" "}
          <strong className="text-foreground">Internet Identity</strong> replaces them with passkeys —
          Face ID, fingerprint, or a hardware key — giving you a{" "}
          <strong className="text-foreground">passkey crypto wallet</strong> with nothing to write
          down and nothing to lose.
        </p>
        <p className="text-[11px] text-muted-foreground">August 28, 2026 · 6 min read</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">The seed phrase problem</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          A 12- or 24-word seed phrase is a single point of failure. Lose it and your funds are
          gone. Write it on paper and it can be stolen, photographed, or found after you move.
          Store it digitally and it becomes a phishing target. Billions of people use banking apps
          without memorizing cryptographic keys — crypto should not be harder than that.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">How Internet Identity works</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Internet Identity is the Internet Computer&apos;s native authentication system. You
          register a passkey tied to your device — Face ID on iPhone, fingerprint on Android, or a
          YubiKey. Each app gets a unique derived principal, so sites cannot track you across
          sessions. There is no password database to breach and no seed phrase to back up.{" "}
          <Link
            href="/blog/what-is-internet-identity"
            className="underline underline-offset-2 hover:text-foreground"
          >
            Full Internet Identity guide
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Internet Identity vs. seed phrases</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-3 font-semibold">Factor</th>
                <th className="text-left py-2 pr-3 font-semibold">Internet Identity</th>
                <th className="text-left py-2 font-semibold">Seed phrase</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b"><td className="py-2 pr-3">Login method</td><td className="py-2 pr-3 text-foreground">Biometric / hardware key</td><td className="py-2">12–24 words</td></tr>
              <tr className="border-b"><td className="py-2 pr-3">Recovery</td><td className="py-2 pr-3 text-foreground">Add another device</td><td className="py-2">Backup phrase only</td></tr>
              <tr className="border-b"><td className="py-2 pr-3">Phishing risk</td><td className="py-2 pr-3 text-foreground">Low (domain-bound)</td><td className="py-2">High</td></tr>
              <tr className="border-b"><td className="py-2 pr-3">User experience</td><td className="py-2 pr-3 text-foreground">Like a banking app</td><td className="py-2">Like a developer tool</td></tr>
              <tr><td className="py-2 pr-3">Used by ICPay</td><td className="py-2 pr-3 text-foreground font-medium">Yes</td><td className="py-2">No</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Why ICPay chose passkeys</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          ICPay is the{" "}
          <Link href="/blog/best-icp-wallet" className="underline underline-offset-2 hover:text-foreground">
            best ICP wallet
          </Link>{" "}
          for people who should never touch a seed phrase. Sign in once with Internet Identity, send
          ICP by username, and your principal is the only key that can authorize transfers from your
          subaccount. No email, no password, no 24 words on a sticky note.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          <Link href="/login" className="underline underline-offset-2 hover:text-foreground">
            Try ICPay with Internet Identity
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight">Frequently asked questions</h2>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Is Internet Identity a seed phrase alternative?</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Yes. It is the Internet Computer&apos;s built-in seed phrase alternative — passkey-based
              auth with per-app principals and no words to back up.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">What if I lose my phone?</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Add a second device to your Internet Identity anchor before you need it — another phone,
              laptop, or hardware key. Recovery is device-based, not phrase-based.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Related</p>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link href="/blog/what-is-internet-identity" className="underline underline-offset-2 text-muted-foreground hover:text-foreground">What is Internet Identity</Link>
          <span className="text-muted-foreground">·</span>
          <Link href="/blog/best-crypto-wallet" className="underline underline-offset-2 text-muted-foreground hover:text-foreground">Best Crypto Wallet</Link>
        </div>
      </section>
    </article>
  )
}
