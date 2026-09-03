import { ICPSWAP_BASE, assert, getJson } from "./client.js"

export async function run() {
  const pools = await getJson(`${ICPSWAP_BASE}/pool/all`)
  assert(pools.code === 200, "pool code")
  assert(Array.isArray(pools.data) && pools.data.length > 0, "pools")

  const tokens = await getJson(`${ICPSWAP_BASE}/token/all`)
  assert(tokens.code === 200, "token code")
  assert(Array.isArray(tokens.data) && tokens.data.length > 0, "tokens")

  const protocol = await getJson(`${ICPSWAP_BASE}/global/protocol`)
  assert(protocol.code === 200, "protocol code")
  assert(Number(protocol.data?.tvlUSD) > 0, "tvl")

  console.log("pools ok")
}
