# ICPay Cloud — On-Chain File Storage & API Keys

**Product:** ICPay Cloud (Bucket storage)  
**App:** https://icpay.app  
**Backend canister:** `6vbhm-nqaaa-aaaan-q6muq-cai`  
**Public file URLs:** `https://6vbhm-nqaaa-aaaan-q6muq-cai.raw.icp0.io/cloud/{bucketName}/{path}`  
**Last updated:** August 2026

---

# Part 1 — SEO article (share on X, blog, Square)

Use this section as a long-form post, thread source, or landing copy.  
**Short-tail keywords:** ICP storage · ICP cloud storage · Internet Computer storage · API keys · decentralized storage · on-chain storage · ICP wallet · file upload ICP · ICP CDN  

**Long-tail keywords:** how to upload files to Internet Computer · ICPay Cloud API keys for CI/CD · automated file upload Internet Computer · encrypted file storage ICP canister · public file URLs raw icp0.io · pay for storage with ICP · GitHub Actions upload Internet Computer · icp_cloud API key · on-chain file hosting IC · scoped bucket API keys · Internet Computer static assets · custodial ICP wallet storage

---

## ICP Cloud Storage: Encrypted Buckets, Public URLs, and API Keys on the Internet Computer

Most apps still store files on a central cloud you never audit. **ICPay Cloud** is different: your files live inside the ICPay backend canister on the **Internet Computer (ICP)** — encrypted at rest, billed in **ICP**, and reachable over ordinary **HTTP GET** when the bucket is public.

This guide covers what ICPay Cloud is, how **API keys** (`icp_cloud_*`) unlock automation, where developers use it, and how public URLs work today on **`*.raw.icp0.io`** (the live path — not a separate proxy domain).

---

## What is ICP cloud storage?

**ICP cloud storage** means file bytes are stored inside a smart contract (canister) on the Internet Computer, not on Amazon S3 or a private server. ICPay Cloud organizes that space into **buckets** — named containers you create from your ICPay wallet.

Each bucket has:

- A **capacity tier** (1 GB up to 500 GB)
- **Public or private** visibility
- A **30-day plan** paid from your ICPay balance (renew anytime; time stacks)
- **Per-bucket encryption** at rest

You upload through the app or through **API keys** for scripts and CI. Public files get a stable URL anyone can fetch with curl or a browser — no wallet required.

---

## Why developers care about on-chain file storage

| Benefit | What it means |
|--------|----------------|
| **Verifiable rules** | Upload, delete, and billing logic live in auditable canister code |
| **Pay in ICP** | No credit card — storage is a native token payment from ICPay |
| **Internet Identity** | Log in with passkeys; no seed phrase for everyday use |
| **Automation** | API keys upload and delete without an active II session |
| **Public HTTP** | Public buckets serve files over standard GET requests |
| **IC-native** | Static assets sit next to the canisters that power your IC app |

If you build on the **Internet Computer**, keeping logos, manifests, screenshots, and release artefacts on the same chain is simpler than wiring AWS into an ICP workflow.

---

## ICPay Cloud features (2026)

### Encrypted buckets

Every file is encrypted before it is written to stable memory. Each bucket derives its own key. Raw canister memory is not usable without decryption — even for operators reading chain state.

### File types and limits

Supported: **images, documents, code, archives, audio, and fonts** — 72 extensions in the allow list.  
**Max 10 MB per file** (about 9.5 MB in the UI hint). Large uploads are **chunked automatically** because the IC caps each update call at **2 MiB** ingress.

### Public vs private

- **Public bucket** — files are served anonymously via the canister HTTP handler. You get a copyable base URL.
- **Private bucket** — no public URL. Only the owner (Internet Identity) can download through the canister.

### Billing

- **30-day periods**, priced live from the canister (cycle cost + margin, rounded to 0.5 ICP steps)
- Tiers: **1, 5, 10, 25, 50, 100, 250, 500 GB**
- **Expired buckets** go read-only until you renew

