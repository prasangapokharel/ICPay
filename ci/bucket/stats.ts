import { spawnSync } from "node:child_process"
import { BACKEND, CANISTER, dfxOut, network } from "../lib.ts"

// npm run ci bucket:stats
//
// Cloud bucket rollup + cycle runway so you know when to top up.
// Calls getBucketCloudStats on the canister (storage sold, files, burn rate)
// and canister:status (idle burn the storage-only estimate misses).

const CYCLES_PER_ICP = 1_000_000_000_000

const env = { ...process.env, DFX_WARNING: "-mainnet_plaintext_identity" }

function tryQuery(method: string): string | null {
  const res = spawnSync(
    "dfx",
    ["canister", "call", CANISTER, method, "--query", "--network", network()],
    { cwd: BACKEND, env, encoding: "utf8" },
  )
  if (res.status !== 0) return null
  return res.stdout?.trim() ?? null
}

type CloudStats = {
  bucketCount: number
  activeBuckets: number
  expiredBuckets: number
  fileCount: number
  storageUsedBytes: number
  capacityBytes: number
  utilizationPercent: number
  estimatedCapacityRevenueE8s: number
  cyclesBalance: number
  cyclesDailyBurn: number
  cyclesMonthlyBurn: number
  cyclesStatus: string
  canAcceptNewBuckets: boolean
  estimatedDaysRemaining: number
  recommendedTopUpCycles: number
}

function fieldNum(text: string, name: string): number {
  const raw = text.match(new RegExp(`${name} = ([\\d_]+)`))?.[1]
  return raw ? Number(raw.replaceAll("_", "")) : 0
}

function fieldText(text: string, name: string): string {
  return text.match(new RegExp(`${name} = "([^"]+)"`))?.[1] ?? ""
}

function fieldBool(text: string, name: string): boolean {
  const raw = text.match(new RegExp(`${name} = (true|false)`))?.[1]
  return raw === "true"
}

