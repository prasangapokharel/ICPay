import { run as tokens } from "./tokens.test.js"
import { run as pools } from "./pools.test.js"
import { run as discovery } from "./discovery.test.js"
import { run as ecosystem } from "./ecosystem.test.js"

const suites = [
  ["tokens", tokens],
  ["pools", pools],
  ["discovery", discovery],
  ["ecosystem", ecosystem],
]

let failed = 0
for (const [name, run] of suites) {
  try {
    await run()
  } catch (err) {
    failed++
    console.error(`${name} failed:`, err.message || err)
  }
}

if (failed) {
  console.error(`\nofficial market apis: ${failed} suite(s) failed`)
  process.exit(1)
}
console.log("\nofficial market apis: all suites passed")
