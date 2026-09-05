import assert from "node:assert/strict"
import {
  forgetCanister,
  getSavedCanisterName,
  listSavedCanisterEntries,
  listSavedCanisters,
  rememberCanister,
  shortCanisterId,
} from "@/lib/canister/savedCanisters"
import { cyclesToTInput, parseCyclesT } from "@/lib/canister/format"

const store = new Map<string, string>()
const ls = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => {
    store.set(k, v)
  },
}
Object.defineProperty(globalThis, "window", { value: globalThis, configurable: true })
Object.defineProperty(globalThis, "localStorage", { value: ls, configurable: true })

const principal = "aaaaa-aa"
rememberCanister(principal, "bbbbb-bb")
rememberCanister(principal, "ccccc-cc", "Prod")
rememberCanister(principal, "bbbbb-bb", "Backup")
assert.deepEqual(listSavedCanisters(principal), ["bbbbb-bb", "ccccc-cc"])
assert.equal(getSavedCanisterName(principal, "bbbbb-bb"), "Backup")
assert.equal(getSavedCanisterName(principal, "ccccc-cc"), "Prod")
assert.equal(listSavedCanisterEntries(principal)[0]?.name, "Backup")
forgetCanister(principal, "bbbbb-bb")
assert.deepEqual(listSavedCanisters(principal), ["ccccc-cc"])
assert.equal(shortCanisterId("abc"), "abc")
assert.ok(shortCanisterId("aaaaa-bbbbb-ccccc-ddddd-cai").includes("…"))

assert.equal(cyclesToTInput(186_790_000_000n), "0.18679")
assert.equal(parseCyclesT("0.18679"), 186_790_000_000n)
assert.equal(cyclesToTInput(1_500_000_000_000n), "1.5")

console.log("PASS: saved canisters + cycles T input")
