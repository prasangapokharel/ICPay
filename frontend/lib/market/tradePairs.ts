import { ICP_LEDGER_ID, ICPAY_LEDGER_ID } from "@/services/tokens"

export const TERMINAL_QUOTE_LEDGER_ID = ICP_LEDGER_ID

export function terminalPairKey(baseLedgerId: string): string {
  return `${baseLedgerId}:${TERMINAL_QUOTE_LEDGER_ID}`
}

export function isTerminalPairBase(ledgerId: string): boolean {
  return ledgerId !== ICP_LEDGER_ID && ledgerId !== ICPAY_LEDGER_ID
}

export function defaultTerminalBase(): string {
  // ckBTC — highest ICP-denominated volume on ICPSwap
  return "mxzaz-hqaaa-aaaar-qaada-cai"
}
