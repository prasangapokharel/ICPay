import { BUCKET_CDN_ORIGIN, getBucketCdnBase } from "@/lib/bucket/cdn"
import { WALLET_CANISTER_ID } from "@/services/icp"

export type DocsExampleLang = "typescript" | "python" | "curl"

function cdnUrlTemplate(): string {
  const cdnBase = getBucketCdnBase()
  if (cdnBase) return `${BUCKET_CDN_ORIGIN}/{bucketName}{path}`
  return `https://${WALLET_CANISTER_ID}.raw.icp0.io/cloud/{bucketName}{path}`
}

function curlHost(): string {
  const cdnBase = getBucketCdnBase()
  if (cdnBase) return BUCKET_CDN_ORIGIN
  return `https://${WALLET_CANISTER_ID}.raw.icp0.io/cloud`
}

export function uploadExamples(): Record<DocsExampleLang, string> {
  const canister = WALLET_CANISTER_ID
  return {
    typescript: `import { prepareUploadFile } from "@/lib/bucket/prepare-upload"
import { storeFile } from "@/services/bucket/store-file"

const prepared = await prepareUploadFile(file)

// Chunked automatically — IC ingress is 2 MiB per call; max 10 MB per file
const result = await storeFile(identity, prepared.file, {
  bucketId,
  path: prepared.path,
  contentType: prepared.contentType,
  apiKey: "icp_cloud_…", // optional — for CI / automation
  onProgress: (pct) => console.log(\`\${pct}%\`),
})

if ("err" in result) throw new Error(result.err)`,

    python: `# Public CDN GET (no auth)
import requests

url = "${cdnUrlTemplate().replace("{path}", "/logo.webp").replace("{bucketName}", "my-bucket")}"
r = requests.get(url, timeout=30)
r.raise_for_status()
print(r.headers.get("content-type"), len(r.content))

# Upload: use dfx or the ICPay TypeScript SDK from Node.
# Small files only — large uploads need beginFileUpload + uploadFileChunk.`,
    curl: `# Verify a public file after upload — expect 200 and content-type
curl -sS -I "${curlHost()}/{bucketName}/logo.webp"

# Small upload with API key (single call, under 2 MiB ingress)
# Replace blob with base64 of your file bytes
dfx canister --network ic call ${canister} uploadFile \\
  '(record { bucketId = "…"; path = "/logo.webp"; blob = blob "\\00…"; contentType = "image/webp"; apiKey = opt "icp_cloud_…" })'`,
  }
}

export function downloadExamples(): Record<DocsExampleLang, string> {
  const cdnTs = getBucketCdnBase()
    ? `\`${BUCKET_CDN_ORIGIN}/\${bucketName}\${path}\``
    : `\`https://${WALLET_CANISTER_ID}.raw.icp0.io/cloud/\${bucketName}\${path}\``

  return {
    typescript: `import { downloadFileBlob } from "@/services/bucket/bucket"

// Public CDN (no auth) — bucket name in the URL
const url = ${cdnTs}
const res = await fetch(url) // e.g. /logo.webp at bucket root
const bytes = new Uint8Array(await res.arrayBuffer())

// Authenticated canister query (public + private buckets)
const blob = await downloadFileBlob(identity, bucketId, "/logo.webp")`,

    python: `import requests

# Public bucket — CDN URL uses bucket name, not bucket ID
url = "${cdnUrlTemplate().replace("{path}", "/logo.webp").replace("{bucketName}", "my-bucket")}"
r = requests.get(url, timeout=30)
r.raise_for_status()
with open("logo.webp", "wb") as f:
    f.write(r.content)`,

    curl: `# Public CDN — no Authorization header
curl -sS -o logo.webp \\
  "${curlHost()}/{bucketName}/logo.webp"

# Response headers only
curl -sS -I "${curlHost()}/{bucketName}/logo.webp"`,
  }
}

export function apiKeyExamples(): Record<DocsExampleLang, string> {
  const canister = WALLET_CANISTER_ID
  return {
    typescript: `import { createApiKey, deleteFile, revokeApiKey } from "@/services/bucket/bucket"

const created = await createApiKey(identity, bucketId, "CI deploy", {
  read: true,
  write: true,
  delete: false,
})

// Secret shown once — store it securely
const secret = created.ok.secret

await deleteFile(undefined, bucketId, "/old.webp", secret)
await revokeApiKey(identity, bucketId, created.ok.keyId)`,

    python: `# API keys are created in the ICPay UI or via canister update calls.
# Use the secret as the optional apiKey on uploadFile / deleteFile.

# Example: delete with dfx (pass secret in opt variant)
# dfx canister --network ic call ${canister} deleteFile \\
#   '(record { bucketId = "…"; path = "/old.webp"; apiKey = opt "icp_cloud_…" })'`,

    curl: `# Create key (signed in as bucket owner — Internet Identity delegation)
dfx canister --network ic call ${canister} createApiKey \\
  '(record { bucketId = "…"; name = "CI"; permissions = record { read = true; write = true; delete = false } })'

# Delete file with API key (no II session required)
dfx canister --network ic call ${canister} deleteFile \\
  '(record { bucketId = "…"; path = "/old.webp"; apiKey = opt "icp_cloud_…" })'`,
  }
}

export function cdnUrlExample(): string {
  return cdnUrlTemplate().replace("{path}", "/{filename}.webp")
}

export function curlVerifyExample(): string {
  return `# After upload — expect 200 and content-type: image/webp
curl -sS -I "${curlHost()}/{bucketName}/logo.webp"`
}
