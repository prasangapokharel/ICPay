import { WALLET_CANISTER_ID } from "@/services/icp"
import { rawCloudExample } from "@/lib/bucket/rawCloudUrl"
import type { DocsExampleLang } from "@/lib/bucket/docsExamples"

const CANISTER = WALLET_CANISTER_ID
const BUCKET = "icp"
const KEY = "icp_cloud_…"
const DFX = `dfx canister --network ic call ${CANISTER}`

export type ApiDocSection = {
  id: string
  titleKey:
    | "docsBucketsTitle"
    | "docsUploadChunkTitle"
    | "docsReadTitle"
    | "docsWriteTitle"
    | "docsTagsTitle"
    | "docsBulkTitle"
    | "docsApiKeysTitle"
  bodyKey?: "docsBulkBody" | "docsApiKeysBody"
  examples: () => Record<DocsExampleLang, string>
}

export function bucketLifecycleExamples(): Record<DocsExampleLang, string> {
  return {
    typescript: `import {
  createBucket,
  listBuckets,
  getBucketStats,
  getRenewQuote,
  renewBucket,
  getBucketCycleStatus,
} from "@/services/bucket/bucket"
import { getWalletActor } from "@/services/wallet"

await createBucket(identity, "${BUCKET}", 10, { Public: null })

const buckets = await listBuckets(identity)
const stats = await getBucketStats(identity, "${BUCKET}")
const quote = await getRenewQuote(identity, "${BUCKET}")
await renewBucket(identity, "${BUCKET}")

const actor = await getWalletActor(identity)
await actor.updateBucket("${BUCKET}", ["${BUCKET}-cdn"], [{ Public: null }])
await actor.deleteBucket("${BUCKET}")

const cycles = await getBucketCycleStatus(identity)`,
    python: `# Bucket lifecycle uses signed update/query calls via dfx or @dfinity/agent.
# bucketId accepts the public bucket name ("${BUCKET}") or internal id.`,
    curl: `# Price quote (no auth)
${DFX} getBucketPrice '(10: nat)' --query

# Create bucket (signed as owner)
${DFX} createBucket '("${BUCKET}", 10: nat, variant { Public })'

${DFX} listBuckets '()' --query
${DFX} getBucketStats '("${BUCKET}")' --query
${DFX} renewBucket '("${BUCKET}")'
${DFX} updateBucket '("${BUCKET}", opt "${BUCKET}-cdn", opt variant { Public })'
${DFX} deleteBucket '("${BUCKET}")'`,
  }
}

export function uploadSessionExamples(): Record<DocsExampleLang, string> {
  return {
    typescript: `import { prepareUploadFile } from "@/lib/bucket/prepareUpload"
import { storeFile } from "@/services/bucket/store-file"
import { getWalletActor } from "@/services/wallet"

const prepared = await prepareUploadFile(file)
await storeFile(identity, prepared.file, {
  bucketId: "${BUCKET}",
  path: prepared.path,
  contentType: prepared.contentType,
  apiKey: "${KEY}",
})

const actor = await getWalletActor(identity)
const begin = await actor.beginFileUpload(
  "${BUCKET}", "/big.zip", "application/zip", BigInt(file.size), ["${KEY}"]
)
if ("err" in begin) throw new Error(begin.err)
const uploadId = begin.ok
for (let i = 0; i < chunks.length; i++) {
  await actor.uploadFileChunkIndexed(uploadId, BigInt(i), chunks[i])
}
await actor.completeFileUpload(uploadId, ["${KEY}"])

await actor.getUpload(uploadId)
await actor.cancelUpload(uploadId)`,
    python: `# Chunked: beginFileUpload → uploadFileChunkIndexed → completeFileUpload`,
    curl: `# Small upload (≤ 2 MiB per call)
${DFX} uploadFile \\
  '("${BUCKET}", "/logo.webp", vec { … }, "image/webp", opt "${KEY}")'

# Chunked session
${DFX} beginFileUpload \\
  '("${BUCKET}", "/big.zip", "application/zip", 5_000_000 : nat, opt "${KEY}")'
${DFX} uploadFileChunkIndexed '("upload-id", 0: nat, vec { … })'
${DFX} completeFileUpload '("upload-id", opt "${KEY}")'

${DFX} getUpload '("upload-id")' --query
${DFX} cancelUpload '("upload-id")'`,
  }
}

