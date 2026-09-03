import {
  ICRC_MAX_PAGES,
  isIcrcFetchAbort,
  shouldContinueIcrcPages,
} from "../../services/market/icrcApi"

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg)
}

assert(
  shouldContinueIcrcPages(0, 0, 500, "cursor-1") === true,
  "first page with cursor continues",
)
assert(
  shouldContinueIcrcPages(ICRC_MAX_PAGES, 100, 500, "cursor-2") === false,
  "stops at max pages",
)
assert(
  shouldContinueIcrcPages(2, 500, 500, "cursor-3") === false,
  "stops when token limit reached",
)
assert(
  shouldContinueIcrcPages(2, 100, 500, null) === false,
  "stops without next cursor",
)
assert(ICRC_MAX_PAGES === 10, "max pages is 10")
assert(isIcrcFetchAbort({ name: "AbortError" }) === true, "aborted fetch is silent")
assert(
  isIcrcFetchAbort({ digest: "HANGING_PROMISE_REJECTION" }) === true,
  "prerender hang is silent",
)
assert(isIcrcFetchAbort(new Error("network down")) === false, "real errors still log")

console.log("icrcApi pagination ok")
