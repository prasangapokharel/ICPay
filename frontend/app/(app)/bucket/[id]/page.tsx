import { BucketDetail } from "./bucket-detail"

export const instant = false

export function generateStaticParams() {
  return [{ id: "id" }]
}

export default function BucketDetailPage() {
  return <BucketDetail />
}
