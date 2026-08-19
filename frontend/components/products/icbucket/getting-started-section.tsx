import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserIcon,
  FolderAddIcon,
  CloudUploadIcon,
  Key01Icon,
  FileDownloadIcon,
} from "@hugeicons/core-free-icons"

export function GettingStartedSection() {
  const steps = [
    {
      icon: UserIcon,
      title: "1. Sign In with Internet Identity",
      description:
        "Go to icpay.app and sign in with Internet Identity. No email, no password, just your device biometrics.",
      code: null,
    },
    {
      icon: FolderAddIcon,
      title: "2. Create a Bucket",
      description:
        "Navigate to /bucket and create your first bucket. Choose capacity (1GB-100GB) and visibility (public/private). Pay once in ICP.",
      code: `// Via Web UI
1. Go to icpay.app/bucket
2. Click "Create Bucket"
3. Name: my-app-storage
4. Capacity: 5GB
5. Visibility: Public
6. Pay 3 ICP → Done`,
    },
    {
      icon: Key01Icon,
      title: "3. Generate API Key",
      description:
        "Create an API key with read/write permissions. Copy the key - it's shown only once. Use it for programmatic access.",
      code: `// Via Web UI
1. Open your bucket
2. Go to "API Keys" tab
3. Click "Create Key"
4. Name: production-key
5. Permissions: read, write
6. Copy key → Save securely`,
    },
    {
      icon: CloudUploadIcon,
      title: "4. Upload Files",
      description:
        "Install the SDK and upload files. Supports single uploads (<2MB) or chunked uploads (>2MB). Files are immediately accessible.",
      code: `// Node.js / TypeScript
import { ICBucket } from 'icpay-bucket';

const bucket = new ICBucket({
  bucketId: 'your-bucket-id',
  apiKey: 'your-api-key'
});

await bucket.uploadFile('logo.png', fileBuffer, {
  contentType: 'image/png'
});`,
    },
    {
      icon: FileDownloadIcon,
      title: "5. Access Files",
      description:
        "Public files are accessible via HTTPS URLs. Private files require API key. Use downloadFile() method or direct URL.",
      code: `// Direct URL (public buckets)
https://6vbhm-nqaaa-aaaan-q6muq-cai.icp0.io/bucket/logo.png

// Programmatic (private buckets)
const file = await bucket.downloadFile('logo.png');`,
    },
  ]

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Get Started in 5 Minutes
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              From zero to storing files on-chain in just a few steps. No credit card, no AWS
              account, no complexity.
            </p>
          </div>

          <div className="space-y-6">
            {steps.map((step, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="flex flex-row items-center gap-4 space-y-0 bg-muted/30 pb-4">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <HugeiconsIcon icon={step.icon} className="size-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="mb-4 text-muted-foreground">{step.description}</p>
                  {step.code && (
                    <pre className="overflow-x-auto rounded-lg bg-muted p-4">
                      <code className="text-sm">{step.code}</code>
                    </pre>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 rounded-lg border border-primary/20 bg-primary/5 p-6">
            <h3 className="mb-3 text-lg font-semibold">Need Help?</h3>
            <p className="text-sm text-muted-foreground">
              Check out the full documentation at{" "}
              <a
                href="https://icpay.app/bucket/docs"
                className="font-medium text-primary underline underline-offset-4"
              >
                icpay.app/bucket/docs
              </a>{" "}
              or join our community on{" "}
              <a
                href="https://discord.gg/icpay"
                className="font-medium text-primary underline underline-offset-4"
              >
                Discord
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
