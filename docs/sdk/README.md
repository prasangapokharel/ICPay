# ICPay Bucket SDK

Official clients for [ICPay Cloud](https://icpay.app/bucket) — on-chain file storage on the Internet Computer.

| Language | Package | Docs |
|---|---|---|
| TypeScript / Node | [`icpay-bucket`](https://www.npmjs.com/package/icpay-bucket) | [typescript/README.md](./typescript/README.md) |
| Python | [`icpay-bucket`](https://pypi.org/project/icpay-bucket/) | [python/README.md](./python/README.md) |

## Quick test

```bash
cd docs/sdk/test
npm install
export BUCKET_API_KEY="icp_cloud_…"
export BUCKET_ID="your-bucket-name"   # name from /bucket, not a display label
node typescript.mjs
```

`BUCKET_ID` is the **bucket name** (e.g. `my-app`) or internal id shown in the ICPay dashboard — not a folder path.

## API key vs Internet Identity

| Auth | Use for |
|---|---|
| **API key** (`icp_cloud_…`) | Upload, download, list, delete files in one bucket |
| **Internet Identity** | Create buckets, renew, manage API keys, owner-only calls |

Generate keys in **ICPay → Bucket → your bucket → API keys**.

## CDN URL

```ts
client.publicUrl(bucketId, "/file.txt")
// https://{canister}.raw.icp0.io/cloud/{bucketId}/file.txt?id={canister}
```

Public buckets serve files over HTTPS without a key.
