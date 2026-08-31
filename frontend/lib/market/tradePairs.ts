import { ICP_LEDGER_ID, ICPAY_LEDGER_ID, PINNED_LEDGER_IDS } from "@/services/tokens"

export type TerminalPairSeed = {
  baseLedgerId: string
  symbol: string
  name: string
}

/** ICP-quoted pairs shown in the public terminal watchlist. */
export const TERMINAL_PAIR_SEEDS: TerminalPairSeed[] = [
  { baseLedgerId: "mxzaz-hqaaa-aaaar-qaada-cai", symbol: "ckBTC", name: "Chain-key Bitcoin" },
  { baseLedgerId: "ss2fx-dyaaa-aaaar-qacoq-cai", symbol: "ckETH", name: "Chain-key Ethereum" },
  { baseLedgerId: "xevnm-gaaaa-aaaar-qafnq-cai", symbol: "ckUSDC", name: "Chain-key USDC" },
  { baseLedgerId: "cngnf-vqaaa-aaaar-qag4q-cai", symbol: "ckUSDT", name: "Chain-key USDT" },
  { baseLedgerId: "vtrom-gqaaa-aaaan-qaf2q-cai", symbol: "BOOM", name: "BOOM" },
]

export const TERMINAL_QUOTE_LEDGER_ID = ICP_LEDGER_ID

export function terminalPairKey(baseLedgerId: string): string {
  return `${baseLedgerId}:${TERMINAL_QUOTE_LEDGER_ID}`
}

export function isTerminalPairBase(ledgerId: string): boolean {
  if (ledgerId === TERMINAL_QUOTE_LEDGER_ID) return false
  if (ledgerId === ICPAY_LEDGER_ID) return false
  return TERMINAL_PAIR_SEEDS.some((p) => p.baseLedgerId === ledgerId) || PINNED_LEDGER_IDS.includes(ledgerId)
}

export function defaultTerminalBase(): string {
  return TERMINAL_PAIR_SEEDS[0]?.baseLedgerId ?? "mxzaz-hqaaa-aaaar-qaada-cai"
}

export function findTerminalSeed(baseLedgerId: string): TerminalPairSeed | undefined {
  return TERMINAL_PAIR_SEEDS.find((p) => p.baseLedgerId === baseLedgerId)
}
