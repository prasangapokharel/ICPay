import { TransactionDetail } from "./transaction-detail"

export function generateStaticParams() {
  return [{ id: "id" }]
}

export default function TransactionDetailPage() {
  return <TransactionDetail />
}