export function readFileExamples(): Record<DocsExampleLang, string> {
  const url = rawCloudExample(BUCKET, "/hello.txt")
  return {
    typescript: `// Public bucket — raw IC HTTP
const res = await fetch("${url}")
const bytes = new Uint8Array(await res.arrayBuffer())

import { downloadFileBlob, listFiles, getPublicFileUrl } from "@/services/bucket/bucket"
import { getWalletActor } from "@/services/wallet"

const blob = await downloadFileBlob(identity, "${BUCKET}", "/hello.txt", "${KEY}")
const page = await listFiles(identity, "${BUCKET}", 0, 20, "${KEY}")
const cdnUrl = await getPublicFileUrl(identity, "${BUCKET}", "/hello.txt")

const actor = await getWalletActor(identity)
await actor.getFile("${BUCKET}", "/hello.txt", ["${KEY}"])
await actor.fileExists("${BUCKET}", "/hello.txt", ["${KEY}"])
await actor.listFolder("${BUCKET}", "/", BigInt(0), BigInt(20), ["${KEY}"])
await actor.searchFiles("${BUCKET}", "hello", BigInt(0), BigInt(20), ["${KEY}"])`,
    python: `import requests
r = requests.get("${url}", timeout=30)
r.raise_for_status()`,
    curl: `# Public CDN GET
curl -sS "${url}"

# Canister queries (owner or read API key)
${DFX} downloadFile '("${BUCKET}", "/hello.txt", opt "${KEY}")' --query
${DFX} listFiles '("${BUCKET}", 0: nat, 20: nat, opt "${KEY}")' --query
${DFX} getFile '("${BUCKET}", "/hello.txt", opt "${KEY}")' --query
${DFX} fileExists '("${BUCKET}", "/hello.txt", opt "${KEY}")' --query
${DFX} listFolder '("${BUCKET}", "/", 0: nat, 20: nat, opt "${KEY}")' --query
${DFX} searchFiles '("${BUCKET}", "hello", 0: nat, 20: nat, opt "${KEY}")' --query`,
  }
}

export function writeFileExamples(): Record<DocsExampleLang, string> {
  return {
    typescript: `import { deleteFile } from "@/services/bucket/bucket"
import { getWalletActor } from "@/services/wallet"

await deleteFile(identity, "${BUCKET}", "/old.webp", "${KEY}")

const actor = await getWalletActor(identity)
// updateFile name changes display name; path stays the storage key unless you moveFile
await actor.updateFile("${BUCKET}", "/logo.webp", ["hero.webp"], ["image/webp"], [], ["${KEY}"])
await actor.moveFile("${BUCKET}", "/draft.webp", "/live.webp", ["${KEY}"])
await actor.copyFile("${BUCKET}", "/logo.webp", "/backup/logo.webp", ["${KEY}"])`,
    python: `# Pass apiKey as the last optional argument on write/delete calls.`,
    curl: `${DFX} updateFile \\
  '("${BUCKET}", "/logo.webp", opt "hero.webp", opt "image/webp", null, opt "${KEY}")'

${DFX} moveFile '("${BUCKET}", "/draft.webp", "/live.webp", opt "${KEY}")'
${DFX} copyFile '("${BUCKET}", "/logo.webp", "/backup/logo.webp", opt "${KEY}")'
${DFX} deleteFile '("${BUCKET}", "/old.webp", opt "${KEY}")'`,
  }
}

export function tagsMetadataExamples(): Record<DocsExampleLang, string> {
  return {
    typescript: `import { getWalletActor } from "@/services/wallet"

const actor = await getWalletActor(identity)
await actor.setFileTags("${BUCKET}", "/hello.txt", ["hero", "homepage"], ["${KEY}"])
await actor.addFileTags("${BUCKET}", "/hello.txt", ["marketing"], ["${KEY}"])
await actor.removeFileTags("${BUCKET}", "/hello.txt", ["draft"], ["${KEY}"])
await actor.setFileMetadata("${BUCKET}", "/hello.txt", '{"alt":"ICPay logo"}', ["${KEY}"])
await actor.getFileMetadata("${BUCKET}", "/hello.txt", ["${KEY}"])`,
    python: `# Metadata is a JSON string. Tags are text labels.`,
    curl: `${DFX} setFileTags '("${BUCKET}", "/hello.txt", vec { "hero"; "homepage" }, opt "${KEY}")'
${DFX} setFileMetadata '("${BUCKET}", "/hello.txt", "{\\"alt\\":\\"ICPay logo\\"}", opt "${KEY}")'
${DFX} getFileMetadata '("${BUCKET}", "/hello.txt", opt "${KEY}")' --query`,
  }
}

