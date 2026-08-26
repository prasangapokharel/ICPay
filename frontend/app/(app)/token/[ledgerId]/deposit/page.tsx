import { TokenDepositView } from "@/components/token/token-deposit-view"

export const instant = false

export function generateStaticParams() {
  return [{ ledgerId: "token" }]
}

export default function TokenDepositPage() {
  return <TokenDepositView />
}
