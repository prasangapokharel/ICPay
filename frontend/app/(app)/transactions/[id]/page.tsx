import { TransactionDetail } from "./transaction-detail"

export const instant = false

export function generateStaticParams() {
  return [{ id: "id" }]
}

export default function TransactionDetailPage() {
  return <TransactionDetail />
}