export function bulkFileExamples(): Record<DocsExampleLang, string> {
  return {
    typescript: `import { getWalletActor } from "@/services/wallet"

const actor = await getWalletActor(identity)
await actor.bulkDeleteFiles("${BUCKET}", ["/a.webp", "/b.webp"], ["${KEY}"])
await actor.bulkMoveFiles("${BUCKET}", [
  { source: "/draft/a.webp", destination: "/live/a.webp" },
], ["${KEY}"])
await actor.bulkCopyFiles("${BUCKET}", [
  { source: "/logo.webp", destination: "/mirror/logo.webp" },
], ["${KEY}"])`,
    python: `# Max 20 paths or operations per bulk call.`,
    curl: `${DFX} bulkDeleteFiles \\
  '("${BUCKET}", vec { "/a.webp"; "/b.webp" }, opt "${KEY}")'

${DFX} bulkMoveFiles \\
  '("${BUCKET}", vec { record { source = "/draft/a.webp"; destination = "/live/a.webp" } }, opt "${KEY}")'

${DFX} bulkCopyFiles \\
  '("${BUCKET}", vec { record { source = "/logo.webp"; destination = "/mirror/logo.webp" } }, opt "${KEY}")'`,
  }
}

export function apiKeyFullExamples(): Record<DocsExampleLang, string> {
  return {
    typescript: `import {
  createApiKey,
  listApiKeys,
  getApiKey,
  updateApiKey,
  regenerateApiKey,
  revokeApiKey,
  listFiles,
  deleteFile,
} from "@/services/bucket/bucket"
import { AnonymousIdentity } from "@icp-sdk/core/agent"

const created = await createApiKey(identity, "${BUCKET}", "CI deploy", {
  read: true,
  write: true,
  delete: false,
})
const secret = created.ok.secret

const anon = new AnonymousIdentity()
await listFiles(anon, "${BUCKET}", 0, 20, secret)
await deleteFile(anon, "${BUCKET}", "/old.webp", secret)
await revokeApiKey(identity, "${BUCKET}", created.ok.keyId)`,
    python: `# read → list/download/get/search
# write → upload/update/move/copy/tags/metadata
# delete → deleteFile, bulkDeleteFiles`,
    curl: `${DFX} createApiKey \\
  '("${BUCKET}", "CI", record { read = true; write = true; delete = false })'

${DFX} listApiKeys '("${BUCKET}")' --query
${DFX} getApiKey '("${BUCKET}", "key-id")' --query
${DFX} updateApiKey \\
  '("${BUCKET}", "key-id", opt "CI read-only", opt record { read = true; write = false; delete = false })'
${DFX} regenerateApiKey '("${BUCKET}", "key-id")'
${DFX} revokeApiKey '("${BUCKET}", "key-id")'`,
  }
}

export function apiDocSections(): ApiDocSection[] {
  return [
    { id: "buckets", titleKey: "docsBucketsTitle", examples: bucketLifecycleExamples },
    { id: "upload", titleKey: "docsUploadChunkTitle", examples: uploadSessionExamples },
    { id: "read", titleKey: "docsReadTitle", examples: readFileExamples },
    { id: "write", titleKey: "docsWriteTitle", examples: writeFileExamples },
    { id: "tags", titleKey: "docsTagsTitle", examples: tagsMetadataExamples },
    { id: "bulk", titleKey: "docsBulkTitle", bodyKey: "docsBulkBody", examples: bulkFileExamples },
    { id: "keys", titleKey: "docsApiKeysTitle", bodyKey: "docsApiKeysBody", examples: apiKeyFullExamples },
  ]
}
