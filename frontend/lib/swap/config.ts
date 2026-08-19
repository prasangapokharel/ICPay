import { ICPAY_LEDGER_ID } from "@/services/icpay/icpay"
import { ICP_LEDGER_ID, PINNED_LEDGER_IDS } from "@/services/tokens"

/** Mirrors backend Config.ICPSWAP_FACTORY. */
export const ICPSWAP_FACTORY_ID = "4mmnk-kiaaa-aaaag-qbllq-cai"

/** ICPSwap fee tiers tried lowest first (0.05%, 0.3%, 1%). */
export const ICPSWAP_FEE_TIERS = [500, 3000, 10_000] as const

const CHAIN_KEY_LEDGER_SET = new Set(PINNED_LEDGER_IDS)

export function isSwapBlocked(ledgerId: string): boolean {
  return ledgerId === ICPAY_LEDGER_ID
}

/** ICPSwap token standard label — must match backend SwapService.tokenStandard. */
export function icpSwapTokenStandard(ledgerId: string): "ICP" | "ICRC2" | "ICRC1" {
  if (ledgerId === ICP_LEDGER_ID) return "ICP"
  if (CHAIN_KEY_LEDGER_SET.has(ledgerId)) return "ICRC2"
  return "ICRC1"
}

export function swapPairKey(tokenA: string, tokenB: string): string {
  return tokenA < tokenB ? `${tokenA}#${tokenB}` : `${tokenB}#${tokenA}`
}