### In-app experience

- Create buckets from **Settings → Bucket** or `/bucket`
- **Upload** opens a modal (chunked, with a preparing step for image optimization)
- **Keys** button manages API keys per bucket
- **Guide** links to TypeScript, Python, and curl examples

---

## Public URLs — how they work (raw canister)

Public files are served by the ICPay canister’s `http_request` handler. The URL format is:

```
https://6vbhm-nqaaa-aaaan-q6muq-cai.raw.icp0.io/cloud/{bucketName}/{path}
```

**Examples:**

```
https://6vbhm-nqaaa-aaaan-q6muq-cai.raw.icp0.io/cloud/my-brand/logo.webp
https://6vbhm-nqaaa-aaaan-q6muq-cai.raw.icp0.io/cloud/my-brand/docs/readme.pdf
```

- `{bucketName}` is the lowercase name you chose at creation (used in the path, not the internal bucket ID).
- `{path}` starts with `/` in the API but appears as `/filename.ext` in the URL after the bucket name.
- **No API key** and **no login** for GET on public buckets.
- Response includes correct **Content-Type** (e.g. `image/webp`, `image/png`).

Verify after upload:

```bash
curl -sS -I "https://6vbhm-nqaaa-aaaan-q6muq-cai.raw.icp0.io/cloud/my-brand/logo.webp"
# Expect: HTTP/2 200 and content-type: image/webp
```

> **Note:** A custom hostname proxy is planned for cleaner links. **Today, use the raw canister URL above** — it is what production serves and what you should put in READMEs, OG tags, and CI output.

---

## API keys — automate ICP storage without a wallet session

API keys are the feature that turns ICPay Cloud from “wallet UI only” into **programmable storage**.

### Key facts

| Item | Detail |
|------|--------|
| **Prefix** | `icp_cloud_` |
| **Shown** | Secret displayed **once** at creation — copy immediately |
| **Scope** | **One bucket per key** |
| **Limit** | Up to **10 active keys** per bucket |
| **Permissions** | **Read** · **Write (upload)** · **Delete** — any combination |
| **Revoke** | Owner revokes anytime from the bucket **Keys** modal |

### What each permission does

- **Write** — `beginFileUpload`, `uploadFileChunk`, `completeFileUpload`, and small `uploadFile` calls
- **Delete** — `deleteFile`
- **Read** — reserved for listing/download automation (public GET still needs no key)

Pass the secret as optional `apiKey` on upload and delete calls. The canister validates the hash, checks the bucket match, and enforces permissions — **no Internet Identity delegation required in CI**.

### TypeScript example (CI or Node)

```typescript
import { storeFile } from "@/lib/bucket/store-file"

const result = await storeFile(undefined, file, {
  bucketId: "your-bucket-id",
  path: "/release/logo.webp",
  contentType: "image/webp",
  apiKey: process.env.ICPAY_CLOUD_KEY, // icp_cloud_…
})

if ("err" in result) throw new Error(result.err)
```

### curl / dfx example (small file)

```bash
dfx canister --network ic call 6vbhm-nqaaa-aaaan-q6muq-cai deleteFile \
  '(record { bucketId = "…"; path = "/old.webp"; apiKey = opt "icp_cloud_…" })'
```

Chunked uploads for files larger than ~700 KB use `beginFileUpload` → multiple `uploadFileChunk` → `completeFileUpload` with the same optional API key on each step.

---

## Where to use ICPay Cloud API keys

### 1. CI/CD and GitHub Actions

After a build, push static assets to a public bucket and print the raw URL in the job log:

```
https://6vbhm-nqaaa-aaaan-q6muq-cai.raw.icp0.io/cloud/my-app/v1/app.js
```

Use a **Write-only** key labeled `github-actions`. Never commit the secret — store it in GitHub Secrets.

