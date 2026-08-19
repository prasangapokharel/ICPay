import type { TransactionPublic } from '@/services/types'
import { formatTimeIso, formatTokenAmount, txStatusLabel } from '@/lib/wallet-utils'

function csvCell(value: string): string {
  if (value.includes('"') || value.includes(',') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function txTypeDisplay(tx: TransactionPublic): string {
  if ('deposit' in tx.txType) return 'deposit'
  if ('withdraw' in tx.txType) return 'withdraw'
  if ('transfer' in tx.txType) return 'transfer'
  if ('fee' in tx.txType) return 'fee'
  if ('swapIn' in tx.txType) return 'swap_in'
  if ('swapOut' in tx.txType) return 'swap_out'
  return 'transfer'
}

export function buildAnalyticsCsv(
  rows: TransactionPublic[],
  symbolForLedger: (ledgerId: string) => string,
): string {
  const header = [
    'date_utc',
    'type',
    'status',
    'amount',
    'fee',
    'token',
    'from',
    'to',
    'memo',
    'block_index',
    'transaction_id',
  ]

  const lines = rows.map((tx) => {
    const token = symbolForLedger(tx.ledgerId)
    return [
      csvCell(formatTimeIso(tx.createdAt)),
      csvCell(txTypeDisplay(tx)),
      csvCell(txStatusLabel(tx.status)),
      csvCell(formatTokenAmount(tx.amount, 8)),
      csvCell(formatTokenAmount(tx.fee, 8)),
      csvCell(token),
      csvCell(tx.from),
      csvCell(tx.to),
      csvCell(tx.memo[0] ?? ''),
      csvCell(tx.blockIndex[0]?.toString() ?? ''),
      csvCell(tx.id),
    ].join(',')
  })

  return [header.join(','), ...lines].join('\n')
}

export function downloadAnalyticsCsv(content: string, username: string): void {
  if (typeof document === 'undefined') return
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `icpay-analytics-${username.replace(/^@/, '')}-${new Date().toISOString().slice(0, 10)}.csv`
  anchor.click()
  URL.revokeObjectURL(url)
}

export function ledgerSymbolFallback(ledgerId: string): string {
  if (ledgerId === 'ryjl3-tyaaa-aaaaa-aaaba-cai') return 'ICP'
  return ledgerId.slice(0, 5).toUpperCase()
}
