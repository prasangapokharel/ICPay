export const ICRC_BASE = "https://icrc-api.internetcomputer.org/api/v2"
export const ICPSWAP_BASE = "https://api.icpswap.com/info"
export const SNS_BASE = "https://sns-api.internetcomputer.org/api/v2"
export const IC_API_BASE = "https://ic-api.internetcomputer.org"

const GAP_MS = 400
let last = 0

export async function getJson(url) {
  const wait = Math.max(0, GAP_MS - (Date.now() - last))
  if (wait) await new Promise((r) => setTimeout(r, wait))
  last = Date.now()
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${url} → ${res.status}`)
  return res.json()
}

export function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}
