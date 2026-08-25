# TypeScript SDK

```bash
npm install icpay-bucket
```

## Setup

```ts
import { BucketClient } from "icpay-bucket"

const client = new BucketClient({
  apiKey: process.env.BUCKET_API_KEY,
})
```

Use an Internet Identity `identity` instead of `apiKey` for owner calls (`createBucket`, `listBuckets`, API key management).

## Upload

```ts
const data = new TextEncoder().encode("file content")

const result = await client.uploadFile({
  bucketId: "icp",
  path: "/file.txt",
  data: new TextEncoder().encode("file content"),
  contentType: "text/plain",
})

if ("ok" in result) {
  console.log("Uploaded:", result.ok.path)
  console.log(client.publicUrl("icp", result.ok.path))
} else {
  console.error(result.err.code, result.err.message)
}
```

## Download

```ts
const result = await client.downloadFile("my-app", "/docs/file.txt")
if ("ok" in result) {
  console.log(new TextDecoder().decode(result.ok))
}
```

## List & search

```ts
await client.listFiles("my-app", 0, 50)
await client.listFolder("my-app", "/docs", 0, 50)
await client.searchFiles("my-app", "file.txt", 0, 20)
await client.fileExists("my-app", "/docs/file.txt")
```

## Update & tags

```ts
await client.updateFile("my-app", "/docs/file.txt", { contentType: "text/plain" })
await client.setFileTags("my-app", "/docs/file.txt", ["docs", "v1"])
await client.setFileMetadata("my-app", "/docs/file.txt", '{"version":1}')
```

## Move, copy, delete

```ts
await client.copyFile("my-app", "/a.txt", "/b.txt")
await client.moveFile("my-app", "/b.txt", "/archive/b.txt")
await client.deleteFile("my-app", "/archive/b.txt")

await client.bulkCopyFiles("my-app", [{ source: "/a.txt", destination: "/copy.txt" }])
await client.bulkDeleteFiles("my-app", ["/copy.txt"])
```

## Responses

Every method returns `ApiResult<T>`:

```ts
type ApiResult<T> = { ok: T } | { err: string }
```

Check `"ok" in result` before using the value.

## Limits

- Single upload max: **1.85 MB** (`SINGLE_MAX_BYTES`) — use chunked upload for larger files
- Path: absolute (`/folder/file.ext`), lowercase bucket names: `a-z`, `0-9`, `-`

## Run tests

```bash
cd ../test
BUCKET_API_KEY=… BUCKET_ID=my-app node typescript.mjs
```
