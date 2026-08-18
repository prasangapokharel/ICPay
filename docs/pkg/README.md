# ICPay Bucket SDK

Clients for the ICPay bucket canister on mainnet.

| Language | Install | Source |
|---|---|---|
| TypeScript | `npm install icpay-bucket` | `pkg/npm/icpay-bucket` |
| Python | `pip install icpay-bucket` | `pkg/py/icpay-bucket` |
| Go | `go get github.com/prasangapokharel/icpay-bucket-go@v1.1.0` | `pkg/go/icpay-bucket` |

**Version:** 1.1.0 · **Canister:** `6vbhm-nqaaa-aaaan-q6muq-cai`

## Docs

- [npm / TypeScript](./npm/README.md)
- [Python](./py/README.md)
- [Go](./go/README.md)

## Canister & CDN

| | |
|---|---|
| Backend canister | `6vbhm-nqaaa-aaaan-q6muq-cai` |
| Public CDN base | `https://6vbhm-nqaaa-aaaan-q6muq-cai.raw.icp0.io/cloud` |
| Example file | [icp/hello.txt](https://6vbhm-nqaaa-aaaan-q6muq-cai.raw.icp0.io/cloud/icp/hello.txt) |

`bucketId` accepts the public bucket name (e.g. `"icp"`) or the internal id.

## API keys

Create keys in the ICPay bucket UI (`icpay.app` → bucket → API keys).

| Scope | Allows |
|---|---|
| **read** | List, download, get metadata, search |
| **write** | Upload, move, copy, tags, metadata |
| **delete** | Delete, bulk delete |

Pass the secret as `apiKey` (npm/Go) or `api_key=` (Python), or set it on the client constructor.

## Live tests

From the repo root (requires `BUCKET_API_KEY` — see `pkg/readme`):

```bash
BUCKET_API_KEY=icp_cloud_… bash pkg/testing/run.sh
```

Runs npm (published package), Python (local client), and Go (local client) against mainnet bucket `icp`.

## Package coverage

| Feature group | npm | Python | Go |
|---|---|---|---|
| Bucket admin | ✓ | partial | — |
| File read | ✓ | ✓ | ✓ |
| File write | ✓ | ✓ | ✓ |
| Tags & metadata | ✓ | ✓ | ✓ |
| Bulk ops | ✓ | ✓ | ✓ |
| Chunked upload | ✓ | ✓ | ✓ |
| API key CRUD | ✓ | — | — |

npm is the most complete client. Go and Python cover the file API used by automation and CI.

## License

MIT
