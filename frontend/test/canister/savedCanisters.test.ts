import assert from "node:assert/strict"
import {
  listSavedCanisters,
  rememberCanister,
  shortCanisterId,
} from "@/lib/canister/savedCanisters"

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
rememberCanister(principal, "ccccc-cc")
rememberCanister(principal, "bbbbb-bb")
assert.deepEqual(listSavedCanisters(principal), ["bbbbb-bb", "ccccc-cc"])
assert.equal(shortCanisterId("abc"), "abc")
assert.ok(shortCanisterId("aaaaa-bbbbb-ccccc-ddddd-cai").includes("…"))

console.log("PASS: saved canisters")
