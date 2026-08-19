// ci/feature/stats.ts
// npm run ci feature:stats
//
// Add matching line in ci/cli.ts:
//   "feature:stats": "feature/stats.ts",

import { CANISTER, dfxOut, step } from "../lib.ts"

step("FEATURE STATS")
console.log(dfxOut(["canister", "call", CANISTER, "getFeatureCount", "--query"]))
