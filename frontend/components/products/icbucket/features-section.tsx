import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  FolderLibraryIcon,
  CloudUploadIcon,
  Key01Icon,
  Globe02Icon,
  CodeIcon,
  ShieldIcon,
  SearchList01Icon,
  DashboardSpeed01Icon,
} from "@hugeicons/core-free-icons"

export function FeaturesSection() {
  const features = [
    {
      icon: FolderLibraryIcon,
      title: "Flexible Capacity Tiers",
      description:
        "Choose from 1GB to 100GB. Start small, scale as needed. Renew anytime to extend storage duration.",
    },
    {
      icon: CloudUploadIcon,
      title: "Chunked Uploads",
      description:
        "Upload large files in chunks (up to 2MB per chunk). Parallel uploads for faster transfer. Resume on connection drop.",
    },
    {
      icon: Key01Icon,
      title: "API Key Management",
      description:
        "Create multiple API keys per bucket with granular permissions (read/write/delete). Revoke and regenerate anytime.",
    },
    {
      icon: Globe02Icon,
      title: "Public & Private Buckets",
      description:
        "Public buckets serve files via HTTPS. Private buckets require auth. Perfect for both static sites and secure backups.",
    },
    {
      icon: CodeIcon,
      title: "S3-Compatible API",
      description:
        "Drop-in replacement for AWS S3. Familiar methods: createBucket, uploadFile, listFiles. Migrate existing code in minutes.",
    },
    {
      icon: ShieldIcon,
      title: "On-Chain Security",
      description:
        "Files stored across IC replicas. Canister-level access control. No server breaches, no data leaks.",
    },
    {
      icon: SearchList01Icon,
      title: "File Metadata & Search",
      description:
        "Tag files, add custom metadata. Search by name, tag, or prefix. List folders, filter by date or size.",
    },
    {
      icon: DashboardSpeed01Icon,
      title: "Fast Content Delivery",
      description:
        "Files served directly from IC canisters. No CDN setup needed. Global distribution via IC boundary nodes.",
    },
  ]

  return (
    <section className="border-b border-border/60 bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Everything You Need for On-Chain Storage
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              ICBucket provides enterprise-grade cloud storage features without the enterprise
              complexity or monthly bills.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card key={index} className="border-muted transition-colors hover:border-primary/50">
                <CardHeader className="space-y-3">
                  <HugeiconsIcon icon={feature.icon} className="size-6 text-primary" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
