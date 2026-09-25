import { OWNED_CANISTERS, dfxOut, resolveOwnedCanister } from "../lib.ts"

// npm run ci canister:health [backend|trade|frontend|blob]
const targetArg = process.argv.slice(3).filter((a) => !a.startsWith("--"))[0]
const targetCanisters = targetArg
  ? [resolveOwnedCanister(targetArg) ?? targetArg]
  : OWNED_CANISTERS.map((c) => c.name)

console.log("=== ICPay Canister Fleet Health & Diagnostics ===\n")

for (const canister of targetCanisters) {
  try {
    const raw = dfxOut(["canister", "status", canister])
    const statusMatch = raw.match(/Status: (\w+)/)
    const cyclesMatch = raw.match(/Balance: ([\d_]+) Cycles/)
    const memoryMatch = raw.match(/Memory Size: ([\d_]+) Bytes/)
    const moduleHashMatch = raw.match(/Module hash: (0x[0-9a-f]+)/)

    const status = statusMatch ? statusMatch[1] : "Unknown"
    const rawCycles = cyclesMatch ? BigInt(cyclesMatch[1].replace(/_/g, "")) : 0n
    const rawMemory = memoryMatch ? Number(memoryMatch[1].replace(/_/g, "")) : 0
    const moduleHash = moduleHashMatch ? moduleHashMatch[1] : "None"

    const tCycles = (Number(rawCycles / 1_000_000_000n) / 1000).toFixed(3)
    const memoryMB = (rawMemory / (1024 * 1024)).toFixed(2)

    console.log(`• Canister: ${canister}`)
    console.log(`  - Status:      ${status === "Running" ? "🟢 Running" : "🟡 " + status}`)
    console.log(`  - Cycles:      ${tCycles} TCycles (${rawCycles.toLocaleString()} cycles)`)
    console.log(`  - Memory:      ${memoryMB} MB (${rawMemory.toLocaleString()} bytes)`)
    console.log(`  - Module Hash: ${moduleHash}`)
    console.log("")
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.log(`• Canister: ${canister} (Error querying status: ${msg})`)
  }
}
