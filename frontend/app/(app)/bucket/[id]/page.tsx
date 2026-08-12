import { BucketDetail } from "./bucket-detail"

export function generateStaticParams() {
  return [{ id: "id" }]
}

export default function BucketDetailPage() {
  return <BucketDetail />
}
