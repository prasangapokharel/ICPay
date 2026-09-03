import { canisterDashboardUrl, looksLikeCanisterId } from "../../lib/market/canisterLink"

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg)
}

assert(looksLikeCanisterId("uizni-yiaaa-aaaag-qjrca-cai"), "pool id")
assert(!looksLikeCanisterId("No pool"), "empty")
assert(
  canisterDashboardUrl("abc-cai") ===
    "https://dashboard.internetcomputer.org/canister/abc-cai",
  "url"
)
console.log("canisterLink ok")
