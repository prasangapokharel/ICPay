// Uploads the ICRC-1 ledger wasm into the backend's chunk store and seals it.
//
//   npm run ci backend:wasm
//
// Until this runs, isTokenLaunchReady is false and every launch is refused.
// This decides what code every token ever launched here will run, so the
// artifact is pinned to a release and its checksum is verified before a single
// byte is sent -- not fetched from whatever the tag points at today.
import { execFileSync } from "node:child_process"
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { BACKEND, CANISTER, confirm, dfxOut, run, step } from "../lib.ts"

const RELEASE = "ledger-suite-icrc-2026-03-09"
const ASSET = "ic-icrc1-ledger.wasm.gz"
// From the release's SHA256SUMS. A canister's module hash is exactly the sha256
// of the module as submitted, so this one constant is both the download check
// and the value we seal against.
const SHA256 = "354dd6ecfdc72b5409805b31dea22c9db11df6e14095a5a68924eb63535e6d8a"

// The management canister caps a chunk at 1 MiB. Kept under it rather than at
// it, since the wrapper's own candid envelope rides along in the same message.
const CHUNK_BYTES = 1_000_000

const work = mkdtempSync(join(tmpdir(), "icpay-wasm-"))
process.on("exit", () => rmSync(work, { recursive: true, force: true }))

const wasmPath = join(work, ASSET)

step("DOWNLOAD")
console.log(`${RELEASE} / ${ASSET}`)
run("curl", ["-sSfL", "-o", wasmPath, `https://github.com/dfinity/ic/releases/download/${RELEASE}/${ASSET}`], work)

step("VERIFY")
const actual = execFileSync("sha256sum", [wasmPath], { encoding: "utf8" }).split(/\s+/)[0]
console.log(`expected: ${SHA256}`)
console.log(`actual:   ${actual}`)
if (actual !== SHA256) {
  console.error("\nChecksum mismatch -- this is not the audited wasm. Refusing to upload.")
  process.exit(1)
}
console.log("Match.")

const wasm = readFileSync(wasmPath)
const chunks: Buffer[] = []
for (let i = 0; i < wasm.length; i += CHUNK_BYTES) chunks.push(wasm.subarray(i, i + CHUNK_BYTES))
console.log(`\n${wasm.length} bytes in ${chunks.length} chunk(s)`)

// dfx takes the argument as candid text, so the bytes go through as \xx
// escapes in a file -- a blob this size will not fit on a command line.
function blobArg(bytes: Buffer): string {
  const file = join(work, "arg.did")
  writeFileSync(file, `(blob "${bytes.toString("hex").replace(/../g, (b) => "\\" + b)}")`)
  return file
}

const call = (method: string, argFile: string): string =>
  dfxOut(["canister", "call", CANISTER, method, "--argument-file", argFile, "--output", "json"], BACKEND)

function expectOk(method: string, out: string): void {
  if (out.includes('"err"') || !out.includes('"ok"')) {
    console.error(`\n${method} was rejected:\n${out}`)
    process.exit(1)
  }
}

confirm("replace the ledger wasm every future token launch will install")

// Reset first, unconditionally. uploadChunk appends, and nothing exposes the
// recorded chunk list to read back -- so a re-run without this would leave a
// list describing a wasm twice over.
step("RESET")
expectOk("resetTokenWasm", dfxOut(["canister", "call", CANISTER, "resetTokenWasm", "--output", "json"], BACKEND))
console.log("chunk store cleared")

step("UPLOAD")
chunks.forEach((chunk, i) => {
  const out = call("uploadTokenWasmChunk", blobArg(chunk))
  expectOk("uploadTokenWasmChunk", out)
  console.log(`chunk ${i + 1}/${chunks.length} · ${chunk.length} bytes`)
})

step("SEAL")
expectOk("sealTokenWasm", call("sealTokenWasm", blobArg(Buffer.from(SHA256, "hex"))))
console.log(`sealed against 0x${SHA256}`)

step("RESULT")
const ready = dfxOut(["canister", "call", CANISTER, "isTokenLaunchReady", "--output", "json"], BACKEND)
console.log(`isTokenLaunchReady: ${ready}`)
if (ready.trim() !== "true") {
  console.error("\nStill not ready -- launches remain refused.")
  process.exit(1)
}
console.log("\nToken launches are live.")
