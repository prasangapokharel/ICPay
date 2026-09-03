import { ICP_LEDGER_ID, ICPAY_LEDGER_ID } from "../../services/tokens"
import { canSelectTradeBase, isTerminalPairBase } from "../../lib/market/tradePairs"
import { tradePairHref } from "../../lib/market/pairSlug"
import {
  mergeWatchlistRows,
  pinWatchlistRows,
  upsertCustomWatchlist,
} from "../../lib/market/customWatchlist"
import type { TerminalPairRow } from "../../services/market/tradePairSnapshot"

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg)
}

function row(id: string, symbol: string): TerminalPairRow {
  return {
    baseLedgerId: id,
    hasPool: false,
    stats: null,
    base: {
      ledgerId: id,
      name: symbol,
      symbol,
      decimals: 8,
      fee: 10000n,
      totalSupply: 0n,
      mintingAccount: null,
      supportedStandards: [],
      indexCanisterId: null,
      logoUrl: null,
    },
  }
}

assert(isTerminalPairBase(ICPAY_LEDGER_ID) === false, "icpay stays off default list")
assert(canSelectTradeBase(ICPAY_LEDGER_ID) === true, "icpay is selectable once added")
assert(canSelectTradeBase(ICP_LEDGER_ID) === false, "quote is not a base")

const icpay = row(ICPAY_LEDGER_ID, "ICPAY")
const ckbtc = row("mxzaz-hqaaa-aaaar-qaada-cai", "ckBTC")
const merged = mergeWatchlistRows([ckbtc, icpay], [icpay])
assert(merged[0]?.baseLedgerId === ICPAY_LEDGER_ID, "custom first")
assert(merged.length === 2, "deduped")

const added = upsertCustomWatchlist([ckbtc], icpay)
assert(added[0]?.baseLedgerId === ICPAY_LEDGER_ID, "upsert pins new")
assert(upsertCustomWatchlist(added, icpay).length === 2, "upsert replaces")

const pinned = pinWatchlistRows([ckbtc, icpay], [ICPAY_LEDGER_ID])
assert(pinned[0]?.baseLedgerId === ICPAY_LEDGER_ID, "pin after volume sort")

const href = tradePairHref("ICPAY", ICPAY_LEDGER_ID, [
  { symbol: "ICPAY", ledgerId: ICPAY_LEDGER_ID },
], true)
assert(href.includes("base=" + ICPAY_LEDGER_ID), "custom href keeps ledger")
assert(href.startsWith("/market/trade/ICPAY_ICP"), "custom slug")

console.log("customWatchlist ok")
