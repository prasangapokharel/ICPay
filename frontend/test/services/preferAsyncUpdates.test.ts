import { preferAsyncUpdates } from "../../services/icp"
import type { HttpAgent, UpdateOptions } from "@icp-sdk/core/agent"

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg)
}

const seen: UpdateOptions[] = []
const fake = {
  update: async (_id: string, fields: UpdateOptions) => {
    seen.push(fields)
    return { reply: new Uint8Array() }
  },
} as unknown as HttpAgent

preferAsyncUpdates(fake)
await fake.update("aaaaa-aa", { methodName: "x", arg: new Uint8Array(), effectiveCanisterId: "aaaaa-aa" })
assert(seen[0]?.callSync === false, "defaults callSync false")

seen.length = 0
await fake.update("aaaaa-aa", {
  methodName: "x",
  arg: new Uint8Array(),
  effectiveCanisterId: "aaaaa-aa",
  callSync: true,
})
assert(seen[0]?.callSync === true, "keeps explicit true")

console.log("preferAsyncUpdates ok")