### 2. IC dApp static hosting

Host `logo.webp`, `manifest.json`, and social preview images on-chain. Link them from your canister frontend or documentation.

### 3. Bots and scheduled jobs

Refresh a chart PNG, status badge, or leaderboard export every hour. **Write** permission only; rotate the key if the runner is compromised.

### 4. Cleanup scripts

Delete temporary paths under `/tmp/` with a **Delete-only** key so a bug in upload code cannot overwrite production files.

### 5. Multi-environment keys

Separate keys per environment:

| Label | Permissions | Use |
|-------|-------------|-----|
| `staging-upload` | Write | Staging bucket only |
| `prod-upload` | Write | Production bucket |
| `nightly-cleanup` | Delete | Old artefacts |

Revoke one key without touching the others.

### 6. Creator and community assets

Public **WebP/PNG** logos, token icons, and media kits — share a single raw URL in Discord, X, or Square posts.

---

## ICP cloud storage vs traditional cloud

**AWS S3** wins on mature tooling, regional latency at huge scale, and penny-per-GB economics. **ICPay Cloud** wins when you want:

- Storage **on the Internet Computer** next to your canisters  
- **ICP-native billing** from an ICPay balance  
- **Passkey login** for humans and **API keys** for machines  
- **Auditable** upload/delete rules in Motoko  

For a global CDN at the lowest dollar cost, traditional cloud still leads. For **IC ecosystem apps, indie devs, and on-chain-first workflows**, ICPay Cloud is the practical choice.

---

## ICP storage vs IPFS and Arweave

| | IPFS / pinning | Arweave | ICPay Cloud |
|--|----------------|---------|-------------|
| Model | Content-addressed, peer/gateway | Pay-once permanent | Mutable paths, monthly capacity |
| URLs | CID + gateway | Arweave tx id | `…raw.icp0.io/cloud/name/file` |
| Private files | Possible with encryption | Uncommon | Native private buckets |
| Automation | Pinning services | Bundlers | `icp_cloud_*` API keys |
| Billing | Pinning subscription | One-time | ICP every 30 days |

ICPay Cloud behaves like a **bucket + HTTP** product developers already understand — not a CID workflow.

---

## How to get started

1. Sign in at **https://icpay.app** with **Internet Identity**  
2. Open **Settings → Bucket** (or `/bucket`)  
3. **Create a bucket** — pick name, size tier, public or private  
4. **Upload** from the bucket page (modal) or create an **API key** under **Keys**  
5. For public buckets, copy the **raw** base URL and append your file path  
6. Read the in-app **Guide** for TypeScript, Python, and curl samples  

Related reading on ICPay:

- Blog: **https://icpay.app/icp-cloud-storage**  
- Wallet guide: **https://icpay.app/best-icp-wallet**  
- What is ICP: **https://icpay.app/what-is-icp**

---

## X / social — ready-to-post snippets

**Hook (280 chars):**

> ICPay Cloud API keys are live. Upload files to the Internet Computer from CI — no wallet session. Keys look like `icp_cloud_*`, scoped per bucket (Write/Delete). Public files: `6vbhm-nqaaa-aaaan-q6muq-cai.raw.icp0.io/cloud/{name}/{file}` — icpay.app

**Hashtags (pick 8–12, not all):**

`#ICP #InternetComputer #Web3 #ICPAY #CloudStorage #DecentralizedStorage #APIKeys #DevTools #BuildOnIC #OnChain #FileStorage #Automation #CICD #Crypto #Blockchain #Web3Dev #DFINITY #ICPCommunity #StaticHosting #OpenSource`

---

## SEO keyword map (reference)

### Short-tail (head terms)

| Keyword | Intent |
|---------|--------|
| ICP storage | Brand + category discovery |
| ICP cloud storage | Product category |
| Internet Computer storage | Ecosystem search |
| ICP API keys | Developer feature |
| decentralized storage | Broad comparison |
| on-chain storage | Web3 infrastructure |
| ICP wallet | Wallet + storage crossover |
| ICP file upload | Action query |

