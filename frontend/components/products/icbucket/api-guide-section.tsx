"use client"

import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ApiGuideSection() {
  const t = useTranslations("publicSite.icbucket.apiGuide")

  const examples = {
    node: {
      install: `npm install icpay-bucket`,
      create: `import { ICBucket } from 'icpay-bucket';

// Initialize client
const bucket = new ICBucket({
  bucketId: 'your-bucket-id',
  apiKey: 'your-api-key'
});

// Create bucket (one-time)
const result = await bucket.create({
  name: 'my-storage',
  capacityGB: 5,
  visibility: 'public'
});`,
      upload: `// Upload single file (<2MB)
await bucket.uploadFile('logo.png', fileBuffer, {
  contentType: 'image/png',
  metadata: { version: '1.0' }
});

// Upload large file (chunked, >2MB)
const uploadId = await bucket.beginUpload({
  path: 'video.mp4',
  contentType: 'video/mp4',
  totalSize: 50 * 1024 * 1024 // 50MB
});

// Upload chunks (2MB each)
for (let i = 0; i < chunks.length; i++) {
  await bucket.uploadChunk(uploadId, i, chunks[i]);
}

// Complete upload
await bucket.completeUpload(uploadId);`,
      download: `// Download file
const file = await bucket.downloadFile('logo.png');

// Get public URL
const url = await bucket.getPublicUrl('logo.png');
// Returns: https://6vbhm-...-cai.icp0.io/bucket/logo.png

// List files
const files = await bucket.listFiles({
  page: 1,
  pageSize: 20
});`,
      manage: `// Delete file
await bucket.deleteFile('old-logo.png');

// Move file
await bucket.moveFile('temp/logo.png', 'assets/logo.png');

// Copy file
await bucket.copyFile('logo.png', 'logo-backup.png');

// Add tags
await bucket.addTags('logo.png', ['branding', 'v1']);

// Search files
const results = await bucket.searchFiles('logo');`,
    },
    python: {
      install: `pip install icpay-bucket`,
      create: `from icpay_bucket import ICBucket

# Initialize client
bucket = ICBucket(
    bucket_id='your-bucket-id',
    api_key='your-api-key'
)

# Create bucket (one-time)
result = bucket.create(
    name='my-storage',
    capacity_gb=5,
    visibility='public'
)`,
      upload: `# Upload single file (<2MB)
with open('logo.png', 'rb') as f:
    bucket.upload_file(
        path='logo.png',
        data=f.read(),
        content_type='image/png',
        metadata={'version': '1.0'}
    )

# Upload large file (chunked, >2MB)
upload_id = bucket.begin_upload(
    path='video.mp4',
    content_type='video/mp4',
    total_size=50 * 1024 * 1024  # 50MB
)

# Upload chunks (2MB each)
for i, chunk in enumerate(chunks):
    bucket.upload_chunk(upload_id, i, chunk)

# Complete upload
bucket.complete_upload(upload_id)`,
      download: `# Download file
file = bucket.download_file('logo.png')

# Get public URL
url = bucket.get_public_url('logo.png')
# Returns: https://6vbhm-...-cai.icp0.io/bucket/logo.png

# List files
files = bucket.list_files(page=1, page_size=20)`,
      manage: `# Delete file
bucket.delete_file('old-logo.png')

# Move file
bucket.move_file('temp/logo.png', 'assets/logo.png')

# Copy file
bucket.copy_file('logo.png', 'logo-backup.png')

# Add tags
bucket.add_tags('logo.png', ['branding', 'v1'])

# Search files
results = bucket.search_files('logo')`,
    },
    rust: {
      install: `cargo add icpay-bucket`,
      create: `use icpay_bucket::ICBucket;

// Initialize client
let bucket = ICBucket::new(
    "your-bucket-id",
    "your-api-key"
);

// Create bucket (one-time)
let result = bucket.create(
    "my-storage",
    5, // capacity_gb
    Visibility::Public
).await?;`,
      upload: `// Upload single file (<2MB)
bucket.upload_file(
    "logo.png",
    &file_bytes,
    "image/png",
    Some(metadata)
).await?;

// Upload large file (chunked, >2MB)
let upload_id = bucket.begin_upload(
    "video.mp4",
    "video/mp4",
    50 * 1024 * 1024 // 50MB
).await?;

// Upload chunks (2MB each)
for (i, chunk) in chunks.iter().enumerate() {
    bucket.upload_chunk(&upload_id, i, chunk).await?;
}

// Complete upload
bucket.complete_upload(&upload_id).await?;`,
      download: `// Download file
let file = bucket.download_file("logo.png").await?;

// Get public URL
let url = bucket.get_public_url("logo.png").await?;
// Returns: https://6vbhm-...-cai.icp0.io/bucket/logo.png

// List files
let files = bucket.list_files(1, 20).await?;`,
      manage: `// Delete file
bucket.delete_file("old-logo.png").await?;

// Move file
bucket.move_file("temp/logo.png", "assets/logo.png").await?;

// Copy file
bucket.copy_file("logo.png", "logo-backup.png").await?;

// Add tags
bucket.add_tags("logo.png", &["branding", "v1"]).await?;

// Search files
let results = bucket.search_files("logo").await?;`,
    },
  }

  return (
    <section className="border-b border-border/60 bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">{t("subtitle")}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("codeExamples")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="node" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="node">{t("nodeTab")}</TabsTrigger>
                  <TabsTrigger value="python">{t("pythonTab")}</TabsTrigger>
                  <TabsTrigger value="rust">{t("rustTab")}</TabsTrigger>
                </TabsList>

                {Object.entries(examples).map(([lang, code]) => (
                  <TabsContent key={lang} value={lang} className="space-y-6">
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">{t("installation")}</h3>
                      <pre className="overflow-x-auto rounded-lg bg-muted p-4">
                        <code className="text-sm">{code.install}</code>
                      </pre>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">{t("createInit")}</h3>
                      <pre className="overflow-x-auto rounded-lg bg-muted p-4">
                        <code className="text-sm">{code.create}</code>
                      </pre>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">{t("uploadFiles")}</h3>
                      <pre className="overflow-x-auto rounded-lg bg-muted p-4">
                        <code className="text-sm">{code.upload}</code>
                      </pre>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">{t("downloadAccess")}</h3>
                      <pre className="overflow-x-auto rounded-lg bg-muted p-4">
                        <code className="text-sm">{code.download}</code>
                      </pre>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">{t("fileManagement")}</h3>
                      <pre className="overflow-x-auto rounded-lg bg-muted p-4">
                        <code className="text-sm">{code.manage}</code>
                      </pre>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("apiKeyTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{t("apiKeyIntro")}</p>
                <ul className="space-y-1 text-sm">
                  <li>
                    <code className="rounded bg-muted px-1 py-0.5 text-xs">{t("permRead")}</code> -{" "}
                    {t("permReadDesc")}
                  </li>
                  <li>
                    <code className="rounded bg-muted px-1 py-0.5 text-xs">{t("permWrite")}</code> -{" "}
                    {t("permWriteDesc")}
                  </li>
                  <li>
                    <code className="rounded bg-muted px-1 py-0.5 text-xs">{t("permDelete")}</code> -{" "}
                    {t("permDeleteDesc")}
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground">{t("apiKeyFooter")}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("rateLimitsTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{t("rateLimitsIntro")}</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• {t("rateLimitUpload")}</li>
                  <li>• {t("rateLimitDownload")}</li>
                  <li>• {t("rateLimitList")}</li>
                  <li>• {t("rateLimitChunk")}</li>
                </ul>
                <p className="text-sm text-muted-foreground">{t("rateLimitsFooter")}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
