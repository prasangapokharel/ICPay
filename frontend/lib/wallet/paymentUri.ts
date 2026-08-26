import { decodePayment } from "@icp-sdk/canisters/ledger/icrc"
import { parseAddress, type ScannedAddress } from "@/lib/wallet/icpAddress"
import {
  CKBTC_LEDGER_ID,
  CKETH_LEDGER_ID,
} from "@/services/chainkey/constants"
import { ICP_LEDGER_ID } from "@/services/tokens"

const CKUSDC_LEDGER_ID = "xevnm-gaaaa-aaaar-qafnq-cai"
const CKUSDT_LEDGER_ID = "cngnf-vqaaa-aaaar-qag4q-cai"

const TOKEN_LEDGER: Record<string, string> = {
  icp: ICP_LEDGER_ID,
  ckbtc: CKBTC_LEDGER_ID,
  bitcoin: CKBTC_LEDGER_ID,
  btc: CKBTC_LEDGER_ID,
  cketh: CKETH_LEDGER_ID,
  ethereum: CKETH_LEDGER_ID,
  eth: CKETH_LEDGER_ID,
  ckusdc: CKUSDC_LEDGER_ID,
  ckusdt: CKUSDT_LEDGER_ID,
}

export type IcrcPaymentScan = {
  hit: ScannedAddress
  ledgerId?: string
  amount?: string
}

export function parseIcrcPaymentUri(raw: string): IcrcPaymentScan | null {
  const trimmed = raw.trim()
  const decoded = decodePayment(trimmed)
  if (!decoded) return null

  const hit = parseAddress(decoded.identifier)
  if (!hit) return null

  const tokenKey = decoded.token.toLowerCase()
  const ledgerId = TOKEN_LEDGER[tokenKey]

  return {
    hit,
    ledgerId,
    amount: decoded.amount !== undefined ? String(decoded.amount) : undefined,
  }
}

export function parseScannedPayment(raw: string): IcrcPaymentScan | null {
  return parseIcrcPaymentUri(raw)
}