### Long-tail (article targets)

- how to upload files to Internet Computer without seed phrase  
- ICPay Cloud API keys for GitHub Actions CI/CD  
- automated file upload Internet Computer canister  
- encrypted file storage on ICP canister 2026  
- public file URL Internet Computer raw icp0.io  
- pay for cloud storage with ICP token  
- icp_cloud API key write delete permissions  
- Internet Computer static asset hosting bucket  
- scoped API keys per bucket revoke anytime  
- chunked file upload Internet Computer 2 MiB limit  
- best ICP cloud storage for dApp developers  
- custodial ICP wallet with on-chain file storage  

---

# Part 2 — Technical reference (internal / developers)

---

## 1. What this module does

ICPay Cloud is **encrypted file storage** built into the ICPay wallet canister. Users:

1. Pay ICP from their ICPay balance to create a **bucket** (a named storage container).
2. Upload files (images, documents, code, archives — **not video**).
3. Share public files via **raw canister URLs** (`*.raw.icp0.io/cloud/...`).
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
| `utils/BucketUrls.mo` | Public URL construction |
| `types.mo` | `Bucket`, `StoredFile`, `FileUploadSession`, etc. |

The canister is a **`persistent actor`** (`main.mo`). Storage maps survive upgrades via orthogonal persistence.

---

### 2.2 Frontend — three layers

```
┌─────────────────────────────────────────────────────────┐
│  app/(app)/bucket/          Pages (list, detail, docs)   │
│  components/bucket/         UI (upload modal, files, keys)│
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

**Why chunking exists:** A 5 MB file sent in one call produces a ~3–5 MB Candid message → IC rejects it with HTTP 413 before the canister runs any code. Chunking splits the file into many small update calls; the canister reassembles them.

**IC theoretical max:** Stable memory allows up to ~500 GiB per canister. ICPay intentionally caps at 10 MB per file for billing and performance.

---

## 4. Upload flow (chunked — default path)

```
 Browser                         Backend canister
 ───────                         ────────────────

 User picks file
      │
 prepareUploadFile()            (frontend only)
   · check extension
   · check size ≤ 10 MB
   · build path + MIME
   · optional WebP compression (images)
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
 └────┬──────────────────────────────────────────────────┘
      │
 ┌────▼──────────────────────────────────────────────────┐
 │ 3. completeFileUpload(uploadId)                       │
 │    · BlobUtil.concat(chunks) → encrypt → persist      │
 │    ← returns fileId                                   │
 └───────────────────────────────────────────────────────┘