function parseCloudStats(candid: string): CloudStats | null {
  if (!candid.includes("variant { ok")) return null
  return {
    bucketCount: fieldNum(candid, "bucketCount"),
    activeBuckets: fieldNum(candid, "activeBuckets"),
    expiredBuckets: fieldNum(candid, "expiredBuckets"),
    fileCount: fieldNum(candid, "fileCount"),
    storageUsedBytes: fieldNum(candid, "storageUsedBytes"),
    capacityBytes: fieldNum(candid, "capacityBytes"),
    utilizationPercent: fieldNum(candid, "utilizationPercent"),
    estimatedCapacityRevenueE8s: fieldNum(candid, "estimatedCapacityRevenueE8s"),
    cyclesBalance: fieldNum(candid, "cyclesBalance"),
    cyclesDailyBurn: fieldNum(candid, "cyclesDailyBurn"),
    cyclesMonthlyBurn: fieldNum(candid, "cyclesMonthlyBurn"),
    cyclesStatus: fieldText(candid, "cyclesStatus"),
    canAcceptNewBuckets: fieldBool(candid, "canAcceptNewBuckets"),
    estimatedDaysRemaining: fieldNum(candid, "estimatedDaysRemaining"),
    recommendedTopUpCycles: fieldNum(candid, "recommendedTopUpCycles"),
  }
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`
  return `${(n / 1024 ** 3).toFixed(2)} GB`
}

function formatT(cycles: number): string {
  return `${(cycles / 1e12).toFixed(2)}T`
}

function formatIcpFromCycles(cycles: number): string {
  return `${(cycles / CYCLES_PER_ICP).toFixed(2)} ICP`
}

function formatIcpE8s(e8s: number): string {
  return `${(e8s / 1e8).toFixed(2)} ICP`
}

const statusRaw = dfxOut(["canister", "status", CANISTER])
const balance = Number(statusRaw.match(/Balance: ([\d_]+)/)?.[1]?.replaceAll("_", "") ?? "0")
const idlePerDay = Number(
  statusRaw.match(/Idle cycles burned per day: ([\d_]+)/)?.[1]?.replaceAll("_", "") ?? "0",
)

const raw = tryQuery("getBucketCloudStats")
const cloud = raw ? parseCloudStats(raw) : null
if (!cloud) {
  console.log("getBucketCloudStats not on this canister yet — deploy backend first.\n")
}

if (cloud) {
  const storageGB = cloud.storageUsedBytes / 1e9
  const capacityGB = cloud.capacityBytes / 1e9
  const totalDailyBurn = cloud.cyclesDailyBurn + idlePerDay
  const totalMonthlyBurn = totalDailyBurn * 30
  const daysAtTotalBurn =
    totalDailyBurn > 0 ? Math.floor(cloud.cyclesBalance / totalDailyBurn) : 999
  const target60d = totalDailyBurn * 60
  const topUpTotal =
    cloud.cyclesBalance >= target60d ? 0 : target60d - cloud.cyclesBalance

  console.log("=== ICPay Cloud — bucket stats ===\n")
  console.log(`Buckets   ${cloud.bucketCount} total  (${cloud.activeBuckets} active, ${cloud.expiredBuckets} expired)`)
  console.log(`Files     ${cloud.fileCount}`)
  console.log(
    `Storage   ${formatBytes(cloud.storageUsedBytes)} used / ${formatBytes(cloud.capacityBytes)} sold (${cloud.utilizationPercent}% full)`,
  )
  console.log(`          ${storageGB.toFixed(2)} GB used / ${capacityGB.toFixed(2)} GB capacity tiers sold`)
  console.log(
    `Revenue   ~${formatIcpE8s(cloud.estimatedCapacityRevenueE8s)} at create/renew list prices (treasury, not cycles)`,
  )

  console.log("\n=== Cycles (canister) ===\n")
  console.log(`Balance   ${cloud.cyclesBalance.toLocaleString("en-US")}  (${formatT(cloud.cyclesBalance)})`)
  console.log(`Status    ${cloud.cyclesStatus}${cloud.canAcceptNewBuckets ? "" : " — new buckets blocked"}`)
  console.log(`Storage burn   ${formatT(cloud.cyclesDailyBurn)}/day  (${formatIcpFromCycles(cloud.cyclesMonthlyBurn)}/30d)`)
  console.log(`Idle burn      ${formatT(idlePerDay)}/day  (canister base, not in storage estimate)`)
  console.log(`Total burn     ${formatT(totalDailyBurn)}/day  (~${daysAtTotalBurn} days at current usage)`)

  console.log("\n=== Top up ===\n")
  if (topUpTotal > 0) {
    console.log(`Suggested   ${formatT(topUpTotal)} cycles (~${formatIcpFromCycles(topUpTotal)} equiv)`)
    console.log(`            to reach ~60 days runway (storage + idle)`)
    console.log(`\n  npm run ci cycles:convert <icp>`)
    console.log(`  npm run ci cycles:topup ${topUpTotal}`)
  } else {
    console.log(`Runway OK   ~${daysAtTotalBurn} days at total burn — no top-up needed now`)
  }

  if (cloud.recommendedTopUpCycles > 0 && topUpTotal === 0) {
    console.log(
      `\nNote: canister suggests ${formatT(cloud.recommendedTopUpCycles)} for storage-only 60d target.`,
    )
  }
} else {
  console.log("=== Cycles (canister only) ===\n")
  console.log(`Balance   ${balance.toLocaleString("en-US")}  (${formatT(balance)})`)
  console.log(`Idle burn ${formatT(idlePerDay)}/day`)
  if (idlePerDay > 0) {
    console.log(`Runway    ~${Math.floor(balance / idlePerDay)} days (idle only)`)
  }
  console.log("\nDeploy backend with getBucketCloudStats, then re-run: npm run ci bucket:stats")
}
