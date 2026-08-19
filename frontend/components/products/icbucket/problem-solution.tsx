import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AlertCircleIcon,
  CheckmarkCircle02Icon,
  CloudIcon,
  MoneyBag02Icon,
  DatabaseIcon,
  ShieldIcon,
} from "@hugeicons/core-free-icons"

export function ProblemSolution() {
  const problems = [
    {
      icon: MoneyBag02Icon,
      title: "Expensive Monthly Bills",
      description:
        "AWS S3, Google Cloud Storage, Azure Blob charge monthly. Costs compound over years. A 10GB project costs $240+ over 5 years.",
    },
    {
      icon: DatabaseIcon,
      title: "Centralized Control",
      description:
        "Your files live on someone else's servers. They can suspend your account, raise prices, or shut down services without notice.",
    },
    {
      icon: AlertCircleIcon,
      title: "Complex Setup",
      description:
        "Setting up S3 requires AWS account, IAM roles, bucket policies, CORS config. Just to upload a file.",
    },
    {
      icon: CloudIcon,
      title: "Vendor Lock-in",
      description:
        "Each provider has different APIs. Moving from S3 to Azure means rewriting code. No portability.",
    },
  ]

  const solutions = [
    {
      icon: MoneyBag02Icon,
      title: "Pay Once, Store Forever",
      description:
        "No monthly fees. Pay 1-10 ICP once based on capacity (1GB-100GB). Your files stay on-chain as long as the canister has cycles.",
    },
    {
      icon: ShieldIcon,
      title: "Decentralized & Censorship-Resistant",
      description:
        "Files stored across Internet Computer replicas. No single point of failure. No one can delete your data except you.",
    },
    {
      icon: CheckmarkCircle02Icon,
      title: "S3-Compatible API",
      description:
        "Drop-in replacement for S3. Familiar methods: createBucket, uploadFile, downloadFile. Migrate existing code in minutes.",
    },
    {
      icon: CloudIcon,
      title: "On-Chain Verifiability",
      description:
        "Every file upload is traceable on-chain. Content-addressable via canister URLs. Immutable and auditable.",
    },
  ]

  return (
    <section className="border-t bg-muted/30 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="space-y-3">
                <h2 className="text-3xl font-bold tracking-tight">The Problem</h2>
                <p className="text-lg text-muted-foreground">
                  Traditional cloud storage is expensive, centralized, and complex.
                </p>
              </div>
              <div className="space-y-4">
                {problems.map((problem, index) => (
                  <Card key={index} className="border-destructive/20 bg-destructive/5">
                    <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-3">
                      <div className="rounded-lg bg-destructive/10 p-2">
                        <HugeiconsIcon
                          icon={problem.icon}
                          className="size-5 text-destructive"
                        />
                      </div>
                      <CardTitle className="text-base">{problem.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{problem.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <h2 className="text-3xl font-bold tracking-tight">The Solution</h2>
                <p className="text-lg text-muted-foreground">
                  ICBucket: On-chain storage with one-time payment and S3-compatible API.
                </p>
              </div>
              <div className="space-y-4">
                {solutions.map((solution, index) => (
                  <Card key={index} className="border-primary/20 bg-primary/5">
                    <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <HugeiconsIcon icon={solution.icon} className="size-5 text-primary" />
                      </div>
                      <CardTitle className="text-base">{solution.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{solution.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
