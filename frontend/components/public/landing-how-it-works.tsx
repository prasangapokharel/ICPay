import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HOW_IT_WORKS_STEPS } from "@/lib/public/trust-links"

export function LandingHowItWorks() {
  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <div className="mb-10 max-w-2xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            How it works
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            How difficult is it to use?
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
            Not very. Six steps from Internet Identity sign-in to sending ICP by username — no
            browser extension and no mnemonic to write down.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <Card key={step.title} className="border-border/60 bg-card shadow-sm">
              <CardHeader className="pb-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  Step {index + 1}
                </p>
                <CardTitle className="text-base font-semibold leading-snug">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
