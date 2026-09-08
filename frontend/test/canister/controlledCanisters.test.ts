import assert from "node:assert/strict"
import {
  mapApiCanister,
  normalizeControllers,
  subnetLabel,
} from "@/services/canister/controlledCanisters"

assert.deepEqual(normalizeControllers(["aaaaa-aa", "bbbbb-bb"]), ["aaaaa-aa", "bbbbb-bb"])
assert.deepEqual(normalizeControllers([["aaaaa-aa", ""], ["bbbbb-bb", "x"]]), [
  "aaaaa-aa",
  "bbbbb-bb",
])
assert.deepEqual(normalizeControllers(null), [])

const mapped = mapApiCanister(
  {
    canister_id: "ryjl3-tyaaa-aaaaa-aaaba-cai",
    name: " ICP Ledger ",
    subnet_id: "tdb26-jop6k-aogll-7ltgs-eruif-6kk7m-qpktf-gdiqx-mxtrf-vb5e6-eqe",
    module_hash: "abc",
    canister_type: "ledger",
    language: "motoko",
    updated_at: "2026-01-01T00:00:00Z",
    controllers: ["r7inp-6aaaa-aaaaa-aaabq-cai"],
    upgrades: [
      {
        proposal_id: 1,
        module_hash: "deadbeef",
        executed_timestamp_seconds: 1700000000,
      },
    ],
  },
  {
    "tdb26-jop6k-aogll-7ltgs-eruif-6kk7m-qpktf-gdiqx-mxtrf-vb5e6-eqe": {
      countries: ["CH", "DE"],
      nodeCount: 13,
    },
  }
)
assert.ok(mapped)
assert.equal(mapped!.name, "ICP Ledger")
assert.equal(mapped!.nodeCount, 13)
assert.equal(mapped!.language, "motoko")
assert.equal(mapped!.upgrades.length, 1)
assert.ok(subnetLabel(mapped!).includes("13 nodes"))
assert.equal(mapApiCanister({}, {}), null)

console.log("PASS: controlled canisters")
