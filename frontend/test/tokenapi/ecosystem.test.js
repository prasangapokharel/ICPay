import { IC_API_BASE, assert, getJson } from "./client.js"

export async function run() {
  const rate = await getJson(`${IC_API_BASE}/api/v3/icp-usd-rate`)
  assert(Array.isArray(rate.icp_usd_rate) && rate.icp_usd_rate.length > 0, "icp usd")
  const value = Number(rate.icp_usd_rate[0][1])
  assert(value > 0, "rate positive")
  console.log("ecosystem ok")
}
