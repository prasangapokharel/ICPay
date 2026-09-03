import { formatTokenAmount } from "@/lib/wallet/utils"

export function formatFillClock(at: number): string {
  return new Date(at).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

export function fillNoticeDescription(opts: {
  side: string
  amount: bigint
  decimals: number
  symbol: string
  at: number
}): string {
  const qty = formatTokenAmount(opts.amount, opts.decimals)
  return `${opts.side} ${qty} ${opts.symbol} · ${formatFillClock(opts.at)}`
}
