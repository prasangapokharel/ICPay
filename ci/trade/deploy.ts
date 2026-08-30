import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import {
  BACKEND,
  WALLET_CANISTER_ID,
  canisterIds,
  confirm,
  dfx,
  dfxOut,
  moduleHash,
  run,
  step,
} from "../lib.ts"

const TRADE = "icpay_trade"
const TREASURY = "ni5n2-efxui-dyqdu-2mnpr-atclq-d6snc-zdq5q-u6ibz-ibpkq-brjpj-gqe"
const CREATE_CYCLES = "1000000000000"
const tradeDir = resolve(dirname(fileURLToPath(import.meta.url)), "../../backend/rust/trade")

step("TRADE TESTS")
run("bash", ["scripts/run-trade-tests.sh"], BACKEND)

step("TRADE BUILD")
run("bash", ["scripts/build-trade.sh"], BACKEND)

const ids = canisterIds()
const canisterId = ids[TRADE]?.ic
const deployed = Boolean(canisterId)
const before = deployed ? moduleHash(TRADE) : "not deployed"
console.log(`\nCurrent module hash: ${before}`)
console.log(`Cycles ledger: ${dfxOut(["cycles", "balance"])}`)
if (canisterId) console.log(`Canister id: ${canisterId}`)

const wallet = WALLET_CANISTER_ID
if (!wallet) {
  console.error("icp_wallet_backend id missing from backend/canister_ids.json")
  process.exit(1)
}

const initArg = `(record { wallet_canister = principal "${wallet}"; treasury = principal "${TREASURY}" })`

confirm(deployed ? "upgrade icpay_trade on mainnet" : "create and install icpay_trade on mainnet")

step("DEPLOY")
if (deployed) {
  dfx(["deploy", TRADE, "--argument", initArg, "--yes"], BACKEND)
} else {
  dfx(
    ["deploy", TRADE, "--argument", initArg, "--yes", "--with-cycles", CREATE_CYCLES],
    BACKEND,
  )
}

step("RESULT")
const after = moduleHash(TRADE)
console.log(`after: ${after}`)
const id = canisterIds()[TRADE]?.ic ?? canisterId ?? "(unknown)"
console.log(`\nicpay_trade canister id: ${id}`)
console.log(`\nTop up: npm run ci cycles:topup 500000000000 trade`)
