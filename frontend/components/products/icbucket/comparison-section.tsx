import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon, Cancel01Icon } from "@hugeicons/core-free-icons"

export function ComparisonSection() {
  const features = [
    { name: "Monthly Fees", icbucket: false, s3: true, gcs: true, azure: true },
    { name: "One-Time Payment", icbucket: true, s3: false, gcs: false, azure: false },
    { name: "Decentralized", icbucket: true, s3: false, gcs: false, azure: false },
    { name: "Censorship-Resistant", icbucket: true, s3: false, gcs: false, azure: false },
    { name: "On-Chain Verifiable", icbucket: true, s3: false, gcs: false, azure: false },
    { name: "No Account Suspension Risk", icbucket: true, s3: false, gcs: false, azure: false },
    { name: "S3-Compatible API", icbucket: true, s3: true, gcs: false, azure: false },
    { name: "Public HTTPS URLs", icbucket: true, s3: true, gcs: true, azure: true },
    { name: "API Key Auth", icbucket: true, s3: true, gcs: true, azure: true },
    { name: "Chunked Uploads", icbucket: true, s3: true, gcs: true, azure: true },
  ]

  const CheckIcon = () => (
    <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-5 text-green-500" />
  )
  const XIcon = () => <HugeiconsIcon icon={Cancel01Icon} className="size-5 text-red-500" />

  return (
    <section className="border-t bg-muted/30 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              How ICBucket Compares
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              ICBucket vs. traditional cloud storage providers. See what makes us different.
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[250px] text-center font-bold">Feature</TableHead>
                  <TableHead className="text-center font-bold">ICBucket</TableHead>
                  <TableHead className="text-center font-bold">AWS S3</TableHead>
                  <TableHead className="text-center font-bold">Google Cloud</TableHead>
                  <TableHead className="text-center font-bold">Azure Blob</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {features.map((feature, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-center font-medium">{feature.name}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        {feature.icbucket ? <CheckIcon /> : <XIcon />}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        {feature.s3 ? <CheckIcon /> : <XIcon />}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        {feature.gcs ? <CheckIcon /> : <XIcon />}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        {feature.azure ? <CheckIcon /> : <XIcon />}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-8 rounded-lg border border-primary/20 bg-primary/5 p-6">
            <h3 className="mb-3 text-lg font-semibold">5-Year Cost Comparison (10GB)</h3>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-primary">$3-5</div>
                <div className="text-sm text-muted-foreground">ICBucket (one-time)</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold">$240</div>
                <div className="text-sm text-muted-foreground">AWS S3 ($4/month)</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold">$300</div>
                <div className="text-sm text-muted-foreground">Google Cloud ($5/month)</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold">$360</div>
                <div className="text-sm text-muted-foreground">Azure Blob ($6/month)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
