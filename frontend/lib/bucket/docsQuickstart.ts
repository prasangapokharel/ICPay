export const BUCKET_SDK_INSTALL = {
  npm: "npm install icpay-bucket",
  pip: "pip install icpay-bucket",
} as const

export const BUCKET_TS_CLIENT = `import { ICBucket } from "icpay-bucket"

const bucket = new ICBucket({
  bucketId: "your-bucket-id",
  apiKey: "your-api-key",
})

await bucket.uploadFile("logo.png", fileBuffer, {
  contentType: "image/png",
})`

export const BUCKET_PY_CLIENT = `from icpay_bucket import BucketClient

client = BucketClient(
    api_key="your-api-key",
    bucket_id="your-bucket-id",
)

client.upload_file("logo.png", data, content_type="image/png")`
