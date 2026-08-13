import { WALLET_CANISTER_ID } from "@/services/icp"
import { rawCloudBase, rawCloudExample } from "@/lib/bucket/raw-cloud-url"

export type DocsExampleLang = "typescript" | "python" | "curl"

export function uploadExamples(): Record<DocsExampleLang, string> {
  const canister = WALLET_CANISTER_ID
  return {
    typescript: `import { prepareUploadFile } from "@/lib/bucket/prepare-upload"
import { storeFile } from "@/services/bucket/store-file"

const prepared = await prepareUploadFile(file)

// bucketId accepts the bucket name (e.g. "icp") or internal id
const result = await storeFile(identity, prepared.file, {
  bucketId: "icp",
  path: prepared.path,
  contentType: prepared.contentType,
  apiKey: "icp_cloud_…", // optional — CI / automation
  onProgress: (pct) => console.log(\`\${pct}%\`),
})

if ("err" in result) throw new Error(result.err)`,

    python: `# Public CDN GET (no auth) — raw canister URL
import requests

url = "${rawCloudExample("icp", "/logo.webp")}"
r = requests.get(url, timeout=30)
r.raise_for_status()
print(r.headers.get("content-type"), len(r.content))

# Upload: use dfx or the ICPay TypeScript SDK from Node.
# bucketId can be the public bucket name or internal id.`,
    curl: `# Verify a public file — expect 200 and content-type
curl -sS -I "${rawCloudExample("icp", "/logo.webp")}"

# Small upload with API key (single call, under 2 MiB ingress)
dfx canister --network ic call ${canister} uploadFile \\
  '(record { bucketId = "icp"; path = "/logo.webp"; blob = blob "\\00…"; contentType = "image/webp"; apiKey = opt "icp_cloud_…" })'`,
  }
}

export function downloadExamples(): Record<DocsExampleLang, string> {
  const urlTs = `\`${rawCloudExample("icp", "/logo.webp")}\``

  return {
    typescript: `// Public bucket — raw IC HTTP (no auth)
const url = ${urlTs}
const res = await fetch(url)
const bytes = new Uint8Array(await res.arrayBuffer())

// Authenticated canister query (public + private buckets)
import { downloadFileBlob } from "@/services/bucket/bucket"
const blob = await downloadFileBlob(identity, "icp", "/logo.webp")`,

    python: `import requests

url = "${rawCloudExample("icp", "/logo.webp")}"
r = requests.get(url, timeout=30)
r.raise_for_status()
with open("logo.webp", "wb") as f:
    f.write(r.content)`,

    curl: `# Public raw CDN — no Authorization header
curl -sS -o logo.webp \\
  "${rawCloudExample("icp", "/logo.webp")}"

curl -sS -I "${rawCloudExample("icp", "/logo.webp")}"`,
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

const secret = created.ok.secret // shown once

// bucketId can be bucket name ("icp") or internal id
await deleteFile(undefined, "icp", "/old.webp", secret)
await revokeApiKey(identity, bucketId, created.ok.keyId)`,

    python: `# Create keys in the ICPay UI or via canister update calls.
# Pass bucket name or id as bucketId; secret as apiKey on upload/delete.

# dfx canister --network ic call ${canister} deleteFile \\
#   '(record { bucketId = "icp"; path = "/old.webp"; apiKey = opt "icp_cloud_…" })'`,

    curl: `# Create key (signed in as bucket owner)
dfx canister --network ic call ${canister} createApiKey \\
  '(record { bucketId = "icp"; name = "CI"; permissions = record { read = true; write = true; delete = false } })'

# Delete with API key — no Internet Identity session
dfx canister --network ic call ${canister} deleteFile \\
  '(record { bucketId = "icp"; path = "/old.webp"; apiKey = opt "icp_cloud_…" })'`,
  }
}

export function cdnUrlExample(): string {
  return rawCloudExample("icp", "/logo.webp")
}

export function curlVerifyExample(): string {
  return `# After upload — expect 200 and content-type: image/webp
curl -sS -I "${rawCloudExample("icp", "/logo.webp")}"`
}
