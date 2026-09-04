import assert from "node:assert/strict"
import {
  formatBytes,
  formatModuleHash,
  parseCyclesT,
  parseRunStatus,
} from "@/lib/canister/format"
import {
  formatManageError,
  isControllerDenied,
} from "@/services/canister/management"
import { MINT_CYCLES_MEMO } from "@/services/canister/cyclesWallet"
import { CREATE_CANISTER_MEMO } from "@/services/canister/createCanister"
import { TOP_UP_CANISTER_MEMO } from "@/services/cycles/topUp"

assert.equal(formatBytes(0n), "0 B")
assert.equal(formatBytes(1024n), "1 KB")
assert.ok(formatBytes(1_500_000n).includes("MB"))

assert.equal(formatModuleHash(null), "—")
assert.equal(formatModuleHash(new Uint8Array([0xab, 0xcd])), "abcd")

assert.equal(parseRunStatus({ running: null }), "running")
assert.equal(parseRunStatus({ stopped: null }), "stopped")

assert.equal(parseCyclesT("1"), 1_000_000_000_000n)
assert.equal(parseCyclesT("1.5"), 1_500_000_000_000n)
assert.equal(parseCyclesT(""), null)
assert.equal(parseCyclesT("x"), null)

assert.equal(MINT_CYCLES_MEMO, 0x544e494dn)
assert.equal(CREATE_CANISTER_MEMO, 0x41455243n)
assert.equal(TOP_UP_CANISTER_MEMO, 0x50555054n)

const replicaDump = new Error(
  "The replica returned a rejection error: Request ID: abc Reject code: 5 Reject text: Caller 7pb7z-x"
)
assert.equal(isControllerDenied(replicaDump), true)
assert.equal(
  formatManageError(replicaDump),
  "Your Internet Identity is not a controller of this canister."
)

const nested = Object.assign(new Error("AgentError"), {
  cause: {
    code: { rejectCode: 5, rejectMessage: "Caller xyz is not a controller" },
  },
})
assert.equal(isControllerDenied(nested), true)

console.log("PASS: canister format + CMC memos + manage errors")
