import { HugeiconsIcon } from "@hugeicons/react"
import {
  Layers01Icon,
  TerminalIcon,
  LinkSquare02Icon,
  Package01Icon,
} from "@hugeicons/core-free-icons"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

export function ProblemSolution() {
  const problems = [
    {
      title: "No standardized architecture",
      description:
        "Most Motoko projects start from scratch with no clear guidance on layering, testing, or deployment patterns. Teams reinvent structure every time.",
    },
    {
      title: "Scattered tooling",
      description:
        "Building an ICP app means juggling dfx, mops, npm, and custom scripts. No unified CLI for scaffolding, building, or deploying across environments.",
    },
    {
      title: "Frontend-backend integration complexity",
      description:
        "Connecting a Next.js frontend to a Motoko canister requires manual actor generation, identity management, and environment configuration.",
    },
    {
      title: "Limited starter templates",
      description:
        "Existing templates are either too minimal to be production-ready or too opinionated to adapt. No middle ground for real-world apps.",
    },
  ]

  const solutions = [
    {
      title: "Production-shaped layering",
      description:
        "Four-layer architecture (api → service → repository → storage) enforced from day one. Every module follows the same pattern, making onboarding and maintenance predictable.",
      icon: Layers01Icon,
    },
    {
      title: "Global falcon CLI",
      description:
        "One command to scaffold modules, install packages, build, test, and deploy. Works seamlessly across local and mainnet environments with interactive confirmations.",
      icon: TerminalIcon,
    },
    {
      title: "Integrated stack",
      description:
        "Motoko backend with mo:core, Next.js frontend with shadcn/ui, Internet Identity auth, and static export. Everything wired together out of the box.",
      icon: LinkSquare02Icon,
    },
    {
      title: "Hub ecosystem",
      description:
        "Install battle-tested packages from icp-hub with `falcon add pkg <name>`. Ledger integration, file storage, rate limiting, and more — plug and play.",
      icon: Package01Icon,
    },
  ]

  return (
    <section className="border-t bg-muted/20 px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight">
            Built to solve real problems
          </h2>
          <p className="text-lg text-muted-foreground">
            ICFalcon eliminates common friction points in ICP development
          </p>
        </div>

        <div className="grid gap-16 lg:grid-cols-2">
          <div>
            <h3 className="mb-8 text-xl font-semibold">The Problem</h3>
            <div className="space-y-6">
              {problems.map((item, i) => (
                <Card key={i} size="sm">
                  <CardHeader>
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-8 text-xl font-semibold">The Solution</h3>
            <div className="space-y-6">
              {solutions.map((item, i) => (
                <Card key={i} size="sm">
                  <CardHeader>
                    <CardTitle>
                      <HugeiconsIcon
                        icon={item.icon}
                        className="mr-2 inline-block size-5"
                      />
                      {item.title}
                    </CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
