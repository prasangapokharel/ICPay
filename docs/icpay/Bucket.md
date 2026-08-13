# ICPay Cloud — Bucket Module

**Product name:** ICPay Cloud (Bucket storage)  
**Backend canister:** `6vbhm-nqaaa-aaaan-q6muq-cai`  
**Live app:** https://icpay.app/bucket  
**Last updated:** August 2026 (PR #50 — chunked uploads)

---

## 1. What this module does

ICPay Cloud is **encrypted file storage** built into the ICPay wallet canister. Users:

1. Pay ICP from their ICPay balance to create a **bucket** (a named storage container).
2. Upload files (images, documents, code, archives — **not video**).
3. Share public files via CDN-style URLs (`*.raw.icp0.io` or optional CDN proxy).
4. Renew buckets every 30 days (time stacks if renewed early).

Funds and files are real on-chain data. The frontend is a static export on Vercel; the bucket logic runs in Motoko on the backend canister.

---

## 2. Architecture overview

### 2.1 Backend — four layers (strict order)

Every request flows **downward only**. No layer may skip another.

```
┌─────────────────────────────────────────────────────────┐
│  api/v1/Bucket.mo          HTTP/Candid entry points     │
│  (thin handlers — no business logic)                    │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  services/BucketService.mo   Business rules, encryption, │
│  services/ApiKeyService.mo   rate limits, chunked upload │
│  services/CloudHttpService.mo  public HTTP serving      │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  repositories/BucketRepository.mo   Find/save buckets  │
│                                       and file metadata │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  storage/BucketStorage.mo    Stable maps: buckets,      │
│                              files, fileData (Blob),    │
│                              path index, API keys         │
└─────────────────────────────────────────────────────────┘
```

**Supporting modules (not in the stack):**

| Module | Role |
|--------|------|
| `config/Config.mo` | Limits, pricing constants, rate limits |
| `utils/FileValidator.mo` | Extension allow/block list, magic-byte checks |
| `utils/BlobUtil.mo` | Join/assemble `Blob` chunks (prefer Blob over `[Nat8]`) |
| `utils/BucketCrypto.mo` | Per-bucket encryption at rest |
| `utils/BucketUrls.mo` | Public CDN / raw URL construction |
| `types.mo` | `Bucket`, `StoredFile`, `FileUploadSession`, etc. |

The canister is a **`persistent actor`** (`main.mo`). Storage maps survive upgrades via orthogonal persistence.

---

### 2.2 Frontend — three layers

```
┌─────────────────────────────────────────────────────────┐
│  app/(app)/bucket/          Pages (list, detail, docs)   │
│  components/bucket/         UI (upload zone, files, keys)│
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  services/bucket/bucket.ts  Canister client (upload,     │
│                             list, renew, API keys)       │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  lib/bucket/                Pure helpers + upload logic  │
│    store-file.ts            storeFile() — main upload API│
│    upload-chunk.ts          Chunk size constants         │
│    prepare-upload.ts        Validate + path before upload│
│    allowed-files.ts         Extension/MIME allow lists   │
│    bucket.ts                Errors, formatting, helpers  │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Size limits — protocol vs product

These are **two different things**. Do not confuse them.

| Constant | Value | Meaning |
|----------|-------|---------|
| `IC_INGRESS_MAX_BYTES` | **2,097,152** (2 MiB) | **IC protocol hard cap** per update message. Cannot be changed in config. |
| `BUCKET_UPLOAD_CHUNK_BYTES` | **700,000** (~700 KB) | Each chunk in a chunked upload. Stays safely under 2 MiB with Candid overhead. |
| `BUCKET_UPLOAD_SINGLE_MAX` | **700,000** | Max size for direct `uploadFile()` (API/scripts). UI always chunks. |
| `BUCKET_MAX_FILE_BYTES` | **10,000,000** (10 MB) | **ICPay product cap** — max assembled file after all chunks are joined. |
| `HTTP_MAX_BODY_BYTES` | **1,900,000** | Max bytes per HTTP response chunk when serving files via `http_request`. |

**Why chunking exists:** A 5 MB PHP file sent in one call produces a ~3–5 MB Candid message → IC rejects it with HTTP 413 before the canister runs any code. Chunking splits the file into many small update calls; the canister reassembles them.

**IC theoretical max:** Stable memory allows up to ~500 GiB per canister. ICPay intentionally caps at 10 MB per file for billing and performance.

---

## 4. Upload flow (chunked — default path)

This is what the UI and `storeFile()` use for every upload.

```
 Browser                         Backend canister
 ───────                         ────────────────

 User picks file
      │
 prepareUploadFile()            (frontend only)
   · check extension
   · check size ≤ 10 MB
   · build path + MIME
      │
 storeFile() / uploadFile()
      │
 ┌────▼──────────────────────────────────────────────────┐
 │ 1. beginFileUpload(bucketId, path, mime, totalSize) │
 │    · auth (II principal or API key)                   │
 │    · validate extension, capacity, bucket not expired │
 │    · create transient FileUploadSession               │
 │    ← returns uploadId                                 │
 └────┬──────────────────────────────────────────────────┘
      │
 ┌────▼──────────────────────────────────────────────────┐
 │ 2. uploadFileChunk(uploadId, chunkBytes)  × N         │
 │    · each chunk ≤ 700 KB                              │
 │    · session.received += chunk.size                   │
 │    · append Blob to session.chunks[]                  │
 └────┬──────────────────────────────────────────────────┘
      │
 ┌────▼──────────────────────────────────────────────────┐
 │ 3. completeFileUpload(uploadId)                       │
 │    · verify received == totalSize                     │
 │    · BlobUtil.concat(chunks) → one Blob               │
 │    · uploadFileValidated() — see section 5            │
 │    ← returns fileId                                   │
 └───────────────────────────────────────────────────────┘
```

**Session lifetime:** Upload sessions are **transient** (lost on upgrade). Stale sessions are purged after 30 minutes (`BUCKET_UPLOAD_SESSION_TTL_NS`).

**Rate limit:** 40 upload calls per minute per principal (`RATE_BUCKET_UPLOAD`). A full 10 MB file uses ~17 calls (begin + ~15 chunks + complete).

---

## 5. Validation layers (where checks happen)

| Step | Location | What is checked |
|------|----------|-----------------|
| IC ingress | Internet Computer replica | Entire update message ≤ 2 MiB (before canister) |
| File picker | `frontend/lib/bucket/allowed-files.ts` | Extension allowed, video blocked |
| Prepare | `frontend/lib/bucket/prepare-upload.ts` | Same + size ≤ 10 MB |
| Begin upload | `BucketService.beginFileUpload` | Path, extension, total size, auth, capacity, bucket active |
| Each chunk | `BucketService.uploadFileChunk` | Chunk non-empty, ≤ 700 KB, cumulative ≤ declared size |
| Complete | `BucketService.uploadFileValidated` | Full blob: magic bytes, encrypt, persist |
| Single upload | `BucketService.uploadFile` | Blob ≤ 700 KB only (legacy/API path) |

**File types:** 80+ extensions allowed (images, docs, code, archives, audio, fonts). **Video is blocked** at extension and magic-byte level.

---

## 6. After upload — encryption and storage

Inside `uploadFileValidated()`:

1. **Normalize** content type via `FileValidator.normalizeUpload`.
2. **Derive** per-bucket encryption key: `BucketCrypto.deriveKey(owner, bucketId)`.
3. **Encrypt** plaintext → ciphertext Blob + fingerprint checksum.
4. **Save** metadata in `files` map, ciphertext in `fileData` map (both keyed by `fileId`).
5. **Index** path as `bucketId:path` → `fileId` for fast lookup.
6. **Update** bucket `storageUsed`.

Files are **never stored as plaintext** on the canister. Downloads decrypt on read.

---

## 7. Download and public URLs

### 7.1 Authenticated download (canister query)

```
downloadFile(identity, bucketId, path) → decrypted Blob
```

Used for private buckets or owner access.

### 7.2 Public CDN (anonymous HTTP)

Public buckets expose files via the canister's `http_request` handler (`CloudHttpService.mo`):

```
GET https://6vbhm-nqaaa-aaaan-q6muq-cai.raw.icp0.io/cloud/{bucketName}/{path}
```

- Path parsed by `BucketHttp` utils.
- File decrypted in chunks for large responses (under 2 MiB response limit per IC).
- Content-Type set from stored metadata.

The bucket detail page lets users toggle **Raw** vs **CDN** URL mode and copy the base URL.

---

## 8. API keys

Each bucket supports up to **10 API keys** with granular permissions:

| Permission | Allows |
|------------|--------|
| `read` | List/download |
| `write` | Upload (including chunked) |
| `delete` | Delete files |

Keys are created in the bucket detail UI (**Keys** button). The secret is shown once. Pass it as the optional last argument on `uploadFile`, `beginFileUpload`, `completeFileUpload`, or `deleteFile`.

---

## 9. Billing and lifecycle

| Concept | Value |
|---------|-------|
| Billing period | 30 days |
| Payment | Deducted from user's ICPay ICP balance |
| Pricing | Live from canister — cycle cost + 50% margin, 0.5 ICP steps |
| Capacity tiers | 1, 5, 10, 25, 50, 100, 250, 500 GB |
| Expired bucket | Read-only — renew to upload again |
| Renew | Stacks time onto remaining period |

---

## 10. Key files reference

### Backend

| File | Purpose |
|------|---------|
| `src/api/v1/Bucket.mo` | All bucket Candid endpoints |
| `src/services/BucketService.mo` | Core business logic (~1000 lines) |
| `src/services/CloudHttpService.mo` | Public HTTP file serving |
| `src/services/ApiKeyService.mo` | API key CRUD |
| `src/repositories/BucketRepository.mo` | Data access |
| `src/storage/BucketStorage.mo` | Stable storage maps |
| `src/config/Config.mo` | `BUCKET_*` constants |
| `src/utils/FileValidator.mo` | Type validation |
| `src/utils/BlobUtil.mo` | Blob concat for chunk assembly |
| `src/utils/BucketCrypto.mo` | Encrypt/decrypt |
| `testing/bucket/Flow.test.mo` | E2E including 2.5 MB chunked PHP upload |

### Frontend

| File | Purpose |
|------|---------|
| `lib/bucket/store-file.ts` | **`storeFile()`** — primary upload API |
| `lib/bucket/upload-chunk.ts` | Chunk constants (sync with Config.mo) |
| `lib/bucket/prepare-upload.ts` | Pre-upload validation |
| `lib/bucket/allowed-files.ts` | Allow/block extension lists |
| `services/bucket/bucket.ts` | Canister service wrapper |
| `services/wallet.ts` | Candid IDL including chunk methods |
| `app/(app)/bucket/[id]/bucket-detail.tsx` | Bucket detail + Keys + Renew |
| `components/bucket/bucket-upload-zone.tsx` | Drag/upload UI |

---

## 11. TypeScript usage example

```typescript
import { prepareUploadFile } from "@/lib/bucket/prepare-upload"
import { storeFile } from "@/lib/bucket/store-file"

// 1. Validate and prepare path/MIME
const prepared = await prepareUploadFile(file)

// 2. Upload — chunking is automatic (2 MiB IC ingress limit)
const result = await storeFile(identity, prepared.file, {
  bucketId: "your-bucket-id",
  path: prepared.path,
  contentType: prepared.contentType,
  onProgress: (pct) => console.log(`${pct}%`),
})

if ("err" in result) {
  throw new Error(result.err)
}

console.log("Uploaded file id:", result.ok)
```

Equivalent via the service layer:

```typescript
import { uploadFile } from "@/services/bucket/bucket"

await uploadFile(identity, bucketId, path, file, onProgress, contentType)
```

Both call the same chunked path internally.

---

## 12. Candid endpoints (summary)

| Method | Type | Description |
|--------|------|-------------|
| `createBucket` | update | Create bucket (paid) |
| `listBuckets` | query | List user's buckets |
| `getBucketStats` | query | Usage, expiry, file count |
| `getRenewQuote` | query | Renewal price |
| `renewBucket` | update | Extend 30 days |
| `beginFileUpload` | update | Start chunked upload → `uploadId` |
| `uploadFileChunk` | update | Send one chunk |
| `completeFileUpload` | update | Finalize and persist |
| `uploadFile` | update | Single-call upload (≤ 700 KB) |
| `deleteFile` | update | Remove file |
| `downloadFile` | query | Decrypted blob (auth) |
| `listFiles` | query | Paginated file list |
| `getPublicFileUrl` | query | CDN URL string |
| `createApiKey` | update | Create scoped key |
| `listApiKeys` | query | List keys (no secrets) |
| `revokeApiKey` | update | Revoke key |

---

## 13. Deploy checklist

| Step | Command | Notes |
|------|---------|-------|
| Backend tests | `npm run ci backend:test` | Must be 46/46 |
| Frontend build | `npm run ci frontend:build` | Typecheck + static export |
| Merge to `main` | PR → merge | Vercel auto-deploys frontend |
| **Backend deploy** | `npm run ci backend:deploy` | **Required** — chunk API lives on canister |
| Verify upload | Upload 5 MB `.php` on icpay.app | Should succeed after both deploys |

**Important:** Merging to `main` alone does **not** upgrade the canister. Without `backend:deploy`, chunked uploads fail because mainnet lacks `beginFileUpload` / `uploadFileChunk` / `completeFileUpload`.

---

## 14. Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `Message byte size … larger than max allowed 2097152` | Whole file sent in one IC call | Deploy frontend with `storeFile()` + backend with chunk API |
| `Upload failed` (generic) | Old canister without chunk methods | Run `backend:deploy` |
| `File too large — max 10 MB` | File exceeds product cap | Split file or increase cap in Config (requires deploy) |
| `Chunk too large` | Single chunk > 700 KB | Check `UPLOAD_CHUNK_BYTES` sync frontend/backend |
| `Rate limit` | > 40 upload calls/minute | Wait 60 seconds, retry |
| `Bucket expired` | 30-day period ended | Renew bucket from detail page |

---

## 15. Diagram — full system

```
                    ┌──────────────┐
                    │   Vercel     │
                    │  icpay.app   │
                    │  (frontend)  │
                    └──────┬───────┘
                           │ Internet Identity + agent
                           ▼
                    ┌──────────────┐
                    │   Backend    │
                    │   canister   │
                    │  (Motoko)    │
                    ├──────────────┤
                    │ BucketService│◄── chunked upload sessions (transient)
                    │ BucketStorage│◄── buckets, files, encrypted Blobs
                    │ CloudHttp    │◄── http_request for public files
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ICP Ledger    Stable memory   raw.icp0.io
        (payments)    (persistent)    (public GET)
```

---

*This document describes the Bucket module as shipped in PR #50. For operational commands see `docs/command/README.md`.*
