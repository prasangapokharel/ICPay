import assert from "node:assert/strict"
import { Principal } from "@icp-sdk/core/principal"
import {
  CREATE_CANISTER_FEE_CYCLES,
  CREATE_CANISTER_MEMO,
  MIN_CREATE_E8S,
  buildCreateSettings,
  cmcCreateAccount,
  formatCreateCanisterError,
} from "@/services/canister/createCanister"
import { CMC_CANISTER_ID } from "@/services/chainkey/constants"
import {
  countryCodeFromRegion,
  flagCountryCode,
  formatSubnetCountries,
  shortSubnetId,
} from "@/services/canister/subnetLocations"

assert.equal(CREATE_CANISTER_MEMO, 0x41455243n)
assert.equal(CREATE_CANISTER_FEE_CYCLES, 500_000_000_000n)
assert.equal(MIN_CREATE_E8S, 50_000_000n)

const controller = Principal.fromText("aaaaa-aa")
const account = cmcCreateAccount(controller)
assert.ok(account.toHex().length === 64)

const none = buildCreateSettings(controller, [])
assert.equal(none, null)

const withExtra = buildCreateSettings(controller, ["ryjl3-tyaaa-aaaaa-aaaba-cai"])
assert.ok(withExtra)
assert.ok(withExtra.controllers[0])
assert.equal(withExtra.controllers[0]!.length, 2)

assert.ok(formatCreateCanisterError(new Error("Refunded")).includes("refunded"))
assert.ok(CMC_CANISTER_ID.length > 0)

console.log("PASS: createCanister helpers")

assert.equal(countryCodeFromRegion("North America,CA,Ontario"), "CA")
assert.equal(countryCodeFromRegion("Europe,DE,Hessen"), "DE")
assert.equal(formatSubnetCountries(["CA", "JP", "US"]), "CA · JP · US")
assert.equal(flagCountryCode("UK"), "gb")
assert.equal(flagCountryCode("CA"), "ca")
assert.ok(shortSubnetId("abcdefghij-rest-of-long-id").includes("…"))
console.log("PASS: subnetLocations")
