// Moves stray ICPAY from the wallet canister's default ICRC account to treasury.
//
//   npm run ci backend:sweep-icpay
//
// Recovers ICPAY sent to 6vbhm… without the \02 sale subaccount. The presale
// vault (\02) and revenue slot (\01) are never touched.
//
// ICPAY sent to 5fsnk… (the ledger canister principal) lives on an account only
// that canister owns — ICPay cannot sweep it. Those tokens stay stuck unless the
// minting key holder mints replacements.
import { CANISTER, confirm, dfxOut, ICPAY_LEDGER_ID, step, WALLET_CANISTER_ID } from "../lib.ts"

step("BALANCES")
const defaultBal = dfxOut([
  "canister", "call", ICPAY_LEDGER_ID, "icrc1_balance_of",
  `(record { owner = principal "${WALLET_CANISTER_ID}"; subaccount = null })`,
  "--query",
])
const ledgerBal = dfxOut([
  "canister", "call", ICPAY_LEDGER_ID, "icrc1_balance_of",
  `(record { owner = principal "${ICPAY_LEDGER_ID}"; subaccount = null })`,
  "--query",
])
console.log(`6vbhm default (sweepable): ${defaultBal.trim()}`)
console.log(`5fsnk default (not sweepable): ${ledgerBal.trim()}`)

step("SWEEP")
confirm("move stray ICPAY from 6vbhm default account to treasury")

const out = dfxOut(["canister", "call", CANISTER, "sweepStrayIcpay", "--output", "json"])

if (out.includes('"err"')) {
  console.error(`\nSweep refused:\n${out}`)
  process.exit(1)
}

step("RESULT")
console.log(out)
console.log("\n5fsnk… balance is unchanged — only the ICPAY ledger can spend from that account.")
