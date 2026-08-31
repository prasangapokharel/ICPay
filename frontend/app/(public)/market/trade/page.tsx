import type { Metadata } from "next"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { TradeTerminal } from "@/components/public/market/trade/trade-terminal"

export const metadata: Metadata = {
  title: "ICP Market Terminal — Live ICPSwap Pairs | ICPay",
  description:
    "Advanced ICP trading terminal with live ICPSwap prices, pool stats, and wallet swap execution on the Internet Computer.",
  openGraph: {
    title: "ICP Market Terminal | ICPay",
    description: "Live ICPSwap pair data and trading on ICPay.",
    url: "https://icpay.app/market/trade",
  },
}

function TerminalFallback() {
  return (
    <div className="space-y-3 p-4">
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-[60vh] w-full rounded-xl" />
    </div>
  )
}

export default function MarketTradePage() {
  return (
    <div className="h-[calc(100svh-3.5rem)] overflow-hidden">
      <Suspense fallback={<TerminalFallback />}>
        <TradeTerminal />
      </Suspense>
    </div>
  )
}
