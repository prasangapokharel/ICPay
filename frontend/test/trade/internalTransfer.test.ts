import { internalTransferMax, nextTradeBalanceAfterInternal, walletDeltaAfterInternal, withLedgerBalance } from "../../lib/trade/fees"
import { tokensForInternalTransfer } from "../../lib/trade/transferableTokens"
import type { TokenHolding } from "../../services/tokens"

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg)
}

assert(internalTransferMax(true, 100n, 50n, 10n) === 100n, "trading to wallet")
assert(internalTransferMax(true, 0n, 50n, 10n) === 0n, "empty trading")
assert(internalTransferMax(false, 100n, 50n, 10n) === 40n, "wallet to trading after fee")
assert(internalTransferMax(false, 100n, 5n, 10n) === 0n, "wallet below fee")

const holdings: TokenHolding[] = [
  {
    ledgerId: "a",
    balance: 0n,
    symbol: "A",
    name: "A",
    decimals: 8,
    fee: 10n,
  },
  {
    ledgerId: "b",
    balance: 20n,
    symbol: "B",
    name: "B",
    decimals: 8,
    fee: 10n,
  },
]
const trades = new Map<string, bigint>([
  ["a", 5n],
  ["b", 0n],
])
assert(
  tokensForInternalTransfer(holdings, trades, true).map((t) => t.ledgerId).join() === "a",
  "only trading balance"
)
assert(
  tokensForInternalTransfer(holdings, trades, false).map((t) => t.ledgerId).join() === "b",
  "only wallet balance"
)
assert(tokensForInternalTransfer(holdings, trades, true)[0]?.balance === 5n, "shows trade bal")
assert(tokensForInternalTransfer(holdings, trades, false).every((t) => t.balance > 0n), "no zeros")
assert(nextTradeBalanceAfterInternal(100n, 30n, true) === 70n, "trade down")
assert(nextTradeBalanceAfterInternal(10n, 30n, true) === 0n, "trade clamp")
assert(nextTradeBalanceAfterInternal(5n, 30n, false) === 35n, "trade up")
assert(walletDeltaAfterInternal(30n, 10n, true) === 30n, "wallet up")
assert(walletDeltaAfterInternal(30n, 10n, false) === -40n, "wallet down")
assert(withLedgerBalance(new Map([["a", 1n]]), "b", 2n).get("b") === 2n, "map set")
console.log("internalTransfer ok")
