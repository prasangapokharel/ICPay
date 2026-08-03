// Rolls the mainnet backend canister back to an earlier commit.
//
//   npm run ci backend:rollback <git-ref> [expected-module-hash]
//
// The IC keeps no archive of past wasms, so a module hash alone cannot be
// restored -- it is a fingerprint, not an artifact. The wasm has to be rebuilt
// from the commit that produced it. A canister's module hash is exactly the
// sha256 of its wasm, so passing the hash you are rolling back TO lets this
// prove it rebuilt the right code before touching mainnet.
import { execFileSync, spawnSync } from "node:child_process"
import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { BACKEND, CANISTER, arg, capture, confirm, dfx, moduleHash, run, step } from "../lib.ts"

const ref = arg(0)
const expected = arg(1)

if (!ref) {
  console.error("Usage: npm run ci backend:rollback <git-ref> [expected-module-hash]")
  console.error("\nRecent commits touching the backend:")
  console.error(capture("git", ["log", "-10", "--oneline", "--", "src"]))
  process.exit(1)
}

const current = moduleHash()
console.log(`Live module hash: ${current}`)

// Built in a throwaway worktree so the rollback never disturbs your working
// tree -- you keep whatever is checked out, uncommitted changes included.
const work = mkdtempSync(join(tmpdir(), "icpay-rollback-"))
const tree = join(work, "repo")
let added = false

// Registered on exit rather than in a finally: every guard below leaves via
// process.exit, which unwinds no finally block and would leak the worktree.
process.on("exit", () => {
  if (!added) return
  // --force because the build wrote .dfx artifacts into the worktree.
  spawnSync("git", ["worktree", "remove", "--force", tree], { cwd: BACKEND, stdio: "ignore" })
  rmSync(work, { recursive: true, force: true })
})

step(`CHECKOUT ${ref}`)
run("git", ["worktree", "add", "--detach", tree, ref])
added = true

const target = join(tree, "backend")

step("BUILD")
// Built for the real network: `--check` writes to .dfx/local, and a
// local-network wasm is not what gets installed on mainnet.
dfx(["build", CANISTER], target)

const wasm = join(target, ".dfx", "ic", "canisters", CANISTER, `${CANISTER}.wasm`)
const built = "0x" + execFileSync("sha256sum", [wasm], { encoding: "utf8" }).split(/\s+/)[0]

step("VERIFY")
console.log(`rebuilt from ${ref}: ${built}`)
if (expected) {
  console.log(`expected:            ${expected}`)
  if (built !== expected) {
    console.error("\nHash mismatch -- this commit does not rebuild to the wasm you asked for.")
    console.error("Refusing to deploy.")
    process.exit(1)
  }
  console.log("Match.")
} else {
  console.log("(no expected hash given, so the artifact is unverified)")
}

if (built === current) {
  console.log("\nAlready running this wasm. Nothing to do.")
  process.exit(0)
}

confirm(`roll the mainnet canister back to ${ref}`)

step("DEPLOY")
dfx(["canister", "install", CANISTER, "--mode", "upgrade", "--wasm", wasm, "--yes"], target)

step("RESULT")
console.log(`was: ${current}`)
console.log(`now: ${moduleHash()}`)
