import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { BucketClient } from "icpay-bucket"

const root = dirname(fileURLToPath(import.meta.url))
const apiKey = process.env.BUCKET_API_KEY
const bucketId = process.env.BUCKET_ID ?? "icp"

if (!apiKey) {
  process.stderr.write("Set BUCKET_API_KEY\n")
  process.exit(1)
}

const client = new BucketClient({ apiKey })
const data = readFileSync(join(root, "file.txt"))
const base = `/sdk-test-${Date.now()}`
const path = `${base}/file.txt`
const copyPath = `${base}/file-copy.txt`
const movedPath = `${base}/file-moved.txt`

let passed = 0
let failed = 0

function unwrap(res) {
  if ("err" in res) throw new Error(`[${res.err.code}] ${res.err.message}`)
  return res.ok
}

async function run(name, fn) {
  try {
    await fn()
    passed += 1
    process.stdout.write(`✓ ${name}\n`)
  } catch (e) {
    failed += 1
    process.stderr.write(`✗ ${name} — ${e instanceof Error ? e.message : e}\n`)
  }
}

await run("getBucketCycleStatus", async () => {
  unwrap(await client.getBucketCycleStatus())
})

await run("getBucketPrice", async () => {
  unwrap(await client.getBucketPrice(1))
})

await run("uploadFile", async () => {
  const uploaded = unwrap(
    await client.uploadFile({ bucketId, path, data, contentType: "text/plain" })
  )
  if (uploaded.path !== path) throw new Error("path mismatch")
})

await run("fileExists", async () => {
  if (!unwrap(await client.fileExists(bucketId, path))) throw new Error("expected true")
})

await run("getFile", async () => {
  unwrap(await client.getFile(bucketId, path))
})

await run("downloadFile", async () => {
  const bytes = unwrap(await client.downloadFile(bucketId, path))
  if (bytes.byteLength !== data.byteLength) throw new Error("size mismatch")
})

await run("listFiles", async () => {
  unwrap(await client.listFiles(bucketId, 0, 20))
})

await run("listFolder", async () => {
  unwrap(await client.listFolder(bucketId, base, 0, 20))
})

await run("searchFiles", async () => {
  unwrap(await client.searchFiles(bucketId, "file.txt", 0, 20))
})

await run("getFileMetadata", async () => {
  unwrap(await client.getFileMetadata(bucketId, path))
})

await run("setFileMetadata", async () => {
  unwrap(await client.setFileMetadata(bucketId, path, '{"sdk":"test"}'))
})

await run("setFileTags", async () => {
  unwrap(await client.setFileTags(bucketId, path, ["sdk"]))
})

await run("copyFile", async () => {
  unwrap(await client.copyFile(bucketId, path, copyPath))
})

await run("moveFile", async () => {
  unwrap(await client.moveFile(bucketId, copyPath, movedPath))
})

await run("getPublicFileUrl", async () => {
  unwrap(await client.getPublicFileUrl(bucketId, path))
})

await run("deleteFile", async () => {
  unwrap(await client.deleteFile(bucketId, movedPath))
})

await run("bulkDeleteFiles", async () => {
  unwrap(await client.bulkDeleteFiles(bucketId, [path]))
})

process.stdout.write(`\n${passed} passed${failed ? `, ${failed} failed` : ""}\n`)
process.exit(failed > 0 ? 1 : 0)
