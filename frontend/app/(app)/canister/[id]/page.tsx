import { CanisterDetailView } from "./canister-detail-view"

export function generateStaticParams() {
  return [{ id: "id" }]
}

export default function CanisterDetailPage() {
  return <CanisterDetailView />
}
