import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AlertCircleIcon,
  CheckmarkCircle02Icon,
  CloudIcon,
  MoneyBag02Icon,
  DatabaseIcon,
  ShieldIcon,
} from "@hugeicons/core-free-icons"

const rows = [
  {
    problem: {
      icon: MoneyBag02Icon,
      title: "Expensive Monthly Bills",
      description:
        "AWS S3, Google Cloud Storage, and Azure Blob charge monthly. Costs compound over years — a 10 GB project can exceed $240 over five years.",
    },
    solution: {
      icon: MoneyBag02Icon,
      title: "Simple 30-Day Plans",
      description:
        "Pay from your ICPay balance in ICP — from 0.5 ICP for 1 GB per 30 days. No credit card. Renew anytime and stack unused time.",
    },
  },
  {
    problem: {
      icon: DatabaseIcon,
      title: "Centralized Control",
      description:
        "Your files live on someone else's servers. Providers can suspend accounts, raise prices, or shut down services without notice.",
    },
    solution: {
      icon: ShieldIcon,
      title: "Decentralized & Censorship-Resistant",
      description:
        "Files are stored across Internet Computer replicas. No single point of failure — only you can delete your data.",
    },
  },
  {
    problem: {
      icon: AlertCircleIcon,
      title: "Complex Setup",
      description:
        "Setting up S3 requires an AWS account, IAM roles, bucket policies, and CORS config — just to upload a file.",
    },
    solution: {
      icon: CheckmarkCircle02Icon,
      title: "S3-Compatible API",
      description:
        "Drop-in replacement for S3 with familiar methods: createBucket, uploadFile, downloadFile. Migrate existing code in minutes.",
    },
  },
  {
    problem: {
      icon: CloudIcon,
      title: "Vendor Lock-in",
      description:
        "Each provider uses different APIs. Moving from S3 to Azure means rewriting code — no real portability.",
    },
    solution: {
      icon: CloudIcon,
      title: "On-Chain Verifiability",
      description:
        "Every upload is traceable on-chain. Content-addressable via canister URLs — immutable and auditable.",
    },
  },
] as const

function TopicCell({
  icon,
  title,
  description,
  tone,
}: {
  icon: typeof MoneyBag02Icon
  title: string
  description: string
  tone: "problem" | "solution"
}) {
  const iconClass = tone === "problem" ? "text-destructive" : "text-primary"

  return (
    <div className="flex gap-3 py-1">
      <HugeiconsIcon icon={icon} className={`mt-0.5 size-5 shrink-0 ${iconClass}`} />
      <div className="min-w-0 space-y-1">
        <p className="font-medium leading-snug">{title}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

export function ProblemSolution() {
  return (
    <section className="border-b border-border/60 bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 space-y-3 text-center md:mb-12">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              The Problem &amp; The Solution
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Traditional cloud storage is expensive, centralized, and complex. ICBucket fixes
              that with on-chain storage, 30-day ICP plans, and an S3-style API.
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-1/2 px-4 py-4 text-base font-semibold">
                    The Problem
                  </TableHead>
                  <TableHead className="w-1/2 border-l px-4 py-4 text-base font-semibold">
                    The Solution
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, index) => (
                  <TableRow key={index} className="align-top">
                    <TableCell className="whitespace-normal px-4 py-5">
                      <TopicCell {...row.problem} tone="problem" />
                    </TableCell>
                    <TableCell className="whitespace-normal border-l px-4 py-5">
                      <TopicCell {...row.solution} tone="solution" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </section>
  )
}