```

**Session lifetime:** Upload sessions are **transient** (lost on upgrade). Stale sessions purge after 30 minutes.

**Rate limit:** 40 upload calls per minute per principal.

---

## 5. Validation layers

| Step | Location | What is checked |
|------|----------|-----------------|
| IC ingress | Internet Computer replica | Entire update message ≤ 2 MiB |
| File picker | `allowed-files.ts` | Extension allowed |
| Prepare | `prepare-upload.ts` | Size ≤ 10 MB |
| Begin upload | `BucketService.beginFileUpload` | Path, auth, capacity, active bucket |
| Complete | `uploadFileValidated` | Magic bytes, encrypt, persist |

**File types:** 72 extensions (images, docs, code, archives, audio, fonts). Video blocked at extension and magic-byte level.

---

## 6. Download and public URLs

### Authenticated download

```
downloadFile(identity, bucketId, path) → decrypted Blob
```

### Public HTTP (anonymous GET)

```
GET https://6vbhm-nqaaa-aaaan-q6muq-cai.raw.icp0.io/cloud/{bucketName}/{path}
```

- Handled by `CloudHttpService.mo` via `http_request`
- Large files streamed in chunks (slice decrypt) to stay under IC response limits
- Content-Type from stored metadata

The bucket detail UI shows **Raw** URL mode by default. Use the canister subdomain URL in production.

---

## 7. API keys (technical)

| Permission | Allows |
|------------|--------|
| `write` | Upload (including chunked) |
| `delete` | Delete files |
| `read` | UI flag; public GET needs no key |

- Max **10 keys** per bucket (`BUCKET_MAX_API_KEYS`)
- Secret format: `icp_cloud_` + 32 hex chars (generated from owner + nonce + time)
- Stored as SHA-256 hash only — secret never persisted in plaintext
- Pass as optional `apiKey` on `uploadFile`, chunk methods, `deleteFile`

---

## 8. Billing and lifecycle

| Concept | Value |
|---------|-------|
| Billing period | 30 days |
| Payment | ICPay ICP balance |
| Pricing | Live — cycle cost + 50% margin, 0.5 ICP steps |
| Capacity tiers | 1, 5, 10, 25, 50, 100, 250, 500 GB |
| Expired bucket | Read-only until renew |

---

## 9. Key files reference

### Backend

| File | Purpose |
|------|---------|
| `src/api/v1/Bucket.mo` | Candid endpoints |
| `src/services/BucketService.mo` | Core logic |
| `src/services/CloudHttpService.mo` | Public HTTP serving |
| `src/services/ApiKeyService.mo` | API key CRUD |
| `src/config/Config.mo` | `BUCKET_*` constants |

### Frontend

| File | Purpose |
|------|---------|
| `lib/bucket/store-file.ts` | `storeFile()` — primary upload API |
| `components/bucket/bucket-upload-modal.tsx` | Upload modal |
| `app/(app)/bucket/[id]/bucket-detail.tsx` | Detail + Keys + Upload |
| `lib/bucket/cdn.ts` | URL helpers (default: raw canister) |

---

## 10. TypeScript usage

```typescript
import { prepareUploadFile } from "@/lib/bucket/prepare-upload"
import { storeFile } from "@/lib/bucket/store-file"

const prepared = await prepareUploadFile(file)

const result = await storeFile(identity, prepared.file, {
  bucketId: "your-bucket-id",
  path: prepared.path,
  contentType: prepared.contentType,
  apiKey: "icp_cloud_…", // optional
  onProgress: (pct) => console.log(`${pct}%`),
})

if ("err" in result) throw new Error(result.err)
```

---

## 11. Candid endpoints (summary)

| Method | Type | Description |
|--------|------|-------------|
| `createBucket` | update | Create bucket (paid) |
| `beginFileUpload` | update | Start chunked upload |
| `uploadFileChunk` | update | Send one chunk |
| `completeFileUpload` | update | Finalize and persist |
| `uploadFile` | update | Single-call upload (≤ 700 KB) |
| `deleteFile` | update | Remove file |
| `downloadFile` | query | Decrypted blob (auth) |
| `listFiles` | query | Paginated file list |
| `createApiKey` | update | Create scoped key |
| `revokeApiKey` | update | Revoke key |

---

## 12. Deploy checklist

| Step | Command |
|------|---------|
| Backend tests | `npm run ci backend:test` |
| Frontend build | `npm run ci frontend:build` |
| Backend deploy | `npm run ci backend:deploy` (TTY required) |

Merging frontend to `main` deploys Vercel only. **Canister upgrades need `backend:deploy`.**

---

## 13. System diagram

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
                    │ 6vbhm-nqaaa… │
                    ├──────────────┤
                    │ BucketService│◄── chunked upload sessions
                    │ BucketStorage│◄── encrypted Blobs
                    │ CloudHttp    │◄── http_request public GET
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ICP Ledger    Stable memory   raw.icp0.io
        (payments)    (persistent)    (public files)
```

---

*Part 1 is for marketing and SEO. Part 2 is the developer reference. For ops commands see `docs/command/README.md`.*
