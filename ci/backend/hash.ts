import { CANISTER, moduleHash } from "../lib.ts"

// The module hash is the sha256 of the deployed wasm, so it is both the version
// marker and the argument `backend:rollback` verifies against.
console.log(moduleHash(CANISTER))
