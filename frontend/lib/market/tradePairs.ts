import {
  ICP_LEDGER_ID,
  ICPAY_LEDGER_ID,
  PINNED_LEDGER_IDS,
} from "@/services/tokens"

/** SNS BOOM — verified on ICRC API. */
export const TERMINAL_EXTRA_BASES = ["vtrom-gqaaa-aaaaq-aabia-cai"]

export const TERMINAL_QUOTE_LEDGER_ID = ICP_LEDGER_ID

const ALLOWED_BASES = new Set(
  [...PINNED_LEDGER_IDS, ...TERMINAL_EXTRA_BASES].filter(
    (id) => id !== ICP_LEDGER_ID && id !== ICPAY_LEDGER_ID
  )
)

export function terminalPairKey(baseLedgerId: string): string {
  return `${baseLedgerId}:${TERMINAL_QUOTE_LEDGER_ID}`
}

export function isTerminalPairBase(ledgerId: string): boolean {
  return ALLOWED_BASES.has(ledgerId)
}

export function defaultTerminalBase(): string {
  return "mxzaz-hqaaa-aaaar-qaada-cai"
}
