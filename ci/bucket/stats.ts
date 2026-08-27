import { BACKEND, CANISTER, canisterIds, dfxOut, network } from "../lib.ts"

// npm run ci bucket:stats
//
// Cloud bucket rollup + real cycle runway (idle memory burn + logical storage).

const CYCLES_PER_ICP = 1_000_000_000_000

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
  if (!candid.includes("ok = record")) return null
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
  return `${(cycles / 1e12).toFixed(3)}T`
}

function formatIcpFromCycles(cycles: number): string {
  return `${(cycles / CYCLES_PER_ICP).toFixed(2)} ICP`
}

function formatIcpE8s(e8s: number): string {
  return `${(e8s / 1e8).toFixed(2)} ICP`
}

function canisterStatus(name: string) {
  const raw = dfxOut(["canister", "status", name])
  return {
    balance: Number(raw.match(/Balance: ([\d_]+)/)?.[1]?.replaceAll("_", "") ?? "0"),
    idlePerDay: Number(
      raw.match(/Idle cycles burned per day: ([\d_]+)/)?.[1]?.replaceAll("_", "") ?? "0",
    ),
    memoryBytes: Number(raw.match(/Memory Size: ([\d_]+)/)?.[1]?.replaceAll("_", "") ?? "0"),
  }
}

const backend = canisterStatus(CANISTER)
const blobId = canisterIds().icp_blob_store?.ic
let blob = { balance: 0, idlePerDay: 0, memoryBytes: 0, fileCount: 0, fileBytes: 0 }
if (blobId && network() === "ic") {
  blob = { ...canisterStatus("icp_blob_store"), fileCount: 0, fileBytes: 0 }
  try {
    const statsRaw = dfxOut(["canister", "call", blobId, "stats", "()", "--query"])
    blob.fileCount = fieldNum(statsRaw, "count")
    blob.fileBytes = fieldNum(statsRaw, "bytes")
  } catch {
    // blob store may be missing on local replica
  }
}

const cloudRaw = dfxOut(["canister", "call", CANISTER, "getBucketCloudStats", "()", "--query"])
const cloud = parseCloudStats(cloudRaw)

if (!cloud) {
  console.error("Could not parse getBucketCloudStats")
  process.exit(1)
}

const storageGB = cloud.storageUsedBytes / 1e9
const capacityGB = cloud.capacityBytes / 1e9
const totalDailyBurn = cloud.cyclesDailyBurn + backend.idlePerDay + blob.idlePerDay
const daysAtTotalBurn = totalDailyBurn > 0 ? Math.floor(cloud.cyclesBalance / totalDailyBurn) : 999
const target60d = totalDailyBurn * 60
const topUpTotal = cloud.cyclesBalance >= target60d ? 0 : target60d - cloud.cyclesBalance

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

console.log("\n=== Memory (canisters) ===\n")
console.log(`Backend   ${formatBytes(backend.memoryBytes)} billed  (${formatBytes(cloud.storageUsedBytes)} logical metadata)`)
if (blobId) {
  console.log(
    `Blob      ${formatBytes(blob.memoryBytes)} billed  (${formatBytes(blob.fileBytes)} logical in ${blob.fileCount} files)`,
  )
}
console.log(
  "\nNote: backend ghost stable pages and blob IC overhead inflate billed memory vs logical bytes.",
)
console.log("      CI/tests never upload to mainnet. SDK/live-test scripts need BUCKET_LIVE_TEST=1.")
console.log("      Reinstall is never an option — budget idle burn.")

console.log("\n=== Cycles ===\n")
console.log(`Balance   ${cloud.cyclesBalance.toLocaleString("en-US")}  (${formatT(cloud.cyclesBalance)})`)
console.log(`Status    ${cloud.cyclesStatus}${cloud.canAcceptNewBuckets ? "" : " — new buckets blocked"}`)
console.log(`Logical storage burn  ${formatT(cloud.cyclesDailyBurn)}/day  (metadata bytes only — often ~0)`)
console.log(`Backend idle burn     ${formatT(backend.idlePerDay)}/day  (real memory rent)`)
if (blobId) {
  console.log(`Blob store idle burn  ${formatT(blob.idlePerDay)}/day`)
}
console.log(`Total burn            ${formatT(totalDailyBurn)}/day  (~${daysAtTotalBurn} days runway)`)

console.log("\n=== Top up ===\n")
if (topUpTotal > 0) {
  console.log(`Suggested   ${formatT(topUpTotal)} cycles (~${formatIcpFromCycles(topUpTotal)} equiv)`)
  console.log(`            to reach ~60 days runway (idle + logical storage)`)
  console.log(`\n  npm run ci cycles:convert <icp>`)
  console.log(`  npm run ci cycles:topup ${topUpTotal}`)
} else {
  console.log(`Runway OK   ~${daysAtTotalBurn} days at total burn — no top-up needed now`)
}

if (cloud.recommendedTopUpCycles > 0 && topUpTotal === 0) {
  console.log(
    `\nNote: canister storage-only estimate suggests ${formatT(cloud.recommendedTopUpCycles)} for 60d.`,
  )
}
