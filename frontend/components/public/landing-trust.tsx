import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TRUST_LINKS } from "@/lib/public/trust-links"

export function LandingTrust() {
  return (
    <section className="border-b border-border/60 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <div className="mb-10 max-w-2xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Social proof
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Can I trust it?
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
            ICPay is custodial and has not been audited — we say that plainly. What you can verify
            today is the open-source code, the mainnet canister, and the published transparency
            policy.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TRUST_LINKS.map((item) => {
            const content = (
              <Card className="h-full border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold leading-snug">{item.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                  <span className="mt-3 inline-flex text-sm font-semibold text-primary">
                    {item.external ? "Visit →" : "Read more →"}
                  </span>
                </CardContent>
              </Card>
            )

            if (item.external) {
              return (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block h-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {content}
                </a>
              )
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className="group block h-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {content}
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
