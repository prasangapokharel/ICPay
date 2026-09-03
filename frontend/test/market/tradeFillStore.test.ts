import {
  addTradeFill,
  clearTradeFillNotice,
  getTradeFills,
  parseFills,
  patchTradeFill,
  serializeFills,
  setTradeFillNotice,
} from "../../lib/market/tradeFillStore"
import type { LocalFill } from "../../lib/market/tradeFillStore"

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg)
}

clearTradeFillNotice()
const fill: LocalFill = {
  id: "a",
  isBuy: true,
  amount: 1n,
  ledgerId: "x",
  symbol: "YUKU",
  decimals: 8,
  at: 1,
  status: "filling",
}
addTradeFill(fill)
assert(getTradeFills()[0]?.status === "filling", "added filling")
patchTradeFill("a", { status: "filled", id: "tx", blockIndex: 38100881n })
assert(getTradeFills()[0]?.status === "filled", "patched filled")
assert(getTradeFills()[0]?.id === "tx", "id replaced")
assert(getTradeFills()[0]?.blockIndex === 38100881n, "block")
setTradeFillNotice({
  kind: "filled",
  id: "tx",
  isBuy: true,
  symbol: "YUKU",
  amount: 1n,
  decimals: 8,
  at: 1,
})
clearTradeFillNotice()
const round = parseFills(serializeFills(getTradeFills()))
assert(round[0]?.blockIndex === 38100881n, "persist block")
console.log("tradeFillStore ok")
