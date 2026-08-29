import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const FEATURES = [
  {
    title: "Username payments",
    body: "Claim a handle and share icpay.app/yourname. Senders do not need an account or a 63-character principal.",
  },
  {
    title: "Internet Identity",
    body: "Sign in with a passkey or linked account. No seed phrase to write down and no browser extension required.",
  },
  {
    title: "Channels",
    body: "Telegram-style broadcast communities with public discovery, private invites, and markdown posts.",
  },
  {
    title: "ICBucket storage",
    body: "On-chain file storage with API keys and SDKs. Pay in ICP with simple 30-day plans instead of a card bill.",
  },
  {
    title: "ICFalcon framework",
    body: "Production Motoko scaffolding with enforced layering, tests, and a global CLI for Internet Computer apps.",
  },
  {
    title: "Transparent custody",
    body: "Funds sit in per-user subaccounts on the official ICP ledger. The backend is open source and upgrade-only on mainnet.",
  },
] as const

export function LandingFeatures() {
  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <div className="mb-10 max-w-2xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Platform
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Built for everyday users and ICP developers
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
            ICPay is more than a wallet. It is the entry point to payments, community, storage,
            and canister development on the Internet Computer.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="border-border/60 bg-card shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
